"""Structure-aware enrichment for resumes / documents (deterministic, no LLM).

The LLM extractor is good at bullets but skips skills lists and the italic "tech stack" line under each
project. This module adds them, and labels every fact as project | role | education | other from the
section header it appears under.
"""
import re

from ..vocab import find_skills, norm

HEADER_RE = re.compile(r"^[A-Z][A-Z &/,'’\-]{3,45}$")  # ALL-CAPS section header line
CONTACT_RE = re.compile(r"(@|linkedin\.com|github\.com|\+?\d[\d ()-]{8,}\d|https?://)", re.I)
SECTION_KIND = [
    (re.compile(r"^(projects?|personal projects?|academic projects?)\b", re.I), "project"),
    (re.compile(r"^(professional experience|experience|work experience|employment|internships?|work history)\b", re.I), "role"),
    (re.compile(r"^(education|academics?)\b", re.I), "education"),
    (re.compile(r"^(technical skills|skills|core competencies|tech stack)\b", re.I), "skills"),
    (re.compile(r"^(certifications?|achievements?|awards?|honou?rs)\b", re.I), "other"),
]


def _section(line: str) -> str | None:
    s = re.sub(r"\s+", " ", line.strip().replace("EXPERIENC E", "EXPERIENCE"))
    if not HEADER_RE.match(s) and len(s.split()) > 4:
        return None
    for rx, kind in SECTION_KIND:
        if rx.match(s) and (s.isupper() or len(s.split()) <= 3):
            return kind
    return "other" if HEADER_RE.match(s) and len(s.split()) <= 4 else None


def _lines_with_section(text: str):
    """Yield (offset, line, section_kind) for every line."""
    pos, section = 0, "other"
    for raw in text.split("\n"):
        k = _section(raw) if raw.strip() and not raw.lstrip().startswith(("•", "-", "*")) else None
        if k:
            section = k
        yield pos, raw, section, bool(k)
        pos += len(raw) + 1


def label_kinds(facts: list[dict], text: str) -> list[dict]:
    """kind = the section the fact's quoted span sits in (project | role | education | skills | other)."""
    spans = [(p, ln, sec) for p, ln, sec, is_head in _lines_with_section(text) if not is_head]
    for f in facts:
        probe = re.sub(r"\s+", " ", f["span"]).strip()[:40].lower()
        kind = f.get("kind")
        for _, ln, sec in spans:
            if probe and probe in re.sub(r"\s+", " ", ln).lower():
                kind = sec
                break
        f["_sec"] = kind
        f["kind"] = {"skills": "other"}.get(kind or "", kind) or "project"
        if f.get("category") == "education":
            f["kind"] = "education"
    return facts


def _clean_project(line: str) -> str:
    s = re.sub(r"\s+(19|20)\d{2}(\s*[–-]\s*((19|20)\d{2}|present))?\s*$", "", line.strip(), flags=re.I)
    s = re.split(r"\s+[—–]\s+|\s+-\s+", s)[0]
    s = re.sub(r"\s+(?:\w{3}\s+)?(19|20)\d{2}\s*[–-]\s*(?:\w{3}\s+)?(?:(19|20)\d{2}|present)\s*$", "", s, flags=re.I)
    return s.strip(" ·—–-")[:80]


def _split_items(line: str) -> list[str]:
    items, depth, cur = [], 0, ""
    for ch in line:
        depth += ch in "(["
        depth -= ch in ")]"
        if ch in ",;•" and depth <= 0:
            items.append(cur)
            cur = ""
        else:
            cur += ch
    items.append(cur)
    return [i.strip(" .\t") for i in items if 1 < len(i.strip(" .\t")) <= 48]


def skill_facts(text: str, limit: int = 80) -> list[dict]:
    """One fact per skill listed under a SKILLS header (the quoted span is the skill itself)."""
    out, seen, in_skills = [], set(), False
    for _, raw, sec, is_head in _lines_with_section(text):
        if is_head:
            in_skills = sec == "skills"
            continue
        if not in_skills or not raw.strip():
            continue
        body = raw.split(":", 1)[1] if ":" in raw[:40] else raw
        for it in _split_items(body):
            key = norm(it)
            if key in seen or len(it.split()) > 6 or it not in text:
                continue
            seen.add(key)
            out.append({"text": f"Skilled in {it}", "span": it, "project": "Skills", "category": "skill", "kind": "other"})
            if len(out) >= limit:
                return out
    return out


def stack_facts(text: str) -> list[dict]:
    """The comma-separated tech line right under a project/role header -> one 'built with' fact for that project."""
    lines = text.split("\n")
    out = []
    for i in range(1, len(lines)):
        ln = lines[i].strip()
        prev = lines[i - 1].strip()
        if not ln or ln.startswith(("•", "-", "*")) or not prev or prev.startswith(("•", "-", "*")) or ln.count(",") < 2:
            continue
        if ":" in ln[:40] or _section(prev) is not None:  # "Label: a, b" lines and anything right under a section header are skills lists
            continue
        items = _split_items(ln)
        hits = [it for it in items if find_skills(it)]
        if len(items) >= 3 and len(hits) >= max(2, len(items) // 2) and len(ln) < 160 and not ln.endswith("."):
            proj = _clean_project(prev)
            if proj:
                out.append({"text": f"Built with {', '.join(items)}", "span": ln, "project": proj, "category": "skill", "kind": "project"})
    return out


def enrich(facts: list[dict], text: str, limit: int) -> list[dict]:
    """LLM/rule facts + skill facts + project tech-stack facts, each labelled project|role|education|other."""
    facts = label_kinds(facts, text)
    stacks = stack_facts(text)
    drop = {s["span"].strip() for s in stacks}
    # rule-based extraction also turns contact lines / skills lines / tech lines into "facts": remove them (handled below)
    facts = [f for f in facts if f.get("_sec") != "skills" and f["span"].strip() not in drop and not CONTACT_RE.search(f["span"])]
    for f in facts:
        f.pop("_sec", None)
    for f in facts:  # "Hospiverse India - B2B HORECA Platform 2026" and "Hospiverse India" are the same project
        if f["project"] != "Skills":
            f["project"] = _clean_project(f["project"]) or f["project"]
    have = {norm(f["text"]) for f in facts}
    extra = []
    for f in stacks + skill_facts(text):
        if norm(f["text"]) not in have:
            have.add(norm(f["text"]))
            extra.append(f)
    # for project/role kinds, align stack-fact kind with the section its header sits in
    label_kinds([e for e in extra if e["project"] != "Skills"], text)
    for e in extra:
        e.pop("_sec", None)
    for e in extra:
        if e["project"] == "Skills":
            e["kind"] = "other"
    return (facts[:limit] + extra)[: limit + 90]  # bullets are capped; skill/stack facts are cheap and always kept
