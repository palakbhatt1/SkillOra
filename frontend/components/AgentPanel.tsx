"use client";
import { useEffect, useRef, useState } from "react";
import { api, type Activity, type ActivityStep } from "@/lib/api";
import { gsap, useGSAP } from "@/lib/gsap";
import { useStore } from "@/lib/store";

/** The pipeline, in order. `match` = the activity names the backend reports for that agent. `about` = plain-English explanation. */
const AGENTS = [
  {
    name: "Source Extractor", fw: "CrewAI", match: ["Source Extractor"],
    what: "Reads your resume, repo or notes and writes down facts about your work. Every fact keeps the exact sentence it came from.",
    how: "CrewAI agent powered by Gemini. Then a plain-code check throws away any fact whose quoted sentence is not really in your file, so nothing can be made up.",
  },
  {
    name: "JD Analyzer", fw: "CrewAI", match: ["JD Analyzer"],
    what: "Reads the job description and lists what the job asks for: must-have skills, nice-to-haves, keywords and experience level.",
    how: "CrewAI agent powered by Gemini. If you analyse the same job description again, the saved answer is reused (shown as “cached”).",
  },
  {
    name: "Matcher", fw: "CrewAI + Python", match: ["Matcher", "Matcher agent"],
    what: "Compares every job requirement with your confirmed facts and marks it met, partly met or missing.",
    how: "Tries an exact word match first, then similar spelling, then similar meaning. A CrewAI agent double-checks the borderline ones.",
  },
  {
    name: "Project Selector", fw: "Python", match: ["Project Selector"],
    what: "Chooses which projects and jobs go on the resume: the ones most useful for this particular job.",
    how: "Plain code, no AI. It scores how much each project supports the job's requirements, then keeps the best 3 projects and 2 jobs. You can override it.",
  },
  {
    name: "Resume Writer", fw: "Google ADK", match: ["Resume Writer"],
    what: "Writes your resume bullet points and the summary, using only your confirmed facts.",
    how: "Google ADK agent powered by Gemini. It gets a few related facts at a time and turns them into one fuller sentence.",
  },
  {
    name: "Verifier", fw: "ADK callback", match: ["Verifier"],
    what: "Checks every bullet against the quoted source. Wrong numbers, tools you never used, or boasts like “expert” are rejected.",
    how: "Runs inside the ADK Writer as a callback, using plain code. A rejected bullet is sent back to the Writer to be rewritten.",
  },
  {
    name: "Keyword Coach", fw: "Python", match: ["Keyword Coach"],
    what: "Looks at keywords the job wants that your resume is missing. If one of your facts supports it, it suggests a rewrite. If not, it tells you it is a real gap.",
    how: "Plain code working on your fact ledger. It never invents a skill; you accept or reject each suggestion.",
  },
  {
    name: "Scoring Engine", fw: "Python", match: ["Scoring Engine"],
    what: "Gives your resume a job-fit score out of 100 and explains every point.",
    how: "Plain code, no AI, so the same resume and job always give the same score. It uses five parts: skills, responsibilities, experience, evidence and education, with switchable profiles.",
  },
  {
    name: "Coordinator", fw: "Google ADK", match: ["Coordinator"],
    what: "The chat helper. Ask it why your score is low, what your gaps are, or to add or remove a project.",
    how: "Google ADK agent powered by Gemini. Common questions are answered instantly by its tools; open-ended ones go to Gemini.",
  },
];
const secs = (ms: number) => (ms < 950 ? `${Math.max(1, Math.round(ms))} ms` : `${(ms / 1000).toFixed(1)} s`);

/** Dropdown with the plain-English explanation; slides open with GSAP. */
function AgentDesc({ a, last }: { a: (typeof AGENTS)[number]; last: ActivityStep | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.fromTo(ref.current, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.35, ease: "power3.out" }); }, { scope: ref });
  return (
    <div className="ag-desc" ref={ref}>
      <div><b>What it does</b><br />{a.what}</div>
      <div style={{ marginTop: ".45rem" }}><b>How</b><br />{a.how}</div>
      {last && (
        <div style={{ marginTop: ".45rem" }}>
          <b>Last run</b><br />
          <span className="muted">{last.tech}{last.ms ? ` · ${secs(last.ms)}` : ""}{last.note ? ` · ${last.note}` : ""}</span>
        </div>
      )}
    </div>
  );
}

