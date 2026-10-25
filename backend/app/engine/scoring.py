"""Scoring Engine - plain Python, deterministic (no LLM). Configurable, explainable job-fit score.

An ATS-inspired model built from documented, general techniques (weighted skill matching, required vs preferred
criteria, evidence-based match values, eligibility kept separate from the score). It does NOT reproduce any
company's proprietary scoring, and the weights below are our own starting assumptions to be validated.

    S = wK*K + wJ*J + wE*E + wQ*Q + wA*A          (each component is 0-100; weights come from the chosen profile)

    K  skills match            weighted match of requirements, required vs preferred blended by `pref_share`
    J  responsibility fit      do your projects/roles show comparable work (not just the same tools)
    E  relevant experience     min(1, years you have / years the job asks for)  - only when both are known
    Q  evidence quality        0.40*directness + 0.35*ownership + 0.25*verifiability of your bullets
    A  education               match of education requirements (or credit for a verified degree)

If a component cannot be scored (e.g. years unknown) its weight is redistributed to the others and the report says so.
"""
import re

from ..vocab import find_skills, pretty
from .matching import match_all

PROFILES: dict[str, dict] = {
    "standard": {"label": "Standard", "desc": "Balanced default: skills carry the most weight.",
                 "weights": {"K": 40, "J": 25, "E": 15, "Q": 10, "A": 10}, "pref_share": 0.25},
    "skills_first": {"label": "Skills-first", "desc": "Hands-on technical roles: skills and project fit dominate.",
                     "weights": {"K": 50, "J": 25, "E": 10, "Q": 10, "A": 5}, "pref_share": 0.25},
    "credentials_first": {"label": "Credentials-first", "desc": "Gives education and qualifications more weight.",
                          "weights": {"K": 30, "J": 20, "E": 15, "Q": 10, "A": 25}, "pref_share": 0.25},
    "graduate": {"label": "Graduate / entry-level", "desc": "No years-of-experience requirement: projects, evidence and education matter most.",
                 "weights": {"K": 35, "J": 30, "E": 0, "Q": 20, "A": 15}, "pref_share": 0.30},
}
DEFAULT_PROFILE = "standard"
NAMES = {"K": "Skills match", "J": "Responsibility relevance", "E": "Relevant experience", "Q": "Evidence quality", "A": "Education"}
COLORS = {"K": "var(--c-green)", "J": "var(--c-blue)", "E": "var(--c-violet)", "Q": "var(--c-amber)", "A": "var(--c-rose)"}
MUST_W, NICE_W = 3, 1  # importance of required vs preferred items inside a group

STRONG = re.compile(r"^(built|developed|designed|architected|implemented|engineered|led|created|launched|deployed|automated|optimi[sz]ed|reduced|improved|"
                    r"integrated|delivered|drove|shipped|migrated|authored|constructed|established|enabled|maintained|trained|analy[sz]ed|wrote|managed)\b", re.I)
WEAK = re.compile(r"^(worked on|helped|assisted|involved|participated|responsible for|exposure to|familiar)\b", re.I)


def resume_text(resume: dict) -> str:
    return " ".join([resume.get("summary", ""), ", ".join(resume.get("skills", []))] + [b["text"] for b in resume.get("bullets", [])])


def profile_info(pid: str) -> dict:
    p = PROFILES.get(pid) or PROFILES[DEFAULT_PROFILE]
    pid = pid if pid in PROFILES else DEFAULT_PROFILE
    return {"id": pid, "label": p["label"], "desc": p["desc"], "weights": p["weights"], "pref_share": p["pref_share"]}


def all_profiles() -> list[dict]:
    return [profile_info(k) for k in PROFILES]


def _clamp(x: float) -> int:
    return int(max(0, min(100, round(x))))


def _mvalue(m: dict, by_id: dict) -> float:
    """Evidence-based match value m_i in [0,1]: demonstrated in a project/role 1.0; only listed 0.7; related 0.5; none 0."""
    if m["match"] == "missing":
        return 0.0
    cited = [by_id[i] for i in m["facts"] if i in by_id]
    if cited and all(f["declared"] for f in cited):
        return 0.5  # self-declared, no source proof
    demonstrated = any(f["project"] != "Skills" and not f["declared"] and f["category"] != "education" for f in cited)
    if m["match"] == "partial":
        return 0.5
    return 1.0 if demonstrated or m["category"] == "education" else 0.7


