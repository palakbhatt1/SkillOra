"use client";
import { useEffect, useRef, useState } from "react";
import { PageHead } from "@/components/AppShell";
import { gsap, useGSAP } from "@/lib/gsap";
import { useStore } from "@/lib/store";
import { api, type RepoInfo } from "@/lib/api";
import { sources as seedSources, type Source } from "@/lib/data";

const ico: Record<string, string> = { github: "GH", pdf: "PDF", docx: "DOC", pptx: "PPT", note: "TXT" };
const stages = ["Input check", "Ingest & chunk", "Extract facts", "Store in ledger"];

export default function Sources() {
  const root = useRef<HTMLDivElement>(null);
  const st = useStore();
  const [demoList, setDemoList] = useState<Source[]>(seedSources);
  const list = st.live ? st.sources : demoList;

  const [repoText, setRepoText] = useState("");
  const [note, setNote] = useState("");
  const [noteName, setNoteName] = useState("Project notes");
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(-1);
  const [over, setOver] = useState(false);
  const [msg, setMsg] = useState("");
  const [prof, setProf] = useState(st.profile);
  useEffect(() => { setProf(st.profile); }, [st.profile]);  // the real profile arrives after the first render
  const loop = useRef<gsap.core.Tween | null>(null);

  // GitHub links found in the uploaded resume: repo links are one click; a profile link lists its repos to choose from
  const [repoList, setRepoList] = useState<RepoInfo[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [listing, setListing] = useState("");
  const MAX_PICK = 5;
  const showRepos = async (user: string) => {
    setListing(user);
    try {
      const rows = await api.githubRepos(user);
      setRepoList(rows);
      setPicked(rows.filter((r) => !r.added).slice(0, 3).map((r) => r.repo));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not list repos.");
    }
    setListing("");
  };
  const toggle = (r: string) => setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : p.length < MAX_PICK ? [...p, r] : p));
  const addPicked = async (repos: string[]) => {
    for (const r of repos) await withPipeline(() => st.addGithub(r));
    setRepoList((l) => l.map((x) => (repos.includes(x.repo) ? { ...x, added: true } : x)));
    setPicked([]);
  };

  const { contextSafe } = useGSAP({ scope: root });

  /** Pipeline animation runs while the real request is in flight. */
  const withPipeline = contextSafe(async (job: () => Promise<string>) => {
    if (running) return;
    setRunning(true);
    setMsg("");
    let i = 0;
    setStage(0);
    const tick = setInterval(() => { i = Math.min(i + 1, stages.length - 1); setStage(i); }, 1400);
    loop.current = gsap.fromTo(".pipe-bar", { width: "0%" }, { width: "92%", duration: 6, ease: "power1.out" });
    try {
      const m = await job();
      setMsg(m);
      return m;
    } finally {
      clearInterval(tick);
      setStage(stages.length);
      gsap.to(".pipe-bar", { width: "100%", duration: 0.4 });
      setTimeout(() => { setRunning(false); setStage(-1); }, 700);
      gsap.delayedCall(0.1, () => gsap.from(".src-row:first-child", { x: -50, opacity: 0, duration: 0.7, ease: "power3.out" }));
    }
  });

  const demoIngest = (name: string, type: Source["type"], detail: string) =>
    withPipeline(async () => {
      await new Promise((r) => setTimeout(r, 3200));
      setDemoList((l) => [{ id: "n" + Date.now(), name, type, detail, facts: 6, state: "synced", updated: "just now" }, ...l]);
      return "Demo mode: backend is offline, so this is a simulated ingest.";
    });

  // paste one or many repo links (one per line, or separated by spaces/commas); only public repos can be read
  const MAX_AT_ONCE = 8;
  const tokens = repoText.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);
  const clean = (t: string) => t.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/^github\.com\//i, "").replace(/\.git$/, "").replace(/\/+$/, "");
  const parsed = tokens.map(clean);
  const repos = [...new Set(parsed.filter((x) => /^[\w.-]+\/[\w.-]+$/.test(x)))].slice(0, MAX_AT_ONCE);
  const unreadable = tokens.filter((t) => !/^[\w.-]+\/[\w.-]+$/.test(clean(t)));
  const addRepos = async () => {
    let ok = 0;
    for (const r of repos) {
      const m = st.live ? await withPipeline(() => st.addGithub(r)) : await demoIngest(r, "github", "GitHub repo · just added");
      if (m) ok++;  // an empty message means that repo failed (the red banner explains why)
    }
    setRepoText("");
    setMsg(`${ok} of ${repos.length} repositor${repos.length === 1 ? "y" : "ies"} processed. Review the facts on the next step.`);
  };
  const onFile = (f: File) => {
    if (st.live) return withPipeline(() => st.upload(f));
    const ext = (f.name.split(".").pop() ?? "pdf").toLowerCase();
    return demoIngest(f.name, (["pdf", "docx", "pptx"].includes(ext) ? ext : "note") as Source["type"], `${ext.toUpperCase()} · ${(f.size / 1024).toFixed(0)} KB`);
  };
  const addNote = () => (st.live ? withPipeline(() => st.addNote(noteName, note)).then(() => setNote("")) : demoIngest(noteName, "note", "Free-text note"));

  const stale = list.filter((s) => s.state === "stale").length;
  const total = list.reduce((a, s) => a + s.facts, 0);

  return (
    <div ref={root}>
      <PageHead step={1} title="Add Sources" sub="Connect everything you have built. SkillOra extracts candidate facts — each tied to a quoted source span — and never touches content it cannot cite." />

      <div className="grid g4" style={{ marginBottom: "1.6rem" }}>
        <div className="card stat" data-in><b>{list.length}</b><span>connected sources</span></div>
        <div className="card stat" data-in><b>{total}</b><span>facts extracted</span></div>
        <div className="card stat" data-in><b style={{ color: stale ? "var(--c-rose)" : undefined }}>{stale}</b><span>stale sources to re-verify</span></div>
        <div className="card stat" data-in><b className="grad-text">100%</b><span>inputs checked (PII, size, type, injection)</span></div>
      </div>

      <div className="split">
        <div className="stack">
          <div className="card flat" data-in>
            <h3 className="h3">How do you want to add your work?</h3>
            <p className="muted" style={{ margin: ".5rem 0 1rem" }}>Use <b style={{ color: "var(--text)" }}>any one, two or all three</b> options below. You can come back and add more at any time. Best results: your resume plus your 2–5 best repositories.</p>
            <div className="row wrapflex" style={{ gap: ".5rem" }}>
              <span className="chip violet">① Resume or documents</span>
              <span className="chip violet">② GitHub repositories (public)</span>
              <span className="chip violet">③ A written note</span>
            </div>
            <div className="pipe" style={{ marginTop: "1.2rem" }}>
              {stages.map((s2, i) => (
                <span key={s2} className="row" style={{ gap: ".6rem" }}>
                  <span className={`node ${stage >= i ? "on" : ""}`}>{i + 1}. {s2}</span>
                  {i < stages.length - 1 && <span className="arrow">→</span>}
                </span>
              ))}
            </div>
            <div className="bar" style={{ marginTop: "1rem", opacity: running ? 1 : 0.35 }}><i className="pipe-bar" /></div>
            {msg && <p style={{ marginTop: "1rem", color: "var(--c-green)" }}>{msg}</p>}
          </div>

          <div className="card flat opt" data-in>
            <div className="opt-head"><span className="opt-badge">1</span><div><h3 className="h3">Upload your resume or documents</h3><span className="muted small">PDF, DOCX, PPTX, TXT or MD · up to 15 MB each · add as many files as you like</span></div><span className="chip green" style={{ marginLeft: "auto" }}>Recommended</span></div>
            <div className={`drop ${over ? "over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}>
              <div className="src-ico" style={{ width: "3.4rem", height: "3.4rem" }}>↥</div>
              <b>Drop a file here</b>
              <label className="btn sm" style={{ cursor: "pointer" }}>
                or choose a file
                <input type="file" accept=".pdf,.docx,.pptx,.txt,.md" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
              </label>
            </div>
            <p className="muted small">No resume yet? Skip this and use Option 2 or 3. A resume is optional: SkillOra builds one from your sources.</p>
          </div>

          {st.live && (st.found.repos.length > 0 || st.found.profiles.length > 0) && (
            <div className="card flat" data-in style={{ borderColor: "rgba(251,146,60,.6)" }}>
              <div className="row between wrapflex">
                <h3 className="h3">GitHub links found in your resume</h3>
                <button className="btn sm" onClick={() => { st.clearFound(); setRepoList([]); }}>Dismiss</button>
              </div>
              <p className="muted small" style={{ margin: ".5rem 0 1rem" }}>Add the repos that matter most. Only public repositories can be read, and only the README, languages and manifest files.</p>
              <div className="stack" style={{ gap: ".6rem" }}>
                {st.found.repos.map((r) => (
                  <div key={r} className="row between">
                    <span className="mono">{r}</span>
                    <button className="btn sm good" disabled={running || list.some((s) => s.name.toLowerCase() === r.toLowerCase())} onClick={() => addPicked([r])}>
                      {list.some((s) => s.name.toLowerCase() === r.toLowerCase()) ? "✓ added" : "Add repo"}
                    </button>
                  </div>
                ))}
                {st.found.profiles.map((u) => (
                  <div key={u} className="row between">
                    <span className="mono">github.com/{u}</span>
                    <span className="row" style={{ gap: ".5rem" }}>
                      {prof.links.toLowerCase().includes(u.toLowerCase())
                        ? <span className="chip green">✓ in resume header</span>
                        : <button className="btn sm good" onClick={() => { const l = prof.links ? `${prof.links} · github.com/${u}` : `github.com/${u}`; setProf({ ...prof, links: l }); st.saveProfile({ ...prof, links: l }); }}>Use in resume</button>}
                      <button className="btn sm" disabled={!!listing} onClick={() => showRepos(u)}>{listing === u ? "Loading…" : "Show their repos"}</button>
                    </span>
                  </div>
                ))}
              </div>
              {repoList.length > 0 && (
                <div style={{ marginTop: "1.2rem" }}>
                  <div className="row between"><b>Pick up to {MAX_PICK} repos</b><span className="muted small">{picked.length} selected</span></div>
                  <div className="stack" style={{ gap: ".5rem", marginTop: ".7rem" }}>
                    {repoList.map((r) => (
                      <label key={r.repo} className="req" style={{ gridTemplateColumns: "auto 1fr auto", cursor: r.added ? "default" : "pointer", opacity: r.added ? 0.55 : 1 }}>
                        <input type="checkbox" disabled={r.added} checked={picked.includes(r.repo)} onChange={() => toggle(r.repo)} />
                        <div><b>{r.repo.split("/")[1]}</b> <span className="muted small">{r.language}{r.stars ? ` · ★${r.stars}` : ""} · pushed {r.pushed}</span>
                          {r.description && <div className="muted small">{r.description}</div>}</div>
                        {r.added && <span className="chip green">added</span>}
                      </label>
                    ))}
                  </div>
                  <button className="btn primary" style={{ marginTop: "1rem" }} disabled={running || picked.length === 0} onClick={() => addPicked(picked)}>
                    {running ? "Adding…" : `Add ${picked.length} repo${picked.length === 1 ? "" : "s"}`}
                  </button>
                </div>
              )}
            </div>
          )}


          <div className="card flat opt" data-in>
            <div className="opt-head"><span className="opt-badge">2</span><div><h3 className="h3">Add GitHub repositories</h3><span className="muted small">Add one or several. Paste one link per line.</span></div></div>
            <div className="warn-note">
              <b>⚠ Repositories must be public.</b> SkillOra cannot read private repos. If yours is private, make it public in GitHub → Settings → Danger zone, or paste its README as a note (Option 3).
            </div>
            <textarea className="input" rows={4} value={repoText} onChange={(e) => setRepoText(e.target.value)}
              placeholder={"github.com/you/project-one\ngithub.com/you/project-two\nyou/project-three"} />
            <div className="row between wrapflex">
              <span className="muted small">
                {repos.length > 0 ? `${repos.length} repositor${repos.length === 1 ? "y" : "ies"} ready${tokens.length > MAX_AT_ONCE ? ` (max ${MAX_AT_ONCE} at a time)` : ""}` : "Accepted: full link, github.com/owner/repo, or owner/repo"}
                {unreadable.length > 0 && <span style={{ color: "var(--c-rose)" }}> · can’t read: {unreadable.slice(0, 2).join(", ")}</span>}
              </span>
              <button className="btn primary" disabled={running || repos.length === 0} onClick={addRepos}>{running ? "Working…" : repos.length > 1 ? `Add ${repos.length} repositories` : "Add repository"}</button>
            </div>
            <p className="muted small">Only the README, languages and config files (requirements.txt, package.json, Dockerfile) are read, not the whole repo, so it stays fast.</p>
          </div>

          <div className="card flat opt" data-in>
            <div className="opt-head"><span className="opt-badge">3</span><div><h3 className="h3">Write a note</h3><span className="muted small">For anything not in a file or a public repo: a private project, an internship, a hackathon.</span></div></div>
            <input className="input" value={noteName} onChange={(e) => setNoteName(e.target.value)} placeholder="Note title, e.g. Hackathon project" />
            <textarea className="input" rows={4} placeholder="e.g. Built a LangChain chatbot for student queries; intent accuracy hit 91% on a 500-query test set." value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn" disabled={running || note.trim().length < 20} onClick={addNote}>Extract facts from note</button>
          </div>
        </div>

        <div className="stack">
          <div className="card flat" data-in>
            <div className="row between" style={{ marginBottom: "1rem" }}><h3 className="h3">Source library</h3><span className="chip">{list.length} {list.length === 1 ? "source" : "sources"}</span></div>
            <div className="stack">
              {list.map((s) => (
                <div key={s.id} className="src-row row" style={{ padding: ".8rem 0", borderTop: "1px solid var(--line)" }}>
                  <div className="src-ico">{ico[s.type]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                    <div className="muted small">{s.detail} · {s.updated}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`chip ${s.state === "synced" ? "green" : s.state === "stale" ? "rose" : "amber"}`}>
                      {s.state === "synced" ? "✓ synced" : s.state === "stale" ? "⚠ stale" : "◌ processing"}
                    </span>
                    <div className="muted small" style={{ marginTop: ".2rem" }}>{s.facts} facts</div>
                  </div>
                  {st.live && s.type === "github" && (
                    <button className="btn sm" disabled={running || !!st.busy} title="Re-read this repo from GitHub; facts whose quote is gone become stale"
                      onClick={() => withPipeline(() => st.resync(s.id))}>↻ Re-sync</button>
                  )}
                  {st.live && s.type !== "github" && s.type !== "note" && (
                    <label className="btn sm" title="Choose the updated file - it replaces this source" style={{ cursor: running ? "default" : "pointer", opacity: running ? 0.5 : 1 }}>
                      ↻ Re-sync
                      <input type="file" accept=".pdf,.docx,.pptx,.txt,.md" hidden disabled={running}
                        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) withPipeline(() => st.reupload(s.id, f)); }} />
                    </label>
                  )}
                  <button className="btn sm bad" aria-label={`Delete ${s.name}`} disabled={!!st.busy}
                    onClick={() => {
                      if (!window.confirm(`Delete "${s.name}" and the ${s.facts} facts extracted from it? This cannot be undone.`)) return;
                      if (st.live) st.removeSource(s.id);
                      else setDemoList((l) => l.filter((x) => x.id !== s.id));
                    }}>Delete</button>
                </div>
              ))}
              {list.length === 0 && <p className="muted">Nothing added yet. Use any of the three options on the left.</p>}
            </div>
          </div>

          <div className="card flat" data-in>
            <h3 className="h3" style={{ marginBottom: ".8rem" }}>Your details (shown on the resume)</h3>
            <div className="stack" style={{ gap: ".6rem" }}>
              {(["name", "email", "links", "location"] as const).map((k) => (
                <input key={k} className="input" placeholder={k === "links" ? "links (GitHub / LinkedIn / website) — printed on your resume" : k} value={prof[k]} onChange={(e) => setProf({ ...prof, [k]: e.target.value })} />
              ))}
              {st.live && (
                <label className="stack" style={{ gap: ".3rem" }}>
                  <span className="small"><b>Years of relevant experience</b> <span className="muted">(optional)</span></span>
                  <input className="input" type="number" min={0} max={50} step={0.5} placeholder="e.g. 0.5 for a 6-month internship"
                    value={prof.experience_years ?? ""} onChange={(e) => setProf({ ...prof, experience_years: e.target.value === "" ? null : Number(e.target.value) })} />
                  <span className="muted small">Used only to score the “Relevant experience” part when a job states the years it needs. Leave empty if unsure.</span>
                </label>
              )}
              {st.live && (
                <label className="row" style={{ gap: ".7rem", cursor: "pointer", alignItems: "flex-start" }}>
                  <input type="checkbox" checked={prof.auto_confirm !== false} onChange={(e) => { const p = { ...prof, auto_confirm: e.target.checked }; setProf(p); st.saveProfile(p); }} style={{ marginTop: ".3rem" }} />
                  <span><b>Auto-confirm facts from my files</b><span className="muted small" style={{ display: "block" }}>Facts quoted from your own resume, documents and repos are confirmed on arrival so you only review exceptions. Facts with numbers always wait for your click.</span></span>
                </label>
              )}
              <button className="btn" onClick={() => st.saveProfile(prof)}>Save details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
