"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { jobDescription as sampleJd } from "@/lib/data";

const samplePresets = [
  {
    label: "Staff AI/ML Engineer",
    jd: "Role: Senior / Staff AI Engineer\nCompany: Anthropic / TechCorp\nRequirements:\n- 4+ years Python with FastAPI or Flask.\n- Hands-on experience building multi-agent LLM systems (CrewAI, LangChain, or Google ADK).\n- Expertise in sentence embeddings, vector search (FAISS/Pinecone), and prompt engineering.\n- Proven track record optimizing model inference latency and production RAG pipelines.\n- Excellent communication and system design skills.",
  },
  {
    label: "Senior Full-Stack Engineer",
    jd: "Role: Senior Full-Stack Engineer\nCompany: Vercel / Stripe\nRequirements:\n- Proficient in TypeScript, Next.js (App Router), React 19, and Tailwind CSS.\n- Strong backend experience with Python or Node.js REST / OpenAPI microservices.\n- Experience with SQL database schemas (PostgreSQL / SQLite) and query optimization.\n- Track record architecting real-time dashboards and responsive web applications.\n- Strong ownership and test-driven engineering culture.",
  },
];

export default function JobPage() {
  const st = useStore();
  const [jd, setJd] = useState(st.jd || sampleJd);
  const [busy, setBusy] = useState(false);
  const done = st.analyzed;

  useEffect(() => {
    if (st.jd) setJd(st.jd);
  }, [st.jd]);

  const handleAnalyze = async () => {
    if (!jd.trim() || busy) return;
    setBusy(true);
    try {
      await st.analyze(jd);
    } finally {
      setBusy(false);
    }
  };

  const metCount = st.requirements.filter((r) => r.match === "met").length;
  const partCount = st.requirements.filter((r) => r.match === "partial").length;
  const missCount = st.requirements.filter((r) => r.match === "missing").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB]">
              Stage 3 · Job Intelligence
            </span>
            <span className="text-xs text-[#78827A]">CrewAI Flow + RapidFuzz Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141A16] tracking-tight">
            Target Job Matching
          </h1>
          <p className="text-sm text-[#556056] max-w-2xl leading-relaxed">
            Paste your target Job Description. The JD Analyzer extracts structured requirements, and the Matcher aligns them with your confirmed ledger facts.
          </p>
        </div>

        {done && (
          <Link
            href="/tailor"
            className="px-6 py-2.5 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Proceed to Tailor Resume</span>
            <span>→</span>
          </Link>
        )}
      </div>

      {/* Main 2-Column Split: JD Input vs Extracted Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Job Description Input Box */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-[#141A16]">Target Job Description</h3>
            <span className="text-[11px] font-semibold text-[#1E6B38] bg-[#EAF4EB] px-2 py-0.5 rounded-full border border-[#C5E1CB]">
              🛡 Clean input
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[#78827A]">Samples:</span>
            {samplePresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setJd(p.jd)}
                className="text-[11px] font-medium text-[#1E6B38] bg-[#FAF9F5] hover:bg-[#EAF4EB] border border-[#ECE7DD] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={14}
            placeholder="Paste target job description here..."
            className="w-full p-4 rounded-xl border border-[#E5E1D5] bg-[#FAF9F6] text-xs sm:text-sm text-[#141A16] placeholder:text-[#9DA69E] focus:outline-none focus:border-[#1E6B38] focus:bg-white transition-all font-mono leading-relaxed resize-none"
          />

          <button
            onClick={handleAnalyze}
            disabled={busy || jd.trim().length < 30}
            className="w-full py-3 rounded-xl bg-[#1E6B38] hover:bg-[#16532B] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {busy ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Running CrewAI JD Analysis...</span>
              </>
            ) : done ? (
              <span>Re-Analyze Job Description ↻</span>
            ) : (
              <span>Analyze Job Requirements →</span>
            )}
          </button>
        </div>

        {/* Right Column: Matched Requirements & Overview */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Metadata Card */}
          {done ? (
            <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#ECE7DD] pb-3">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#141A16]">
                    {st.meta.title || "Target Software Role"}
                  </h3>
                  <p className="text-xs text-[#78827A]">
                    {st.meta.company ? `${st.meta.company} · ` : ""}{st.meta.seniority || "Mid-Senior"} level
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1E6B38] bg-[#EAF4EB] border border-[#C5E1CB] px-3 py-1 rounded-full">
                    {metCount} Met
                  </span>
                  <span className="text-xs font-bold text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] px-3 py-1 rounded-full">
                    {partCount} Partial
                  </span>
                  <span className="text-xs font-bold text-[#991B1B] bg-[#FEE2E2] border border-[#FECACA] px-3 py-1 rounded-full">
                    {missCount} Gap
                  </span>
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#78827A]">
                  Extracted Requirements ({st.requirements.length})
                </p>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {st.requirements.map((req) => {
                    const isMet = req.match === "met";
                    const isPart = req.match === "partial";

                    return (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-xl border border-[#ECE7DD] bg-[#FAF9F5] space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs sm:text-sm font-semibold text-[#141A16] leading-snug">
                            {req.text}
                          </p>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                            isMet
                              ? "bg-[#EAF4EB] text-[#1E6B38] border border-[#C5E1CB]"
                              : isPart
                              ? "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
                              : "bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]"
                          }`}>
                            {req.match}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#78827A] pt-1 border-t border-[#ECE7DD]/60">
                          <span className="capitalize">{req.level === "must" ? "★ Must-Have" : "☆ Nice-to-Have"}</span>
                          <span className="font-mono text-[10px]">
                            matched via: {req.via} ({Math.round((req.confidence || 0.8) * 100)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Extracted ATS Keywords */}
              {st.meta.keywords && st.meta.keywords.length > 0 && (
                <div className="pt-3 border-t border-[#ECE7DD] space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#78827A]">
                    Key ATS Skills & Terminology
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {st.meta.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E1D5] text-xs font-medium text-[#141A16] shadow-sm"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-[#ECE7DD] space-y-3">
              <span className="text-4xl">🎯</span>
              <h3 className="text-base font-serif font-bold text-[#141A16]">Awaiting Job Analysis</h3>
              <p className="text-xs text-[#556056] max-w-sm mx-auto">
                Paste a job description on the left and click "Analyze Job Requirements" to run the CrewAI analyzer and deterministic matching cascade.
              </p>
            </div>
          )}

          {/* Project Relevance Selection */}
          {done && st.projects && st.projects.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#141A16]">Featured Project Evidence</h3>
                  <p className="text-xs text-[#78827A]">Select which project experiences appear in the tailored resume</p>
                </div>
              </div>

              <div className="divide-y divide-[#F0EDE6]">
                {st.projects.map((proj) => (
                  <div key={proj.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#141A16]">{proj.name}</p>
                      <p className="text-[11px] text-[#78827A]">
                        Relevance: {Math.round(proj.relevance * 100)}% · {proj.reason || "Matched with target skills"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => st.toggleProject(proj.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        proj.picked
                          ? "bg-[#EAF4EB] text-[#1E6B38] border border-[#C5E1CB]"
                          : "bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {proj.picked ? "✓ Featured" : "+ Include"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-[#ECE7DD]">
        <Link
          href="/verify"
          className="text-xs font-semibold text-[#556056] hover:text-[#141A16] flex items-center gap-1"
        >
          <span>← Back to Fact Ledger</span>
        </Link>

        {done && (
          <Link
            href="/tailor"
            className="px-6 py-2.5 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Continue to Tailor & Chat</span>
            <span>→</span>
          </Link>
        )}
      </div>

    </div>
  );
}
