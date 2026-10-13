import re
import json
import requests
from typing import List, Dict, Any, Tuple
from urllib.parse import urlparse

class GitHubParser:
    """
    Parses GitHub repositories (URLs or local paths).
    Deterministically extracts technology facts from dependency files
    (requirements.txt, package.json, pyproject.toml) without LLM,
    and extracts documentation chunks from README.md.
    """

    @staticmethod
    def parse_repo_url(url: str) -> Tuple[str, str]:
        """Extracts (owner, repo) from a GitHub URL."""
        parsed = urlparse(url)
        path = parsed.path.strip("/")
        parts = path.split("/")
        if len(parts) >= 2:
            return parts[0], parts[1].replace(".git", "")
        return "", ""

    @classmethod
    def fetch_raw_file(cls, owner: str, repo: str, filepath: str, branch: str = "main") -> str:
        """Fetches raw text content of a file from GitHub."""
        branches = [branch, "master"]
        for b in branches:
            raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{b}/{filepath}"
            try:
                resp = requests.get(raw_url, timeout=10)
                if resp.status_code == 200:
                    return resp.text
            except Exception:
                continue
        return ""

    @classmethod
    def parse_requirements(cls, content: str, filename: str = "requirements.txt") -> List[Dict[str, Any]]:
        """Deterministically extracts tech facts from requirements.txt without LLM."""
        facts = []
        for line in content.splitlines():
            line_str = line.strip()
            if not line_str or line_str.startswith("#"):
                continue
            # Match package==version or package>=version or just package
            match = re.match(r"^([a-zA-Z0-9_\-\.]+)(?:([=<>!~]+.*))?$", line_str)
            if match:
                pkg_name = match.group(1)
                ver_spec = match.group(2) or ""
                claim = f"Uses {pkg_name} {ver_spec}".strip()
                facts.append({
                    "fact_type": "tech",
                    "claim": claim,
                    "source_span": line_str,
                    "source_file": filename,
                    "deterministic": True
                })
        return facts

    @classmethod
    def parse_package_json(cls, content: str, filename: str = "package.json") -> List[Dict[str, Any]]:
        """Deterministically extracts tech facts from package.json dependencies without LLM."""
        facts = []
        try:
            data = json.loads(content)
            deps = data.get("dependencies", {})
            dev_deps = data.get("devDependencies", {})
            all_deps = {**deps, **dev_deps}
            for pkg, ver in all_deps.items():
                span = f'"{pkg}": "{ver}"'
                facts.append({
                    "fact_type": "tech",
                    "claim": f"Uses {pkg} ({ver})",
                    "source_span": span,
                    "source_file": filename,
                    "deterministic": True
                })
        except Exception:
            pass
        return facts

    @classmethod
    def parse(cls, github_url: str) -> Dict[str, Any]:
        """
        Parses a GitHub repo URL into:
        - deterministic_facts: List[Dict]
        - text_chunks: List[Dict] for LLM extraction (README, etc.)
        """
        owner, repo = cls.parse_repo_url(github_url)
        results = {
            "owner": owner,
            "repo": repo,
            "deterministic_facts": [],
            "text_chunks": [],
            "raw_text": ""
        }

        if not owner or not repo:
            results["text_chunks"].append({
                "source_file": "github_url",
                "content": f"Repository URL: {github_url}",
                "span": github_url
            })
            return results

        # 1. Fetch README.md
        readme_content = cls.fetch_raw_file(owner, repo, "README.md")
        if readme_content:
            results["raw_text"] += f"\n--- README.md ---\n{readme_content}"
            # Chunk the README by headers/paragraphs
            sections = re.split(r"(?m)^(?=#{1,3}\s)", readme_content)
            for sec in sections:
                clean_sec = sec.strip()
                if clean_sec:
                    results["text_chunks"].append({
                        "source_file": "README.md",
                        "content": clean_sec,
                        "span": clean_sec[:120] + ("..." if len(clean_sec) > 120 else "")
                    })

        # 2. Fetch requirements.txt
        req_content = cls.fetch_raw_file(owner, repo, "requirements.txt")
        if req_content:
            results["raw_text"] += f"\n--- requirements.txt ---\n{req_content}"
            det_facts = cls.parse_requirements(req_content, "requirements.txt")
            results["deterministic_facts"].extend(det_facts)

        # 3. Fetch package.json
        pkg_content = cls.fetch_raw_file(owner, repo, "package.json")
        if pkg_content:
            results["raw_text"] += f"\n--- package.json ---\n{pkg_content}"
            det_facts = cls.parse_package_json(pkg_content, "package.json")
            results["deterministic_facts"].extend(det_facts)

        return results
