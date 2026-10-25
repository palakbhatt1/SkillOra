"use client";
import { useEffect, useRef, useState } from "react";
import { api, type Activity, type ActivityStep } from "@/lib/api";
import { useStore } from "@/lib/store";

const AGENTS = [
  {
    name: "Source Extractor", fw: "CrewAI", match: ["Source Extractor"],
    what: "Reads your resume, repo or notes and writes down facts about your work. Every fact preserves its source verbatim citation.",
    how: "CrewAI agent powered by Gemini. A deterministic validator drops any fact whose quoted span is missing from raw input.",
  },
  {
    name: "JD Analyzer", fw: "CrewAI", match: ["JD Analyzer"],
    what: "Parses target job descriptions and extracts categorized requirements: must-haves, nice-to-haves, ATS keywords, and seniority level.",
    how: "CrewAI agent powered by Gemini with structured Pydantic schema output.",
  },
  {
    name: "Matcher", fw: "CrewAI + Python", match: ["Matcher", "Matcher agent"],
    what: "Cross-references JD requirements against confirmed facts in the ledger, categorizing as met, partial, or missing.",
    how: "Hierarchical matching cascade: exact token matching → RapidFuzz Levenshtein similarity → sentence transformer embeddings.",
  },
  {
    name: "Project Selector", fw: "Python", match: ["Project Selector"],
    what: "Ranks candidate projects by JD relevance score to select optimal high-impact evidence.",
    how: "Deterministic relevance scoring based on matched skills, metrics, and domain keywords.",
  },
  {
    name: "Resume Writer", fw: "Google ADK", match: ["Resume Writer"],
    what: "Generates targeted resume bullet points and professional summary grounded solely in verified facts.",
    how: "Google ADK agent with strictly enforced grounding constraints and XYZ-metric structuring.",
  },
  {
    name: "Verifier", fw: "ADK Callback", match: ["Verifier"],
    what: "Checks every bullet against the ledger citation. Unsupported numbers or tools trigger instant rejection.",
    how: "Runs inside ADK Writer as a deterministic callback hook.",
  },
  {
    name: "Keyword Coach", fw: "Python", match: ["Keyword Coach"],
    what: "Analyzes missing high-priority ATS keywords against your verified facts to suggest authentic additions.",
    how: "Identifies grounded evidence you haven't yet highlighted without hallucinating skills.",
  },
  {
    name: "Scoring Engine", fw: "Python", match: ["Scoring Engine"],
    what: "Calculates an explainable 5-component ATS score (0-100) with detailed metric breakdown.",
    how: "Deterministic evaluation across hard skills, responsibilities, impact metrics, evidence depth, and formatting.",
  },
  {
    name: "Coordinator", fw: "Google ADK", match: ["Coordinator"],
    what: "Interactive assistant answering resume questions, explaining ATS gaps, and executing edits.",
    how: "Google ADK conversational loop with function calling into the fact ledger and scoring engine.",
  },
];

const secs = (ms: number) => (ms < 950 ? `${Math.max(1, Math.round(ms))} ms` : `${(ms / 1000).toFixed(1)} s`);

function AgentDesc({ a, last }: { a: (typeof AGENTS)[number]; last: ActivityStep | null }) {
  return (
    <div className="mt-2 p-3 bg-[#FAF9F5] rounded-xl border border-[#ECE7DD] text-xs space-y-2">
      <div>
        <p className="font-bold text-[#141A16]">What it does</p>
        <p className="text-[#556056] leading-relaxed">{a.what}</p>
      </div>
      <div>
        <p className="font-bold text-[#141A16]">Under the hood</p>
        <p className="text-[#556056] leading-relaxed">{a.how}</p>
      </div>
      {last && (
        <div className="pt-1.5 border-t border-[#ECE7DD] text-[11px] text-[#78827A]">
          <span className="font-semibold text-[#141A16]">Last execution: </span>
          <span>{last.tech}{last.ms ? ` · ${secs(last.ms)}` : ""}{last.note ? ` · ${last.note}` : ""}</span>
        </div>
      )}
    </div>
  );
}

