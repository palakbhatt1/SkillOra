"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PageHead } from "@/components/AppShell";
import { gsap, useGSAP } from "@/lib/gsap";
import { useStore } from "@/lib/store";
import { jobDescription } from "@/lib/data";

const tone = { met: "green", partial: "amber", missing: "rose" } as const;
const mark = { met: "✓ met", partial: "◐ partial", missing: "✕ missing" } as const;
const agentSteps = ["JD Analyzer (CrewAI)", "Matcher: exact → fuzzy → embedding", "Project Selector", "Resume Writer (ADK)", "Verifier", "Keyword Coach + Scoring"];

export default function Job() {
  const root = useRef<HTMLDivElement>(null);
  const st = useStore();
  const [jd, setJd] = useState(st.jd || jobDescription);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(-1);
  const scan = useRef<gsap.core.Tween | null>(null);
  const { contextSafe } = useGSAP({ scope: root });
  const done = st.analyzed;

  useEffect(() => { if (st.jd) setJd(st.jd); }, [st.jd]);

  // re-run the entrance animation when results appear (including when restored from the backend)
  useGSAP(
    () => {
      if (!done) return;
      gsap.from(".req", { x: 50, opacity: 0, stagger: 0.05, duration: 0.6, ease: "power3.out" });
      gsap.from(".kw", { scale: 0.5, opacity: 0, stagger: 0.04, duration: 0.5, ease: "back.out(2)" });
      gsap.from(".proj", { y: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" });
      gsap.utils.toArray<HTMLElement>(".conf > i").forEach((el) => gsap.to(el, { width: el.dataset.w + "%", duration: 1.1, ease: "power2.out" }));
    },
    { scope: root, dependencies: [done, st.jobId] }
  );

  const analyze = contextSafe(async () => {
    setBusy(true);
    setStep(0);
    const tick = setInterval(() => setStep((s) => Math.min(s + 1, agentSteps.length - 1)), st.live ? 4500 : 600);
    scan.current = gsap.fromTo(".scan", { top: "0%", opacity: 1 }, { top: "100%", duration: 1.6, repeat: -1, yoyo: true, ease: "power1.inOut" });
    try {
      await st.analyze(jd);
    } finally {
      clearInterval(tick);
      scan.current?.kill();
      gsap.to(".scan", { opacity: 0, duration: 0.3 });
      setBusy(false);
      setStep(-1);
    }
  });

  const met = st.requirements.filter((r) => r.match === "met").length;
  const part = st.requirements.filter((r) => r.match === "partial").length;
  const miss = st.requirements.filter((r) => r.match === "missing").length;

  return (
    <div ref={root}>
      <PageHead step={3} title="New Job" sub="Paste a job description. The JD Analyzer structures it, the Matcher links each requirement to your verified facts, and the Project Selector picks what to feature.">
        {done && <Link href="/tailor" className="btn primary">Tailor my resume →</Link>}
      </PageHead>

      <div className="split even">
        <div className="card flat" data-in style={{ position: "relative", overflow: "hidden" }}>
          <div className="row between" style={{ marginBottom: "1rem" }}>
            <h3 className="h3">Job description</h3>
            <span className="chip green">🛡 input checked</span>
          </div>
          <textarea className="input" rows={14} value={jd} onChange={(e) => setJd(e.target.value)} />
          <div className="scan" style={{ position: "absolute", left: 0, right: 0, height: "0.25rem", background: "var(--grad)", boxShadow: "0 0 2rem var(--c-green)", opacity: 0, pointerEvents: "none" }} />
          <button className="btn primary" style={{ marginTop: "1.2rem" }} onClick={analyze} disabled={busy || jd.trim().length < 40}>
            {busy ? "Agents working…" : done ? "Re-analyze" : "Analyze job description"}
          </button>
          {busy && (
            <div className="pipe" style={{ marginTop: "1.2rem" }}>
              {agentSteps.map((a, i) => <span key={a} className={`node ${step >= i ? "on" : ""}`}>{a}</span>)}
            </div>
          )}
          {st.live && <p className="muted small" style={{ marginTop: "1rem" }}>Live agents can take 20–60 seconds (Gemini free tier). If Gemini is busy, a rule-based fallback runs automatically.</p>}
        </div>

        <div className="stack">
          {!done ? (
            <div className="card flat muted" data-in style={{ minHeight: "20rem", display: "grid", placeItems: "center", textAlign: "center" }}>
              <div><div style={{ fontSize: "3rem" }}>◎</div><p>Requirements, keywords and matches will appear here.</p></div>
            </div>
          ) : (
            <>
              <div className="card flat">
                <div className="row between wrapflex">
                  <div><h3 className="h3">{st.meta.title}</h3><p className="muted small">{st.meta.company || "Company not stated"} · seniority {st.meta.seniority}</p></div>
                  <div className="row" style={{ gap: ".4rem" }}>
                    <span className="chip green">{met} met</span><span className="chip amber">{part} partial</span><span className="chip rose">{miss} missing</span>
                  </div>
                </div>
                <div className="row wrapflex" style={{ marginTop: "1rem", gap: ".4rem" }}>
                  {st.meta.keywords.map((k) => <span key={k} className="chip blue kw">{k}</span>)}
                </div>
                <p className="muted small" style={{ marginTop: ".8rem" }}>Analyzed by: {st.mode === "agent" ? "CrewAI agents (Gemini)" : st.mode === "rules" ? "rule-based fallback" : "demo data"}</p>
              </div>

              <div className="card flat">
                <h3 className="h3" style={{ marginBottom: "1rem" }}>Requirement matching</h3>
                <div className="stack" style={{ gap: ".6rem" }}>
                  {st.requirements.map((r) => (
                    <div key={r.id} className="req">
                      <div>
                        <div className="row wrapflex" style={{ gap: ".5rem" }}>
                          <b>{r.text}</b>
                          <span className={`chip ${r.level === "must" ? "violet" : ""}`}>{r.level === "must" ? "must" : "nice"}</span>
                          <span className="chip">{r.category}</span>
                        </div>
                        <div className="row small muted" style={{ marginTop: ".5rem", gap: ".7rem" }}>
                          <span>via {r.via}</span>
                          {r.facts.length > 0 && <span className="mono">{r.facts.join(" · ")}</span>}
                        </div>
                        <div className="bar conf" style={{ marginTop: ".5rem", height: ".35rem" }}>
                          <i data-w={Math.round(r.confidence * 100)} style={{ ["--c" as string]: `var(--c-${tone[r.match]})` }} />
                        </div>
                      </div>
                      <span className={`chip ${tone[r.match]}`}>{mark[r.match]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card flat">
                <h3 className="h3" style={{ marginBottom: ".4rem" }}>Project Selector</h3>
                <p className="muted small" style={{ marginBottom: "1rem" }}>Chosen by task relevance, not just tech-stack overlap. Click to override.</p>
                <div className="stack" style={{ gap: ".6rem" }}>
                  {st.projects.map((p) => (
                    <button key={p.id} className="req proj" onClick={() => st.toggleProject(p.id)} style={{ textAlign: "left", borderColor: p.picked ? "rgba(251,146,60,.6)" : undefined }}>
                      <div>
                        <b>{p.name}</b> {p.kind === "role" && <span className="chip violet">job / role</span>}
                        <div className="muted small">{p.reason}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <b style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>{p.relevance}</b>
                        <div className={`chip ${p.picked ? "green" : ""}`}>{p.picked ? "selected" : "skipped"}</div>
                      </div>
                    </button>
                  ))}
                  {st.projects.length === 0 && <p className="muted">No verified project facts yet — verify facts first.</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
