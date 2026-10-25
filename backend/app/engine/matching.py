"""Deterministic Matcher core: exact -> fuzzy -> semantic. Used by the CrewAI Matcher agent as its tool."""
import math
import re
from collections import Counter

try:
    from rapidfuzz import fuzz
except ImportError:
    import difflib

    class _FuzzFallback:
        @staticmethod
        def token_set_ratio(s1: str, s2: str) -> float:
            t1 = " ".join(sorted(set(s1.split())))
            t2 = " ".join(sorted(set(s2.split())))
            return difflib.SequenceMatcher(None, t1, t2).ratio() * 100.0

    fuzz = _FuzzFallback()

from ..vocab import DEGREE_RE, find_skills, norm

STOP = set("a an the and or of in on to for with using use experience knowledge strong good proficiency skills ability years year working work etc".split())
EXACT_OK = {"verified"}  # only user-verified facts can support a requirement


def _tokens(s: str) -> list[str]:
    return [t for t in norm(s).split() if t not in STOP and len(t) > 1]


def _grams(s: str) -> Counter:
    t = _tokens(s)
    g = Counter(t)
    g.update(" ".join(p) for p in zip(t, t[1:]))
    for w in t:  # char trigrams give robustness to morphology (evaluate/evaluation)
        g.update(w[i : i + 3] for i in range(max(1, len(w) - 2)))
    return g


def semantic_sim(a: str, b: str) -> float:
    """Local semantic-ish similarity (n-gram cosine). No API call, fully deterministic."""
    ga, gb = _grams(a), _grams(b)
    dot = sum(ga[k] * gb[k] for k in ga.keys() & gb.keys())
    na = math.sqrt(sum(v * v for v in ga.values()))
    nb = math.sqrt(sum(v * v for v in gb.values()))
    return dot / (na * nb) if na and nb else 0.0


def fact_view(f) -> dict:
    return {"id": f.fid, "text": f.text, "span": f.span, "project": f.project, "category": f.category,
            "status": f.status, "declared": bool(f.declared), "kind": f.kind or "project", "source": f.source.name if f.source else "self-declared"}


def match_requirement(req: dict, facts: list[dict]) -> dict:
    usable = [f for f in facts if f["status"] in EXACT_OK]
    text = req["text"]
    skills = set(req.get("skills") or []) or find_skills(text)
    out = {"id": req["id"], "text": text, "level": req["level"], "category": req["category"],
           "match": "missing", "via": "none", "facts": [], "confidence": 0.0}

    # education requirement: look for a degree fact
    if req["category"] == "education":
        hits = [f for f in usable if f["category"] == "education" or DEGREE_RE.search(f["text"])]
        if hits:
            out.update(match="met", via="exact", facts=[h["id"] for h in hits[:2]], confidence=1.0)
        return out

    # tier 1: exact (synonym-aware) - every required skill appears in the fact
    if skills:
        hits = []
        for f in usable:
            got = find_skills(f["text"] + " " + f["span"])
            if skills <= got:
                hits.append((f, 1.0 if not f["declared"] else 0.6))
        if hits:
            hits.sort(key=lambda x: -x[1])
            out.update(match="met", via="exact", facts=[h[0]["id"] for h in hits[:3]], confidence=hits[0][1])
            return out
        partial = [(f, len(skills & find_skills(f["text"] + " " + f["span"])) / len(skills)) for f in usable]
        partial = [(f, s) for f, s in partial if s > 0]
        if partial:
            partial.sort(key=lambda x: -x[1])
            out.update(match="partial", via="exact", facts=[p[0]["id"] for p in partial[:3]], confidence=round(0.4 + 0.4 * partial[0][1], 2))
            return out

    # tier 2: fuzzy string match
    best = max(((fuzz.token_set_ratio(norm(text), norm(f["text"])), f) for f in usable), key=lambda x: x[0], default=(0, None))
    if best[0] >= 78:
        out.update(match="met" if best[0] >= 92 else "partial", via="fuzzy", facts=[best[1]["id"]], confidence=round(best[0] / 100, 2))
        return out

    # tier 3: semantic similarity
    sims = sorted(((semantic_sim(text, f["text"] + " " + f["span"]), f) for f in usable), key=lambda x: -x[0])
    if sims and sims[0][0] >= 0.30:
        out.update(match="partial", via="embedding", facts=[s[1]["id"] for s in sims[:2] if s[0] >= 0.25], confidence=round(sims[0][0], 2))
    return out


def match_all(requirements: list[dict], facts: list[dict]) -> list[dict]:
    return [match_requirement(r, facts) for r in requirements]


def relevance_of_facts(requirements: list[dict], matches: list[dict], facts: list[dict]) -> dict[str, float]:
    """Per-fact relevance to the job (task relevance, not just tech overlap): matched weight + semantic closeness."""
    rel: dict[str, float] = {}
    by_id = {f["id"]: f for f in facts}
    for m in matches:
        w = 2.0 if m["level"] == "must" else 1.0
        for fid in m["facts"]:
            rel[fid] = rel.get(fid, 0) + w * (1.0 if m["match"] == "met" else 0.5)
    for f in facts:
        if f["status"] == "verified" and f["id"] not in rel:
            s = max((semantic_sim(r["text"], f["text"]) for r in requirements), default=0)
            rel[f["id"]] = round(s, 3)
    return {k: v for k, v in rel.items() if k in by_id}