export default function AgentPanel() {
  const { live, ready, busy } = useStore();
  const [act, setAct] = useState<Activity | null>(null);
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const fetchedAt = useRef(Date.now());
  const busyRef = useRef(false);
  busyRef.current = !!busy;

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
        timer = setTimeout(loop, a.running.length || busyRef.current ? 500 : 2500);
      } catch {
        timer = setTimeout(loop, 4000);
      }
    };
    loop();
    return () => { stop = true; clearTimeout(timer); };
  }, [live, ready]);

  const working = !!act?.running.length;
  useEffect(() => {
    if (!working) return;
    const t = setInterval(() => setTick((x) => x + 1), 100);
    return () => clearInterval(t);
  }, [working]);

  const running = act?.running ?? [];
  const recent = act?.recent ?? [];
  const elapsed = (r: ActivityStep) => (r.elapsed_ms ?? 0) + (Date.now() - fetchedAt.current);
  void tick;

  const stateOf = (names: string[]) => {
    const r = running.find((x) => names.includes(x.agent));
    if (r) return { kind: "run" as const, step: r };
    const d = recent.find((x) => names.includes(x.agent));
    return d ? { kind: "done" as const, step: d } : { kind: "idle" as const, step: null };
  };

  return (
    <div className="space-y-4">
      
      {/* Header telemetry summary */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#78827A]">
          Pipeline Architecture
        </span>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
          !live ? "bg-slate-100 text-slate-600" : working ? "bg-emerald-100 text-emerald-800 animate-pulse" : "bg-[#EAF4EB] text-[#1E6B38]"
        }`}>
          {!live ? "Demo Fallback" : working ? "● Running" : "Ready"}
        </span>
      </div>

      {live && act && (
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] font-medium border border-[#DBEAFE]">
            {act.llm ? `Gemini · ${act.model.replace("gemini-", "")}` : "Local Rules"}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#F3E8FF] text-[#7E22CE] font-medium border border-[#F3E8FF]">
            CrewAI Flow
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#047857] font-medium border border-[#D1FAE5]">
            Google ADK
          </span>
        </div>
      )}

      {/* Agents list */}
      <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
        {AGENTS.map((a) => {
          const s = stateOf(a.match);
          const isOpen = !!open[a.name];
          const isRunning = s.kind === "run";
          const isDone = s.kind === "done";

          return (
            <div key={a.name} className="border border-[#ECE7DD] rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setOpen({ ...open, [a.name]: !isOpen })}
                className={`w-full p-2.5 flex items-center justify-between text-left transition-colors ${
                  isRunning ? "bg-[#EAF4EB]" : "hover:bg-[#FAF9F5]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    isRunning ? "bg-emerald-500 animate-ping" : isDone ? "bg-[#1E6B38]" : "bg-slate-300"
                  }`} />
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#141A16] truncate">{a.name}</p>
                    <p className="text-[10px] text-[#78827A] truncate">
                      {isRunning ? s.step.tech : a.fw}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-[#78827A]">
                    {isRunning ? secs(elapsed(s.step)) : isDone ? (s.step.ms ? secs(s.step.ms) : "✓") : ""}
                  </span>
                  <span className="text-xs text-[#78827A]">{isOpen ? "▾" : "▸"}</span>
                </div>
              </button>

              {isOpen && <AgentDesc a={a} last={s.step} />}
            </div>
          );
        })}
      </div>

      {/* Recent Activity Log */}
      {live && recent.length > 0 && (
        <div className="pt-3 border-t border-[#ECE7DD] space-y-2">
          <p className="text-xs font-bold text-[#141A16]">Recent Executions</p>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {recent.slice(0, 4).map((r) => (
              <div key={r.id} className="p-2 rounded-lg bg-[#FAF9F5] border border-[#ECE7DD] text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#141A16]">{r.agent}</span>
                  <span className="text-[#78827A] font-mono">{r.ms ? secs(r.ms) : "instant"}</span>
                </div>
                {r.note && <p className="text-[#556056] text-[10px] mt-0.5 truncate">{r.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
