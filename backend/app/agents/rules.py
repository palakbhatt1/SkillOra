"""Rule-based Extractor / JD Analyzer. Safety net when Gemini is unavailable, and the validator for LLM output."""
import re

from ..config import MAX_FACTS_PER_SOURCE
from ..vocab import ACTION_RE, DEGREE_RE, METRIC_RE, find_skills, norm

BULLET_RE = re.compile(r"^\s*(?:[-*•▪◦·]|\d+[.)])\s+")


def classify(sentence: str) -> str:
    if DEGREE_RE.search(sentence):
        return "education"
    if METRIC_RE.search(sentence):
        return "metric"
    if ACTION_RE.search(sentence):
        return "experience"
    return "skill"


def extract_facts_rules(text: str, source_name: str, limit: int = MAX_FACTS_PER_SOURCE) -> list[dict]:
    """Return [{text, span, project, category}]. span is always a verbatim substring of `text`."""
    facts, seen = [], set()
    project = source_name.rsplit("/", 1)[-1].rsplit(".", 1)[0]
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        head = re.match(r"^#{1,3}\s+(.+)$", line)
        if head:
            project = head.group(1).strip()[:80]
            continue
        parts = [line] if BULLET_RE.match(raw) or len(line) < 220 else re.split(r"(?<=[.!?])\s+", line)
        for p in parts:
            s = BULLET_RE.sub("", p).strip()
            if not (28 <= len(s) <= 320):
                continue
            has_sig = bool(find_skills(s)) or bool(METRIC_RE.search(s)) or bool(DEGREE_RE.search(s)) or (bool(ACTION_RE.search(s)) and len(s) > 40)
            if not has_sig or s.lower().startswith(("http", "license", "copyright")):
                continue
            key = norm(s)
            if key in seen:
                continue
            seen.add(key)
            facts.append({"text": s.rstrip(), "span": s, "project": project, "category": classify(s)})
            if len(facts) >= limit:
                return facts
    return facts


def validate_facts(cands: list[dict], source_text: str, source_name: str, limit: int = MAX_FACTS_PER_SOURCE) -> list[dict]:
    """Anti-fabrication gate: a fact survives only if its quoted span really occurs in the source."""
    compact = re.sub(r"\s+", " ", source_text).lower()
    ok, seen = [], set()
    for c in cands:
        span = re.sub(r"\s+", " ", str(c.get("span", ""))).strip()
        text = str(c.get("text", "")).strip()
        if len(span) < 12 or span.lower() not in compact or not text or norm(text) in seen:
            continue
        seen.add(norm(text))
        cat = c.get("category") if c.get("category") in {"skill", "metric", "experience", "education"} else classify(text)
        text = re.sub(r"^(the candidate|candidate|the author|he|she|they)\s+", "", text, flags=re.I)
        text = text[:1].upper() + text[1:]
        ok.append({"text": text, "span": span, "project": (lambda p: source_name if p.strip().lower() in {"", "n/a", "none", "null", "general", "unknown"} else p)(str(c.get("project") or ""))[:80], "category": cat})
        if len(ok) >= limit:
            break
    return ok


# ------------------------------------------------------------------ JD analysis
MUST_HDR = re.compile(r"^(must[- ]have|required|requirements?|qualifications|what you.?ll need|you have)\b", re.I)
NICE_HDR = re.compile(r"^(nice[- ]to[- ]have|preferred|bonus|good to have|plus)\b", re.I)
DUTY_HDR = re.compile(r"^(you will|responsibilities|what you.?ll do|role|duties)\b", re.I)


def _split_items(s: str) -> list[str]:
    return [x.strip(" .;") for x in re.split(r",|;| and |\n", s) if len(x.strip(" .;")) > 2]


def analyze_jd_rules(jd: str) -> dict:
    lines = [l.strip() for l in jd.splitlines() if l.strip()]
    title, company = "", ""
    m = re.search(r"(?:hiring|looking for|seeking)\s+(?:an?\s+)?([A-Z][\w/&+ -]{3,60}?)(?:\s*\(|\s+to\b|\s+for\b|\.|,|\n|$)", jd)
    if m:
        title = m.group(1).strip()
    elif lines:
        title = re.sub(r"^(job title|title)\s*[:\-]\s*", "", lines[0], flags=re.I)[:80]
    cm = re.search(r"^([A-Z][\w&. -]{2,40}?)\s+is\s+(?:hiring|looking|seeking)", jd, re.M)
    if cm:
        company = cm.group(1).strip()
    sen = re.search(r"(\d+)\s*[–\-to]+\s*(\d+)\s*(?:\+\s*)?(?:yrs|years)", jd, re.I) or re.search(r"(\d+)\s*\+?\s*(?:yrs|years)", jd, re.I)
    seniority = (f"{sen.group(1)}–{sen.group(2)} years" if sen and sen.lastindex == 2 else f"{sen.group(1)}+ years") if sen else "not specified"

    reqs, section = [], "duty"
    for ln in lines:
        raw = BULLET_RE.sub("", ln).strip()
        hm = re.match(r"^([A-Za-z' -]{3,30})\s*[:\-]\s*(.*)$", raw)
        if hm and (MUST_HDR.match(hm.group(1)) or NICE_HDR.match(hm.group(1))):
            section = "must" if MUST_HDR.match(hm.group(1)) else "nice"
            for it in _split_items(hm.group(2)):
                reqs.append((section, it))
            continue
        if MUST_HDR.match(raw):
            section = "must"
            continue
        if NICE_HDR.match(raw):
            section = "nice"
            continue
        if DUTY_HDR.match(raw):
            section = "duty"
            continue
        if BULLET_RE.match(ln) and len(raw) > 8:
            reqs.append(("must" if section in ("must", "duty") else "nice", raw))

    out, seen = [], set()
    for lvl, text in reqs:
        key = norm(text)
        if key in seen or len(text) > 140:
            continue
        seen.add(key)
        sk = sorted(find_skills(text))
        cat = "education" if DEGREE_RE.search(text) else "skill" if sk and len(text.split()) <= 6 else "experience"
        out.append({"id": f"R{len(out) + 1}", "text": text[:120], "level": lvl, "category": cat, "skills": sk})
    if DEGREE_RE.search(jd) and not any(r["category"] == "education" for r in out):
        out.append({"id": f"R{len(out) + 1}", "text": "Relevant degree (B.Tech / B.E. / CS or related)", "level": "must", "category": "education", "skills": []})
    kws = sorted(find_skills(jd))
    return {"title": title or "Role", "company": company, "seniority": seniority, "requirements": out[:20], "skills": kws, "keywords": kws}
