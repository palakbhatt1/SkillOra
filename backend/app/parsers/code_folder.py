import os
from typing import Dict, Any, List
from app.parsers.github import GitHubParser

class CodeFolderParser:
    """Parses a local code directory or unzipped project repository."""

    @classmethod
    def parse(cls, folder_path: str) -> Dict[str, Any]:
        results = {
            "deterministic_facts": [],
            "text_chunks": [],
            "raw_text": ""
        }

        if not os.path.exists(folder_path):
            return results

        # Walk folder looking for documentation & dependency files
        for root, dirs, files in os.walk(folder_path):
            # Ignore hidden dirs and virtualenvs / node_modules
            dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("node_modules", "venv", "__pycache__", ".git")]

            for file in files:
                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, folder_path)
                
                # Check for dependency files
                if file.lower() == "requirements.txt":
                    try:
                        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                            results["deterministic_facts"].extend(
                                GitHubParser.parse_requirements(content, rel_path)
                            )
                            results["raw_text"] += f"\n--- {rel_path} ---\n{content}"
                    except Exception:
                        pass

                elif file.lower() == "package.json":
                    try:
                        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                            results["deterministic_facts"].extend(
                                GitHubParser.parse_package_json(content, rel_path)
                            )
                            results["raw_text"] += f"\n--- {rel_path} ---\n{content}"
                    except Exception:
                        pass

                elif file.lower().startswith("readme") and (file.endswith(".md") or file.endswith(".txt")):
                    try:
                        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                            results["raw_text"] += f"\n--- {rel_path} ---\n{content}"
                            for paragraph in content.split("\n\n"):
                                p_clean = paragraph.strip()
                                if p_clean:
                                    results["text_chunks"].append({
                                        "source_file": rel_path,
                                        "content": p_clean,
                                        "span": p_clean[:120] + ("..." if len(p_clean) > 120 else "")
                                    })
                    except Exception:
                        pass

        return results
