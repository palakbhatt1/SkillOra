"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { PageHead } from "@/components/AppShell";
import { gsap, useGSAP } from "@/lib/gsap";
import { useStore } from "@/lib/store";

const nums = (s: string) => s.match(/\d+(\.\d+)?/g) ?? [];

export default function Tailor() {
  const root = useRef<HTMLDivElement>(null);
  const chatBox = useRef<HTMLDivElement>(null);
  const st = useStore();
  const { bullets, facts, keywords, projects, profile, live } = st;
  const [msg, setMsg] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [editEdu, setEditEdu] = useState(false);
  const [eduForm, setEduForm] = useState({ degree: "", college: "", years: "" });

  // Live mode: the backend Verifier decides (and explains). Demo mode: same number/ledger rule, client-side.
  const issues = (b: (typeof bullets)[number]): string | null => {
    if (b.user) return null;  // your own wording: exported as you wrote it
    if (live) return b.verified ? null : (b.issues?.[0] ?? "blocked by the Verifier");
    const cited = b.facts.map((id) => facts.find((f) => f.id === id));
    if (cited.some((f) => !f || f.status !== "verified")) return "cites an unverified fact";
    const pool = cited.map((f) => f!.text + " " + f!.span).join(" ");
    const bad = nums(b.text).filter((n) => !pool.includes(n));
    return bad.length ? `number “${bad[0]}” not in cited source` : null;
  };
  const blocked = bullets.filter(issues).length;

  const { contextSafe } = useGSAP({ scope: root });

  // first time: pre-fill degree / college / years from the uploaded resume so the user only confirms
  useEffect(() => {
    if (live && !profile.education) api.eduHint().then((h) => h && setEduForm(h)).catch(() => {});
  }, [live, profile.education]);

  useEffect(() => {
    chatBox.current?.scrollTo({ top: chatBox.current.scrollHeight, behavior: "smooth" });
  }, [st.chat.length]);

  const runVerifier = contextSafe(() => {
    setVerifying(true);
    gsap.fromTo(".vrow", { x: -20, opacity: 0.2 }, { x: 0, opacity: 1, stagger: 0.18, duration: 0.5, ease: "power2.out", onComplete: () => setVerifying(false) });
    gsap.fromTo(".vscan", { top: 0, opacity: 1 }, { top: "100%", duration: bullets.length * 0.18 + 0.4, ease: "none", onComplete: () => { gsap.set(".vscan", { opacity: 0 }); } });
  });

  const send = () => {
    const q = msg.trim();
    if (!q) return;
    setMsg("");
    st.sendChat(q);
  };

  // Jobs/internships and projects are different things on a resume: separate sections, no internal "selected" line
  const section = (title: string, kind: "role" | "project") => {
    const items = bullets.filter((b) => (b.kind === "role" ? "role" : "project") === kind);
    if (!items.length) return null;
    return (
      <>
        <h4>{title}</h4>
        {Array.from(new Set(items.map((b) => b.project))).map((proj) => (
          <div key={proj}>
            <div className="pn">{proj}</div>
            {items.filter((b) => b.project === proj).map((b) => {
              const bad = issues(b);
              return (
                <div key={b.id + b.text.length} className="b" style={bad ? { background: "#ffe0c2" } : undefined}>
                  <span>•</span>
                  <span contentEditable suppressContentEditableWarning
                    onBlur={(e) => { const t = (e.currentTarget.textContent ?? "").trim(); if (t && t !== b.text) st.editBullet(b.id, t); }}>{b.text}</span>
                  <span className="fid" style={bad ? { background: "#fed7aa", color: "#c2410c" } : undefined}>{b.user ? "✎ yours" : b.facts.slice(0, 2).join(" ")}{b.facts.length > 2 ? ` +${b.facts.length - 2}` : ""}</span>
                </div>
              );
            })}
          </div>
        ))}
      </>
    );
  };

  const edu = facts.filter((f) => f.category === "education" && f.status === "verified");

  return (
    <div ref={root}>
      <PageHead step={4} title="Tailor & Edit" sub="The Writer drafts with fact IDs only; the Verifier blocks anything its source cannot support. Edit freely — every change is re-checked.">
        <button className="btn" onClick={runVerifier} disabled={verifying}>{verifying ? "Verifying…" : "▶ Run Verifier"}</button>
        {live && <button className="btn" onClick={() => st.undo()} disabled={!!st.busy}>↶ Undo</button>}
        {live && <button className="btn" onClick={() => st.regenerate()} disabled={!!st.busy}>↻ Rewrite with agents</button>}
        <Link href="/score" className="btn primary">View score →</Link>
      </PageHead>

      {!st.analyzed && live ? (
        <div className="card flat" data-in><p>No job analysed yet. <Link href="/job" style={{ color: "var(--c-green)" }}>Paste a job description first →</Link></p></div>
      ) : (
      <>
        <div className="tailor">
          <div className="paper" data-in>
            <h2>{profile.name}</h2>
            <p style={{ color: "#9a5a2a", fontSize: ".85rem" }}>{[profile.email, profile.links, profile.location].filter(Boolean).join(" · ")}</p>
            <h4>Summary</h4>
            <p style={{ fontSize: ".95rem" }} contentEditable suppressContentEditableWarning onBlur={(e) => { const t = e.currentTarget.textContent ?? ""; if (t && t !== st.summary) st.editSummary(t); }}>{st.summary}</p>
            {st.skills.length > 0 && (<><h4>Skills</h4><p style={{ fontSize: ".9rem" }}>{st.skills.join(", ")}</p></>)}
            {section("Professional Experience", "role")}
            {section("Projects", "project")}
            {(() => {
              const eduText = profile.education || edu.map((e) => e.span || e.text).join("; ");
              const parts = profile.education ? profile.education.split(" | ").map((x) => x.trim()) : [];
              const missing = !profile.education && !/\b(19|20)\d{2}\b/.test(eduText);  // no year found -> ask
              const field = { background: "#fff8ef", color: "#3a1a08", border: "1px solid #f0c9a0", borderRadius: ".5rem", padding: ".55rem .8rem", font: "inherit", fontSize: ".9rem", width: "100%" } as const;
              const save = () => {
                const degree = (eduForm.degree || edu[0]?.span || "").trim(), college = eduForm.college.trim(), years = eduForm.years.trim();
                if (degree && college && years) { st.saveProfile({ ...profile, education: [degree, college, years].join(" | ") }); setEditEdu(false); }
              };
              return (
                <>
                  <h4>Education</h4>
                  {eduText && !editEdu && (
                    <div style={{ fontSize: ".9rem" }}>
                      {parts.length === 3 ? (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontWeight: 700 }}><span>{parts[1]}</span><span>{parts[2]}</span></div>
                          <div>{parts[0]}</div>
                        </>
                      ) : <div>{eduText}</div>}
                      <button style={{ color: "#c2410c", fontSize: ".8rem", marginTop: ".3rem" }} onClick={() => { setEduForm(parts.length === 3 ? { degree: parts[0], college: parts[1], years: parts[2] } : { degree: profile.education || edu[0]?.span || "", college: "", years: "" }); setEditEdu(true); }}>✎ edit</button>
                    </div>
                  )}
                  {(missing || editEdu) && (
                    <div style={{ background: "#fff1e0", border: "1px dashed #f97316", borderRadius: ".7rem", padding: "1rem", display: "grid", gap: ".6rem" }}>
                      <b style={{ fontSize: ".9rem" }}>Which degree, college and years should appear here? <span style={{ fontWeight: 400, color: "#9a5a2a" }}>(all three are printed on your resume)</span></b>
                      <input style={field} placeholder="Degree, e.g. B.Tech in Computer Science and Engineering (AI Specialization)" value={eduForm.degree || (edu[0]?.span ?? "")} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} />
                      <input style={field} placeholder="College / university, e.g. BML Munjal University, Gurugram" value={eduForm.college} onChange={(e) => setEduForm({ ...eduForm, college: e.target.value })} />
                      <input style={field} placeholder="Years, e.g. 2023 – 2027" value={eduForm.years} onChange={(e) => setEduForm({ ...eduForm, years: e.target.value })} />
                      <div style={{ display: "flex", gap: ".5rem" }}>
                        <button onClick={save} disabled={!((eduForm.degree || edu[0]?.span) && eduForm.college.trim() && eduForm.years.trim())} style={{ opacity: (eduForm.degree || edu[0]?.span) && eduForm.college.trim() && eduForm.years.trim() ? 1 : 0.45, background: "#f97316", color: "#fff", padding: ".5rem 1.1rem", borderRadius: "999px", fontWeight: 600, fontSize: ".85rem" }}>Save education</button>
                        {editEdu && <button onClick={() => setEditEdu(false)} style={{ padding: ".5rem 1rem", fontSize: ".85rem" }}>Cancel</button>}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          <div className="chat-side">
            <div className="card flat" data-in>
              <h3 className="h3" style={{ marginBottom: ".8rem" }}>Coordinator chat</h3>
              <div className="chat" ref={chatBox}>
                {st.chat.map((c, i) => <div key={i} className={`msg ${c.from}`}>{c.text}</div>)}
              </div>
              <div className="row">
                <input className="input" placeholder="e.g. make the summary mention system design, or undo" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
                <button className="btn sm primary" onClick={send} disabled={!!st.busy}>Send</button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid g2 tools" style={{ marginTop: "1.6rem" }}>
          <div className="card flat" data-in style={{ position: "relative", overflow: "hidden" }}>
              <div className="row between"><h3 className="h3">Verifier</h3><span className={`chip ${blocked ? "rose" : "green"}`}>{blocked ? `${blocked} blocked` : "all grounded"}</span></div>
              <div style={{ marginTop: ".6rem" }}>
                {bullets.map((b) => {
                  const bad = issues(b);
                  return (
                    <div key={b.id} className="verify-row vrow">
                      <span style={{ color: bad ? "var(--c-rose)" : "var(--c-green)" }}>{bad ? "✕" : "✓"}</span>
                      <span className="mono">{b.facts.join(",")}</span>
                      <span className="muted small">{bad ?? (b.user ? "your wording, not source-checked" : "supported by span")}</span>
                    </div>
                  );
                })}
              </div>
              <div className="vscan" style={{ position: "absolute", left: 0, right: 0, height: 2, background: "var(--c-green)", opacity: 0, boxShadow: "0 0 1.2rem var(--c-green)" }} />
            </div>
          <div className="card flat" data-in>
              <h3 className="h3" style={{ marginBottom: ".8rem" }}>Keyword Coach</h3>
              <div className="stack">
                {keywords.map((k) => (
                  <div key={k.id} className="req" style={{ gridTemplateColumns: "1fr" }}>
                    <div className="row between"><b>{k.word}</b>
                      <span className={`chip ${k.state === "gap" ? "rose" : k.state === "accepted" ? "green" : k.state === "rejected" ? "" : "amber"}`}>
                        {k.state === "gap" ? "genuine gap" : k.state}
                      </span>
                    </div>
                    <p className="muted small">{k.note}</p>
                    {k.state === "suggested" && (
                      <div className="row" style={{ gap: ".5rem" }}>
                        <button className="btn sm good" onClick={() => st.decideKeyword(k.id, true)}>Accept</button>
                        <button className="btn sm bad" onClick={() => st.decideKeyword(k.id, false)}>Reject</button>
                      </div>
                    )}
                    {k.state === "gap" && live && (
                      <button className="btn sm warn" style={{ justifySelf: "start" }} onClick={() => st.declareSkill(k.word)}>I know this — declare skill</button>
                    )}
                  </div>
                ))}
                {keywords.length === 0 && <p className="muted small">Every JD keyword is already covered by grounded bullets.</p>}
              </div>
            </div>
        </div>
      </>
      )}
    </div>
  );
}