def _wavg(items: list[tuple[float, float]]) -> float | None:
    tot = sum(w for w, _ in items)
    return 100 * sum(w * v for w, v in items) / tot if tot else None


def _years_needed(seniority: str) -> float | None:
    nums = [float(x) for x in re.findall(r"\d+(?:\.\d+)?", seniority or "")]
    return min(nums) if nums else None  # "2-3 years" asks for 2; "0-2 years" is an entry-level role (0)


def score(analysis: dict, matches: list[dict], facts: list[dict], resume: dict, projects: list[dict],
          profile: str = DEFAULT_PROFILE, years: float | None = None) -> dict:
    prof = profile_info(profile)
    W, pref_share = prof["weights"], prof["pref_share"]
    by_id = {f["id"]: f for f in facts}
    ms = {m["id"]: m for m in matches}
    reqs = analysis["requirements"]
    lvl = lambda r: MUST_W if r["level"] == "must" else NICE_W  # noqa: E731

    # ---- K: skills match = pref_share-blended required / preferred weighted match
    skill_reqs = [r for r in reqs if r["category"] != "education" and r["id"] in ms]
    req_items = [(1, _mvalue(ms[r["id"]], by_id)) for r in skill_reqs if r["level"] == "must"]
    pref_items = [(1, _mvalue(ms[r["id"]], by_id)) for r in skill_reqs if r["level"] != "must"]
    kr, kp = _wavg(req_items), _wavg(pref_items)
    K = kr if kp is None else kp if kr is None else (1 - pref_share) * kr + pref_share * kp
    K = 0.0 if K is None else K
    n_ev = sum(1 for _, v in req_items if v > 0)
    k_why = (f"Required {round(kr)} ({n_ev} of {len(req_items)} evidenced)" if kr is not None else "No required skills stated") + \
            (f"; preferred {round(kp)}" if kp is not None else "") + \
            (f"; blended {round((1 - pref_share) * 100)}/{round(pref_share * 100)}." if kr is not None and kp is not None else ".")

    # ---- J: responsibility fit = how well duty-type requirements are evidenced + best selected project's relevance
    duty = [r for r in reqs if r["category"] in ("experience", "other") and r["id"] in ms]
    resp = _wavg([(lvl(r), _mvalue(ms[r["id"]], by_id)) for r in duty])
    picked = [p for p in projects if p.get("picked")]
    best = max((p["relevance"] for p in picked), default=0)
    J = best if resp is None else 0.6 * resp + 0.4 * best
    j_why = (f"{len(duty)} responsibilities: {round(resp)} evidenced; " if resp is not None else "") + f"best selected project relevance {best} ({len(picked)} selected)."

    # ---- E: experience sufficiency (only when years are known and the job states what it needs)
    need = _years_needed(analysis.get("seniority", ""))
    if W.get("E", 0) == 0:
        E, e_ok, e_why = 0.0, False, "Not scored in this profile (entry-level policy)."
    elif years is None:
        E, e_ok, e_why = 0.0, False, "Not scored: add your years of relevant experience in Add Sources > Your details."
    elif need is None:
        E, e_ok, e_why = 0.0, False, "Not scored: the job does not state a years-of-experience requirement."
    else:
        E, e_ok = (100.0 if need == 0 else 100 * min(1.0, years / need)), True
        e_why = f"{years:g} relevant {'year' if years == 1 else 'years'} vs {need:g} asked for."

    # ---- Q: evidence quality of the bullets: 0.40*directness + 0.35*ownership + 0.25*verifiability
    bl = resume.get("bullets", [])
    if bl:
        D = sum(1 for b in bl if find_skills(b["text"])) / len(bl)
        O = sum(1.0 if STRONG.match(b["text"]) else 0.0 if WEAK.match(b["text"]) else 0.6 for b in bl) / len(bl)
        V = sum((1.0 if (re.search(r"\d", b["text"]) or len(find_skills(b["text"])) >= 2) else 0.5) if b.get("verified") else 0.0 for b in bl) / len(bl)
    else:
        D = O = V = 0.0
    Q = 100 * (0.40 * D + 0.35 * O + 0.25 * V)
    pend = sum(1 for f in facts if f["status"] == "pending" and not f["declared"])
    q_why = f"{len(bl)} bullets: directness {round(D * 100)}, ownership {round(O * 100)}, verifiable {round(V * 100)}" + (f"; {pend} facts still unconfirmed." if pend else ".")

    # ---- A: education
    edu_reqs = [r for r in reqs if r["category"] == "education" and r["id"] in ms]
    if edu_reqs:
        A = _wavg([(lvl(r), _mvalue(ms[r["id"]], by_id)) for r in edu_reqs]) or 0.0
        a_why = f"{sum(ms[r['id']]['match'] == 'met' for r in edu_reqs)} of {len(edu_reqs)} education requirements met."
    elif any(f["category"] == "education" and f["status"] == "verified" for f in facts):
        A, a_why = 100.0, "No education requirement stated; verified education on file."
    else:
        A, a_why = 50.0, "No education requirement stated and no education fact found (neutral)."

    vals = {"K": (K, True, k_why), "J": (J, True, j_why), "E": (E, e_ok, e_why), "Q": (Q, True, q_why), "A": (A, True, a_why)}
    active = {k: W[k] for k in vals if W.get(k, 0) > 0 and vals[k][1]}
    wsum = sum(active.values()) or 1
    total = round(sum(vals[k][0] * w for k, w in active.items()) / wsum)  # weights of unscored parts are redistributed
    comps = []
    for k in ("K", "J", "E", "Q", "A"):
        v, ok, why = vals[k]
        comps.append({"key": NAMES[k], "value": _clamp(v) if ok else 0, "color": COLORS[k], "weight": round(100 * active[k] / wsum) if k in active else 0,
                      "why": why, "scored": k in active})

    # ---- eligibility: mandatory qualifications, kept separate from the score. "Not found" is not "not qualified".
    unclear = [r["text"] for r in edu_reqs if r["level"] == "must" and ms[r["id"]]["match"] == "missing"]
    missing_must = [r["text"] for r in skill_reqs if r["level"] == "must" and ms[r["id"]]["match"] == "missing"]
    elig = {"status": "needs_review" if unclear else "eligible", "items": unclear, "gaps": missing_must,
            "note": "Missing from your resume does not mean you lack it: add proof (a source) or confirm it." if (unclear or missing_must) else ""}
    return {"total": total, "components": comps, "missing_must": missing_must, "eligibility": elig, "profile": prof}


