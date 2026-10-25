"""Deterministic grounding checks used by the Verifier (and by the fabrication-catch-rate metric)."""
import re

from ..vocab import NUM_RE, find_skills

# unsupported seniority / quality claims count as fabrication too
PUFF_WORDS = ["experienced", "expert", "expertise", "seasoned", "senior", "proven", "leader", "leadership",
              "managed a team", "years of experience", "extensive", "award-winning", "world-class"]
PUFF_RE = re.compile(r"\b(?:" + "|".join(re.escape(w) for w in PUFF_WORDS) + r")\b", re.I)


def verify_bullet(text: str, fact_ids: list[str], facts_by_id: dict[str, dict]) -> dict:
    issues: list[str] = []
    if not fact_ids:
        issues.append("cites no fact ID")
    cited = []
    for fid in fact_ids:
        f = facts_by_id.get(fid)
        if f is None:
            issues.append(f"{fid} does not exist")
        elif f["status"] != "verified":
            issues.append(f"{fid} is {f['status']}, not verified")
        else:
            cited.append(f)
    pool = " ".join(f["text"] + " " + f["span"] for f in cited)
    if cited:
        bad_nums = [n for n in NUM_RE.findall(text) if not re.search(r"(?<![\d.])" + re.escape(n) + r"(?![\d])", pool)]
        if bad_nums:
            issues.append(f"number '{bad_nums[0]}' is not in the cited source")
        puff = {m.lower() for m in PUFF_RE.findall(text)} - {m.lower() for m in PUFF_RE.findall(pool)}
        if puff:
            issues.append(f"unsupported claim '{sorted(puff)[0]}' is not in the cited source")
        extra = find_skills(text) - find_skills(pool)
        if extra:
            issues.append(f"technology '{sorted(extra)[0]}' is not in the cited source")
    return {"ok": not issues, "issues": issues}
