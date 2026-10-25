"use client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { PageHead } from "@/components/AppShell";
import { gsap, useGSAP } from "@/lib/gsap";
import { useStore } from "@/lib/store";
import type { Fact, FactStatus } from "@/lib/data";

type Tab = "all" | "review" | FactStatus;
const tabLabels: Record<string, string> = { all: "All", review: "Needs review", verified: "Confirmed", stale: "Stale", rejected: "Rejected" };
const tabs: Tab[] = ["all", "review", "verified", "stale", "rejected"];
const tone: Record<FactStatus, string> = { pending: "amber", verified: "green", stale: "rose", rejected: "" };
const matches = (f: Fact, t: Tab) => t === "all" || (t === "review" ? f.status === "pending" || f.status === "stale" : f.status === t);

export default function Verify() {
  const { facts, setFactStatus, editFact, declareSkill, confirmGroup, rejectGroup, live } = useStore();
  const [skill, setSkill] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const list = useRef<HTMLDivElement>(null);

  const count = (t: Tab) => facts.filter((f) => matches(f, t)).length;
  const auto = facts.filter((f) => f.auto).length;
  const pending = facts.filter((f) => f.status === "pending").length;
  const confirmed = facts.filter((f) => f.status === "verified").length;
  const pct = facts.length ? Math.round((confirmed / facts.length) * 100) : 0;

  // group by project / role / "Skills"; groups that need attention first, Skills last
  const groups = useMemo(() => {
    const m = new Map<string, Fact[]>();
    facts.filter((f) => matches(f, tab) && f.project !== "Skills").forEach((f) => m.set(f.project, [...(m.get(f.project) ?? []), f]));
    return [...m.entries()]
      .map(([name, fs]) => ({ name, fs, all: facts.filter((f) => f.project === name) }))
      .sort((a, b) => Number(a.name === "Skills") - Number(b.name === "Skills") ||
        b.all.filter((f) => f.status === "pending").length - a.all.filter((f) => f.status === "pending").length);
  }, [facts, tab]);

  // ---- Skills section: every skill in one place (from the skills list + self-declared), plus tech used per project
  const skillFacts = facts.filter((f) => f.project === "Skills" && f.status !== "rejected");
  const skillLabel = (f: Fact) => f.span || f.text.replace(/^Skilled in /, "");
  const pendingSkills = skillFacts.filter((f) => f.status === "pending" || f.status === "stale").length;
  const techByProject = useMemo(() => {
    const m = new Map<string, Set<string>>();
    facts.filter((f) => f.status !== "rejected" && f.text.startsWith("Built with ")).forEach((f) =>
      f.text.slice("Built with ".length).split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => m.set(t, (m.get(t) ?? new Set()).add(f.project))));
    return [...m.entries()].sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]));
  }, [facts]);

  const isOpen = (name: string, needs: number) => open[name] ?? (needs > 0 || tab !== "all");

  useGSAP(() => {
    gsap.fromTo(".group", { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: "power3.out", overwrite: true });
  }, { scope: list, dependencies: [tab, groups.length] });

  const flash = (id: string, color: string) =>
    gsap.fromTo(`#fact-${id}`, { boxShadow: `0 0 0 0.35rem ${color}` }, { boxShadow: "0 0 0 0 transparent", duration: 0.9, ease: "power2.out" });
  const decide = (id: string, s: FactStatus) => {
    setFactStatus(id, s);
    flash(id, s === "verified" ? "rgba(245,158,11,.5)" : "rgba(234,88,12,.5)");
  };

  return (
    <div>
      <PageHead step={2} title="Verify Facts" sub="Facts quoted from your own files are confirmed for you — skim them, reject anything wrong, and confirm the few that contain numbers.">
        <Link href="/job" className="btn primary">Continue to New Job →</Link>
      </PageHead>

      <div className="card flat" data-in style={{ marginBottom: "1.6rem" }}>
        <div className="row between wrapflex" style={{ gap: "1.4rem" }}>
          <div style={{ flex: "1 1 18rem" }}>
            <div className="row between"><b>{confirmed} of {facts.length} facts confirmed</b><b>{pct}%</b></div>
            <div className="bar" style={{ marginTop: ".6rem" }}><i style={{ width: `${pct}%`, transition: "width .7s cubic-bezier(.2,.8,.2,1)" }} /></div>
            <p className="muted small" style={{ marginTop: ".6rem" }}>
              {auto > 0 && <>{auto} auto-confirmed from your files · </>}{pending} need{pending === 1 ? "s" : ""} your review
            </p>
          </div>
          {pending > 0 && <button className="btn good" onClick={() => confirmGroup(null)}>Confirm all {pending} pending</button>}
        </div>
        <div className="tabs" style={{ marginTop: "1.2rem" }}>
          {tabs.map((t) => (
            <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{tabLabels[t]} · {count(t)}</button>
          ))}
        </div>
      </div>

      <div className="card flat" data-in style={{ marginBottom: "1.6rem" }}>
        <div className="row between wrapflex" style={{ gap: "1rem" }}>
          <div>
            <h3 className="h3">Your skills <span className="muted" style={{ fontWeight: 400 }}>· {skillFacts.length}</span></h3>
            <p className="muted small">Every skill found in your files. Click an amber skill to confirm it, ✕ to remove one that is wrong.</p>
          </div>
          {pendingSkills > 0 && <button className="btn sm good" onClick={() => confirmGroup("Skills")}>Confirm {pendingSkills} pending</button>}
        </div>
        <div className="row wrapflex" style={{ gap: ".5rem", marginTop: "1rem" }}>
          {skillFacts.map((f) => {
            const needs = f.status === "pending" || f.status === "stale";
            return (
              <span key={f.id} className={`chip skill-chip ${f.declared ? "amber" : needs ? "amber" : "green"}`} style={{ fontSize: ".9rem", padding: ".35rem .5rem .35rem .8rem", gap: ".5rem" }}>
                <button onClick={() => needs && setFactStatus(f.id, "verified")} style={{ cursor: needs ? "pointer" : "default" }} title={needs ? "Click to confirm" : f.declared ? "Self-declared - no source proof" : "Confirmed"}>
                  {skillLabel(f)}{f.declared ? " · declared" : ""}
                </button>
                <button onClick={() => setFactStatus(f.id, "rejected")} aria-label={`Remove ${skillLabel(f)}`} title="Remove" style={{ opacity: 0.7 }}>✕</button>
              </span>
            );
          })}
          {skillFacts.length === 0 && <span className="muted small">No skills yet. Upload a resume with a skills section, or declare one below.</span>}
        </div>

        {live && (
          <div className="row wrapflex" style={{ gap: ".7rem", marginTop: "1.2rem" }}>
            <input className="input" style={{ maxWidth: "18rem" }} placeholder="Add a skill you know, e.g. Docker" value={skill} onChange={(e) => setSkill(e.target.value)}
              onKeyDown={async (e) => { if (e.key === "Enter" && skill.trim()) { await declareSkill(skill.trim()); setSkill(""); } }} />
            <button className="btn sm" disabled={!skill.trim()} onClick={async () => { await declareSkill(skill.trim()); setSkill(""); }}>Add skill</button>
            <span className="muted small" style={{ flex: "1 1 14rem" }}>Added skills count at lower weight and are marked &quot;declared&quot; — never turned into an invented bullet.</span>
          </div>
        )}

        {techByProject.length > 0 && (
          <div style={{ marginTop: "1.4rem", paddingTop: "1.2rem", borderTop: "1px solid var(--line)" }}>
            <b>Used in your projects</b>
            <p className="muted small">Technologies taken from the “Built with …” line of each project.</p>
            <div className="row wrapflex" style={{ gap: ".5rem", marginTop: ".8rem" }}>
              {techByProject.map(([tech, ps]) => (
                <span key={tech} className="chip blue" title={[...ps].join(", ")} style={{ fontSize: ".85rem" }}>{tech}{ps.size > 1 ? ` ×${ps.size}` : ""}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="stack" ref={list}>
        {groups.map(({ name, fs, all }) => {
          const needs = all.filter((f) => f.status === "pending").length;
          const stale = all.filter((f) => f.status === "stale").length;
          const role = all.some((f) => f.kind === "role");
          const expanded = isOpen(name, needs + stale);
          return (
            <div key={name} className="card flat group" style={{ padding: 0, overflow: "hidden" }}>
              <div className="row between group-head" style={{ padding: "1.1rem 1.4rem", gap: "1rem" }}>
                <button className="row" style={{ gap: ".8rem", textAlign: "left", flex: "1 1 14rem", minWidth: 0 }} onClick={() => setOpen({ ...open, [name]: !expanded })} aria-expanded={expanded}>
                  <span className="chip mono">{expanded ? "▾" : "▸"}</span>
                  <span>
                    <b style={{ fontSize: "1.1rem" }}>{name}</b>
                    <span className="muted small" style={{ display: "block" }}>
                      {all.length} fact{all.length === 1 ? "" : "s"}
                      {all.filter((f) => f.auto).length > 0 && ` · ${all.filter((f) => f.auto).length} auto-confirmed`}
                    </span>
                  </span>
                </button>
                <div className="row wrapflex" style={{ gap: ".5rem" }}>
                  {role && <span className="chip violet">job / role</span>}
                  {needs > 0 && <span className="chip amber">{needs} to review</span>}
                  {stale > 0 && <span className="chip rose">{stale} stale</span>}
                  {needs === 0 && stale === 0 && <span className="chip green">✓ all confirmed</span>}
                  {needs > 0 && <button className="btn sm good" onClick={() => confirmGroup(name)}>Confirm {needs}</button>}
                  <button className="btn sm bad" onClick={() => { if (window.confirm(`Reject all ${all.length} facts in "${name}"? They will not be used in any resume.`)) rejectGroup(name); }}>Reject all</button>
                </div>
              </div>

              {expanded && (
                <div className="stack" style={{ padding: "0 1.4rem 1.4rem", gap: ".7rem" }}>
                  {fs.map((f) => (
                    <div key={f.id} id={`fact-${f.id}`} className="fact" style={{ borderTop: "1px solid var(--line)", paddingTop: ".9rem" }}>
                      <div style={{ minWidth: 0 }}>
                        <div className="row wrapflex" style={{ gap: ".5rem", marginBottom: ".5rem" }}>
                          <span className="chip mono">{f.id}</span>
                          <span className={`chip ${tone[f.status]}`}>{f.status === "verified" && f.auto ? "auto-confirmed" : f.status === "verified" ? "confirmed" : f.status}</span>
                          <span className="chip">{f.category}</span>
                          {f.declared && <span className="chip amber">self-declared · no source proof</span>}
                        </div>
                        {editing === f.id ? (
                          <textarea className="input" rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
                        ) : (
                          <p style={{ fontWeight: 500 }}>{f.text}</p>
                        )}
                        {f.span && f.span !== f.text && <div className="span small"><span className="muted">{f.source}</span><br />{f.span}</div>}
                      </div>
                      <div className="fact-actions">
                        {editing === f.id ? (
                          <>
                            <button className="btn sm good" onClick={() => { editFact(f.id, draft); setEditing(null); flash(f.id, "rgba(245,158,11,.5)"); }}>Save</button>
                            <button className="btn sm" onClick={() => setEditing(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            {f.status !== "verified" && <button className="btn sm good" onClick={() => decide(f.id, "verified")} aria-label="Confirm">✓ Confirm</button>}
                            <button className="btn sm warn" onClick={() => { setEditing(f.id); setDraft(f.text); }} aria-label="Edit">✎ Edit</button>
                            {f.status !== "rejected" && <button className="btn sm bad" onClick={() => decide(f.id, "rejected")} aria-label="Reject">✕</button>}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {groups.length === 0 && <div className="card flat muted" style={{ textAlign: "center" }}>{facts.length ? "Nothing here — all clear." : "No facts yet. Add a resume, GitHub repo or note on Add Sources."}</div>}
      </div>
    </div>
  );
}