def recommendations(analysis: dict, facts: list[dict], resume: dict, projects: list[dict], keywords: list[dict], base: dict,
                    profile: str = DEFAULT_PROFILE, years: float | None = None) -> list[dict]:
    """Ranked fixes. Impact for 'verify pending facts' is computed by re-running the engine (no guessing)."""
    recs = []
    pending = [f for f in facts if f["status"] == "pending" and not f["declared"]]
    if pending:
        sim = [dict(f, status="verified") if f["status"] == "pending" else f for f in facts]
        m2 = match_all(analysis["requirements"], sim)
        d = score(analysis, m2, sim, resume, projects, profile, years)["total"] - base["total"]
        recs.append({"impact": max(d, 1), "title": f"Verify the {len(pending)} pending facts",
                     "detail": "Facts you haven't confirmed can't support requirements or bullets: " + ", ".join(f["id"] for f in pending[:5]) + "."})
    for k in [k for k in keywords if k["state"] == "suggested"][:2]:
        recs.append({"impact": 2, "title": f"Accept the grounded '{k['word']}' rewrite",
                     "detail": f"Fact {k.get('fact')} already supports it; accepting adds it to a bullet and lifts keyword coverage."})
    for m in base.get("missing_must", [])[:2]:
        recs.append({"impact": 5, "title": f"Add evidence for must-have: {m}", "detail": "No verified fact supports this must-have. Add a source, or declare the skill if you really have it."})
    for k in [k for k in keywords if k["state"] == "gap"][:2]:
        recs.append({"impact": 3, "title": f"Close the gap: {k['word']}", "detail": "Genuine gap - build or document a project using it, or declare it as a skill."})
    e = next((c for c in base["components"] if c["key"] == NAMES["E"]), None)
    if e and not e["scored"] and PROFILES.get(profile, PROFILES[DEFAULT_PROFILE])["weights"].get("E", 0) > 0 and years is None:
        recs.append({"impact": 1, "title": "Add your years of relevant experience", "detail": "Optional: it lets the experience part of the score be calculated."})
    recs.sort(key=lambda r: -r["impact"])
    return [{"n": i + 1, "title": r["title"], "impact": f"+{r['impact']}", "detail": r["detail"]} for i, r in enumerate(recs[:5])]