/** Permanent live view of what is actually running: which agent, on which technology, for how long (polls /api/activity). */
export default function AgentPanel() {
  const { live, ready, busy } = useStore();
  const root = useRef<HTMLDivElement>(null);
  const [act, setAct] = useState<Activity | null>(null);
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const fetchedAt = useRef(Date.now());
  const busyRef = useRef(false);
  busyRef.current = !!busy;

  // adaptive polling: fast while something runs, slow when idle
  useEffect(() => {
    if (!live || !ready) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const loop = async () => {
      try {
        const a = await api.activity();
        if (stop) return;
        fetchedAt.current = Date.now();
        setAct(a);
        timer = setTimeout(loop, a.running.length || busyRef.current ? 450 : 2500);
      } catch {
        timer = setTimeout(loop, 4000);
      }
    };
    loop();
    return () => { stop = true; clearTimeout(timer); };
  }, [live, ready]);

  // smooth running timers between polls
  const working = !!act?.running.length;
  useEffect(() => {
    if (!working) return;
    const t = setInterval(() => setTick((x) => x + 1), 100);
    return () => clearInterval(t);
  }, [working]);

  const running = act?.running ?? [];
  const recent = act?.recent ?? [];
  const runKey = running.map((r) => r.id).join(",");
  const topLog = recent[0]?.id ?? 0;
  const elapsed = (r: ActivityStep) => (r.elapsed_ms ?? 0) + (Date.now() - fetchedAt.current);

  // GSAP: pulsing dots + shimmer bars for every running step, slide-in for new log entries
  useGSAP(
    () => {
      gsap.fromTo(".ag-pulse", { scale: 1, opacity: 0.8 }, { scale: 2.6, opacity: 0, duration: 1.1, repeat: -1, ease: "power1.out" });
      gsap.fromTo(".ag-shimmer", { xPercent: -100 }, { xPercent: 100, duration: 1.1, repeat: -1, ease: "none" });
      gsap.from(".ag-run", { x: -14, opacity: 0, duration: 0.35, ease: "power3.out" });
    },
    { scope: root, dependencies: [runKey] }
  );
  useGSAP(
    () => { if (topLog) gsap.from(".ag-log:first-child", { y: -10, opacity: 0, duration: 0.4, ease: "power3.out" }); },
    { scope: root, dependencies: [topLog] }
  );
  void tick;

  const stateOf = (names: string[]) => {
    const r = running.find((x) => names.includes(x.agent));
    if (r) return { kind: "run" as const, step: r };
    const d = recent.find((x) => names.includes(x.agent));
    return d ? { kind: "done" as const, step: d } : { kind: "idle" as const, step: null };
  };
  const infra = running.filter((r) => !AGENTS.some((a) => a.match.includes(r.agent)));

  return (
    <div className="agents" ref={root}>
      <div className="row between" style={{ marginBottom: ".6rem" }}>
        <b className="small" style={{ letterSpacing: ".1em", textTransform: "uppercase" }}>Live agents</b>
        <span className={`chip ${working ? "green" : ""}`} style={{ fontSize: ".66rem" }}>{!live ? "offline" : working ? "● working" : "idle"}</span>
      </div>

      {live && act && (
        <div className="row wrapflex" style={{ gap: ".3rem", marginBottom: ".5rem" }}>
          <span className="chip blue" style={{ fontSize: ".64rem" }}>{act.llm ? `Gemini · ${act.model.replace("gemini-", "")}` : "rules only"}</span>
          <span className="chip" style={{ fontSize: ".64rem" }}>CrewAI {act.crewai}</span>
          <span className="chip" style={{ fontSize: ".64rem" }}>ADK {act.adk}</span>
        </div>
      )}
      <p className="muted" style={{ fontSize: ".68rem", marginBottom: ".5rem" }}>Tap an agent to see what it does.</p>

      {!live && <p className="muted small">Start the backend to see the agents work in real time.</p>}

      {live && (
        <div className="ag-list">
          {infra.map((r) => (
            <div key={r.id} className="ag-row ag-run working" style={{ cursor: "default" }}>
              <span className="ag-dot"><i className="ag-pulse" /></span>
              <span className="ag-name">{r.agent}<small>{r.tech}</small></span>
              <span className="ag-time">{secs(elapsed(r))}</span>
              <span />
              <span className="ag-bar"><i className="ag-shimmer" /></span>
            </div>
          ))}
          {AGENTS.map((a) => {
            const s = stateOf(a.match);
            const isOpen = !!open[a.name];
            return (
              <div key={a.name}>
                <div
                  role="button" tabIndex={0} aria-expanded={isOpen}
                  className={`ag-row ${s.kind === "run" ? "ag-run working" : s.kind === "done" ? "done" : ""} ${isOpen ? "open" : ""}`}
                  onClick={() => setOpen({ ...open, [a.name]: !isOpen })}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen({ ...open, [a.name]: !isOpen }); } }}
                >
                  <span className={`ag-dot ${s.kind}`}>{s.kind === "run" && <i className="ag-pulse" />}</span>
                  <span className="ag-name">
                    {a.name}
                    <small>{s.kind === "run" ? s.step.tech : a.fw}</small>
                  </span>
                  <span className="ag-time">
                    {s.kind === "run" ? secs(elapsed(s.step)) : s.kind === "done" ? (s.step.ms ? secs(s.step.ms) : s.step.tech.includes("cache") ? "cached" : "✓") : ""}
                  </span>
                  <span className="ag-caret">{isOpen ? "▾" : "▸"}</span>
                  {s.kind === "run" && <span className="ag-bar"><i className="ag-shimmer" /></span>}
                </div>
                {isOpen && <AgentDesc a={a} last={s.step} />}
              </div>
            );
          })}
        </div>
      )}

      {live && recent.length > 0 && (
        <div style={{ marginTop: ".8rem" }}>
          <div className="muted small" style={{ marginBottom: ".3rem" }}>Activity</div>
          <div className="ag-logs">
            {recent.slice(0, 5).map((r) => (
              <div key={r.id} className="ag-log">
                <b>{r.agent}</b> <span className="muted">· {r.ms ? secs(r.ms) : "instant"}</span>
                {r.note && <div className="muted">{r.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
