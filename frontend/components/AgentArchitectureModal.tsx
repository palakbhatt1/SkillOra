"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconClose({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconBot({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconZap({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconNetwork({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM9 20a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM7 10v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
    </svg>
  );
}

interface AgentInfo {
  name: string;
  framework: "CrewAI" | "Google ADK" | "Deterministic Engine";
  stage: string;
  routes: string[];
  role: string;
  inputs: string;
  outputs: string;
  activeWhen: string;
}

const AGENTS: AgentInfo[] = [
  {
    name: "Source Extractor Agent",
    framework: "CrewAI",
    stage: "Stage 1: Sources & Ingestion",
    routes: ["/sources"],
    role: "Extracts raw document text from PDF, DOCX, PPTX, or GitHub repositories into atomic career facts with verbatim character-offset quotes.",
    inputs: "Uploaded files, GitHub repo tree, raw project notes",
    outputs: "Candidate fact entries with character-offset source spans in SQLite",
    activeWhen: "Uploading resume/notes or crawling GitHub in Stage 1",
  },
  {
    name: "Security Guardrail Engine",
    framework: "Deterministic Engine",
    stage: "Stage 1: Input Sanitization",
    routes: ["/sources", "/job"],
    role: "Multi-tier prompt injection defense: detects adversarial instructions (e.g. 'ignore previous instructions'), heuristic overrides, and delimiters.",
    inputs: "Unfiltered user files and target job descriptions",
    outputs: "Sanitized text or blocked claim alerts with security audit logs",
    activeWhen: "Any external document or JD text is submitted",
  },
  {
    name: "Fact Ledger & Verification Engine",
    framework: "Deterministic Engine",
    stage: "Stage 2: Fact Ledger",
    routes: ["/verify"],
    role: "Maintains relational SQLite ledger storing immutable evidence. Tracks status ('verified' | 'pending' | 'rejected') and supports human-in-the-loop review.",
    inputs: "Candidate facts extracted from sources",
    outputs: "Verified career facts with verbatim proof quotes",
    activeWhen: "Inspecting, editing, or verifying ledger claims on /verify",
  },
  {
    name: "JD Analyzer Agent",
    framework: "CrewAI",
    stage: "Stage 3: Job Match",
    routes: ["/job"],
    role: "Parses job description into structured requirements, classifying each as mandatory ('must') or preferred ('nice-to-have'), and extracts ATS keywords.",
    inputs: "Raw job description text",
    outputs: "Structured requirements list with seniority level & core technologies",
    activeWhen: "Analyzing target job description on /job",
  },
  {
    name: "Requirement Matcher Agent",
    framework: "CrewAI",
    stage: "Stage 3: Evidence Linking",
    routes: ["/job"],
    role: "Runs a 3-tier matching cascade: Exact token match → RapidFuzz normalized match → Semantic vector embeddings to label each requirement met, partial, or missing.",
    inputs: "Structured JD requirements + verified fact ledger claims",
    outputs: "Requirement-to-fact linkings with confidence scores and citations",
    activeWhen: "Linking job requirements to candidate facts on /job",
  },
  {
    name: "Deterministic ATS Scoring Engine",
    framework: "Deterministic Engine",
    stage: "Stage 4: Score & ATS",
    routes: ["/score"],
    role: "Pure Python deterministic algorithm (zero LLM drift). Computes 5 weighted dimensions: Skills Match, Responsibility Fit, Experience, Evidence Quality, and Education.",
    inputs: "Matched requirements, candidate facts, scoring profile weights",
    outputs: "Explainable 0–100 score with exact breakdown and gap analysis",
    activeWhen: "Evaluating job fit and ATS dimensions on /score",
  },
  {
    name: "Google ADK Coordinator Agent",
    framework: "Google ADK",
    stage: "Stage 5: Improve Resume",
    routes: ["/tailor"],
    role: "Central multi-tool agent powered by google-adk. Manages session state, handles conversational instructions, and invokes 6 registered tools to manipulate the resume canvas.",
    inputs: "User natural language prompts or showcase command clicks",
    outputs: "Tool executions (explain_score, list_gaps, set_project_included, set_summary, add_bullet, undo_last_edit)",
    activeWhen: "Interacting with the chat drawer on /tailor",
  },
  {
    name: "Google ADK Resume Writer Agent",
    framework: "Google ADK",
    stage: "Stage 5: Resume Synthesis",
    routes: ["/tailor"],
    role: "Synthesizes tailored professional summary and bullet points grounded strictly in verified fact claims using Google's XYZ metric framework.",
    inputs: "Verified facts, selected projects, target JD requirements",
    outputs: "Grounded resume bullets with fact citation IDs",
    activeWhen: "Generating, regenerating, or refining resume text on /tailor",
  },
  {
    name: "Google ADK Verifier Callback",
    framework: "Google ADK",
    stage: "Stage 5: Verifier Loop",
    routes: ["/tailor"],
    role: "Zero-hallucination callback verifier. Scans every synthesized bullet to ensure numbers, technologies, and achievements are present in source verbatim quotes.",
    inputs: "Generated bullets + quoted source fact spans",
    outputs: "Verification pass/fail status and specific ungrounded claim alerts",
    activeWhen: "Running verifier or updating bullets on /tailor",
  },
  {
    name: "Preflight Verifier & Export Engine",
    framework: "Deterministic Engine",
    stage: "Stage 6: Export",
    routes: ["/export"],
    role: "Runs final automated integrity checks ensuring 100% citation grounding, zero unverified claims, and generates ATS-formatted PDF and Word (.DOCX) documents.",
    inputs: "Final tailored resume + verified ledger facts",
    outputs: "Clean ATS-compliant vector PDF and editable Word DOCX",
    activeWhen: "Exporting final verified resume on /export",
  },
];

