"use client";
import Link from "next/link";
import { PageHead } from "@/components/AppShell";
import ScoreRing from "@/components/ScoreRing";
import { useStore } from "@/lib/store";

export default function Score() {
  const { score, components, recs, facts, keywords, live, analyzed, mode, scoreProfile, profiles, setScoreProfile, eligibility } = useStore();
  const pending = facts.filter((f) => f.status === "pending").length;
  const open = keywords.filter((k) => k.state === "suggested").length;
  const showProfiles = live && analyzed && profiles.length > 0;

  return (
    <div>
      <PageHead step={5} title="Score Report" sub="A deterministic job-fit score. Same resume and job always give the same number, and every point has a visible reason.">
        <Link href="/export" className="btn primary">Export resume →</Link>
      </PageHead>

      {live && !analyzed ? (
        <div className="card flat" data-in><p>No job analysed yet. <Link href="/job" style={{ color: "var(--c-green)" }}>Paste a job description first →</Link></p></div>
      ) : (
        <>
          {showProfiles && (
            <div className="card flat" data-in style={{ marginBottom: "1.6rem" }}>
              <div className="row between wrapflex" style={{ gap: "1rem" }}>
                <div>
                  <b>Scoring profile</b>
                  <p className="muted small">Different roles weigh things differently. Pick the profile that fits this job. The score updates instantly.</p>
                </div>
                <div className="tabs">
                  {profiles.map((p) => (
                    <button key={p.id} className={`tab ${scoreProfile?.id === p.id ? "on" : ""}`} onClick={() => setScoreProfile(p.id)} title={p.desc}>{p.label}</button>
                  ))}
                </div>
              </div>
              {scoreProfile && (
                <p className="muted small" style={{ marginTop: ".9rem" }}>
                  <b style={{ color: "var(--text)" }}>{scoreProfile.label}:</b> {scoreProfile.desc} Weights: skills {scoreProfile.weights.K}%, responsibilities {scoreProfile.weights.J}%, experience {scoreProfile.weights.E}%, evidence {scoreProfile.weights.Q}%, education {scoreProfile.weights.A}%.
                  {" "}These are our own starting assumptions, not any company&apos;s formula.
                </p>
              )}
            </div>
          )}

          <div className="split even">
            <div className="card flat" data-in style={{ display: "grid", placeItems: "center", gap: "1.6rem", padding: "3rem" }}>
              <ScoreRing value={score} size={22} />
              <div className="row wrapflex" style={{ justifyContent: "center" }}>
                <span className="chip green">deterministic · plain Python</span>
                <span className="chip amber">{pending} facts pending</span>
                <span className="chip blue">{open} keyword suggestions open</span>
              </div>
              <p className="muted small" style={{ textAlign: "center", maxWidth: "32rem" }}>
                Score = sum of weight × component. Skills are matched with importance weights and a required/preferred split; evidence quality is computed from your bullets.
                It never rises from an unsupported claim.
                {mode === "demo" && " (Demo data — start the backend for live scoring.)"}
              </p>
            </div>

            <div className="card flat" data-in>
              <h3 className="h3">Component breakdown</h3>
              {components.map((c) => (
                <div key={c.key} className="comp" style={{ opacity: c.scored === false ? 0.6 : 1 }}>
                  <div className="row between">
                    <b>{c.key}</b>
                    <span>{c.scored === false ? <b>not scored</b> : <b data-count={c.value}>0</b>} <span className="muted small">· weight {c.weight}%</span></span>
                  </div>
                  <div className="bar"><i data-w={c.scored === false ? 0 : c.value} style={{ ["--c" as string]: c.color }} /></div>
                  <p className="muted small">{c.why}</p>
                </div>
              ))}
            </div>
          </div>

          {live && eligibility && (
            <div className="card flat" data-in style={{ marginTop: "1.6rem", borderColor: eligibility.status === "eligible" ? "rgba(251,146,60,.5)" : "var(--c-rose)" }}>
              <div className="row between wrapflex">
                <h3 className="h3">Eligibility <span className="muted" style={{ fontWeight: 400, fontSize: "1rem" }}>(separate from the score)</span></h3>
                <span className={`chip ${eligibility.status === "eligible" ? "green" : "rose"}`}>{eligibility.status === "eligible" ? "✓ eligible" : "needs review"}</span>
              </div>
              {eligibility.items.length > 0 && (
                <p style={{ marginTop: ".7rem" }}><b>Required qualification not found in your resume:</b> {eligibility.items.join("; ")}</p>
              )}
              {eligibility.gaps.length > 0 && (
                <p style={{ marginTop: ".5rem" }}><b>Required skills with no evidence yet:</b> {eligibility.gaps.join("; ")}</p>
              )}
              {eligibility.items.length === 0 && eligibility.gaps.length === 0 && <p className="muted" style={{ marginTop: ".7rem" }}>Every mandatory requirement has supporting evidence.</p>}
              {eligibility.note && <p className="muted small" style={{ marginTop: ".6rem" }}>{eligibility.note}</p>}
            </div>
          )}

          <div className="card flat" data-in style={{ marginTop: "1.6rem" }}>
            <h3 className="h3" style={{ marginBottom: "1.2rem" }}>Top recommendations</h3>
            <div className="grid g3">
              {recs.map((r) => (
                <div key={r.n} className="card rec" style={{ gridTemplateColumns: "auto 1fr" }}>
                  <div className="n">{r.n}</div>
                  <div>
                    <div className="row between"><b>{r.title}</b><span className="chip green">{r.impact}</span></div>
                    <p className="muted small" style={{ marginTop: ".4rem" }}>{r.detail}</p>
                  </div>
                </div>
              ))}
              {recs.length === 0 && <p className="muted">Nothing left to fix.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