export default function AgentArchitectureModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const currentAgent = AGENTS.find((a) => a.routes.includes(pathname));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-[#ECE7DD] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#ECE7DD] bg-[#FAF9F5] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#EAF4EB] text-[#1E6B38]">
                <IconNetwork className="w-4 h-4 text-[#1E6B38]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB]">
                Multi-Agent Architecture
              </span>
              <span className="text-xs text-[#78827A]">Dual Framework Engine</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#141A16]">
              Agent Systems &amp; Execution Architecture
            </h2>
            <p className="text-xs text-[#556056]">
              Real-time inspection of CrewAI flows, Google ADK agents, and deterministic scoring pipelines.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#78827A] hover:text-[#141A16] hover:bg-white rounded-full border border-transparent hover:border-[#ECE7DD] transition-all cursor-pointer"
          >
            <IconClose className="w-5 h-5 text-[#556056]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Active Agent on Current Screen Banner */}
          {currentAgent && (
            <div className="p-4 rounded-2xl bg-[#EAF4EB] border border-[#C5E1CB] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E6B38] animate-pulse" />
                  <span className="text-xs font-bold text-[#1E6B38] uppercase tracking-wider">
                    Active Agent on This Screen ({pathname}):
                  </span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-[#1E6B38] border border-[#C5E1CB]">
                  {currentAgent.framework}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#141A16]">
                {currentAgent.name} · {currentAgent.stage}
              </h4>
              <p className="text-xs text-[#556056] leading-relaxed">
                {currentAgent.role}
              </p>
            </div>
          )}

          {/* Dual Frameworks Architecture Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* CrewAI Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#ECE7DD] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#ECE7DD] pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                    <IconZap className="w-4 h-4 text-emerald-700" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#141A16]">CrewAI Flows</h3>
                    <p className="text-[10px] text-[#78827A]">Stages 1 to 3: Ingestion &amp; Matching</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  CrewAI 1.10
                </span>
              </div>
              <ul className="text-xs text-[#556056] space-y-2 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-[#1E6B38] shrink-0 mt-0.5" />
                  <span><strong>Source Extractor:</strong> Character-offset parsing from multi-modal documents.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-[#1E6B38] shrink-0 mt-0.5" />
                  <span><strong>JD Analyzer:</strong> Must vs nice-to-have requirements extraction.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-[#1E6B38] shrink-0 mt-0.5" />
                  <span><strong>Matcher:</strong> Exact, RapidFuzz, and semantic embedding matching.</span>
                </li>
              </ul>
            </div>

            {/* Google ADK Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#ECE7DD] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#ECE7DD] pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-800">
                    <IconBot className="w-4 h-4 text-indigo-700" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#141A16]">Google ADK Framework</h3>
                    <p className="text-[10px] text-[#78827A]">Stage 5: Tailoring &amp; Verifier Callbacks</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Google ADK 2.13
                </span>
              </div>
              <ul className="text-xs text-[#556056] space-y-2 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Coordinator Agent:</strong> State management, user intent router, and 6 tools.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Resume Writer Agent:</strong> Grounded bullet &amp; summary synthesis.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Verifier Callbacks:</strong> Quantitative checks blocking fabricated numbers.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Complete 6-Stage Pipeline Agents List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#78827A] border-b border-[#ECE7DD] pb-1">
              End-to-End Multi-Agent Pipeline (All 10 Specialized Components)
            </h4>

            <div className="divide-y divide-[#F0EDE6] border border-[#ECE7DD] rounded-2xl overflow-hidden bg-[#FAF9F5]">
              {AGENTS.map((agent, i) => {
                const isCurrent = agent.routes.includes(pathname);
                return (
                  <div
                    key={agent.name}
                    className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                      isCurrent ? "bg-[#EAF4EB]/80" : "hover:bg-white"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#141A16] flex items-center gap-1.5">
                          {isCurrent && <span className="w-2 h-2 rounded-full bg-[#1E6B38]" />}
                          <span>{agent.name}</span>
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                          agent.framework === "CrewAI"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : agent.framework === "Google ADK"
                            ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                            : "bg-[#FAF9F5] text-[#556056] border-[#DDD7CA]"
                        }`}>
                          {agent.framework}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#556056] max-w-xl leading-relaxed">
                        {agent.role}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-semibold text-[#78827A] block">
                        {agent.stage}
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] font-bold text-[#1E6B38]">Active on this page</span>
                      ) : (
                        <Link
                          href={agent.routes[0]}
                          onClick={onClose}
                          className="text-[10px] text-[#1E6B38] hover:underline"
                        >
                          View screen →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#ECE7DD] bg-[#FAF9F5] flex items-center justify-between text-xs">
          <Link
            href="/faculty"
            onClick={onClose}
            className="text-xs font-bold text-[#1E6B38] hover:underline flex items-center gap-1"
          >
            <span>Open System Architecture &amp; Verification Portal →</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#121614] hover:bg-black text-white font-bold rounded-full transition-all cursor-pointer"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
}
