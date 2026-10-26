"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

function IconArrowRight({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function IconArrowDown({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}

function IconRefresh({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
    role: "Multi-tier defense: pre-parser injection scanner and slide classifier rejecting non-resume documents with HTTP 422.",
    inputs: "Unfiltered user files and target job descriptions",
    outputs: "Sanitized text or blocked claim alerts with security audit logs",
    activeWhen: "Any external document or JD text is submitted",
  },
  {
    name: "Fact Ledger & Verification Engine",
    framework: "Deterministic Engine",
    stage: "Stage 2: Fact Ledger",
    routes: ["/verify"],
    role: "Maintains relational SQLite ledger storing immutable evidence. Tracks status ('verified' | 'pending' | 'rejected') with human-in-the-loop review.",
    inputs: "Candidate facts extracted from sources",
    outputs: "Verified career facts with verbatim proof quotes",
    activeWhen: "Inspecting, editing, or verifying ledger claims on /verify",
  },
  {
    name: "JD Analyzer Agent",
    framework: "CrewAI",
    stage: "Stage 3: Job Match",
    routes: ["/job"],
    role: "Parses job description into structured requirements using output_pydantic=JobRequirement, separating must-haves from nice-to-haves.",
    inputs: "Raw job description text",
    outputs: "Structured requirements list with seniority level & core technologies",
    activeWhen: "Analyzing target job description on /job",
  },
  {
    name: "Requirement Matcher Agent",
    framework: "CrewAI",
    stage: "Stage 3: Evidence Linking",
    routes: ["/job"],
    role: "Runs a 3-tier matching cascade: Exact token match → RapidFuzz normalized match → Semantic vector embeddings to link facts.",
    inputs: "Structured JD requirements + verified fact ledger claims",
    outputs: "Requirement-to-fact linkings with confidence scores and citations",
    activeWhen: "Linking job requirements to candidate facts on /job",
  },
  {
    name: "Deterministic ATS Scoring Engine",
    framework: "Deterministic Engine",
    stage: "Stage 4: Score & ATS",
    routes: ["/score"],
    role: "Pure Python deterministic algorithm (zero LLM drift). Computes 5 weighted dimensions: Keywords, Job Fit, Experience, Evidence Quality, and Education.",
    inputs: "Matched requirements, candidate facts, scoring profile weights",
    outputs: "Explainable 0–100 score with exact breakdown and gap analysis",
    activeWhen: "Evaluating job fit and ATS dimensions on /score",
  },
  {
    name: "Google ADK Coordinator Agent",
    framework: "Google ADK",
    stage: "Stage 5: Improve Resume",
    routes: ["/tailor"],
    role: "Conversational coordinator powered by google-adk. Manages session state and executes registered tools to mutate the resume canvas.",
    inputs: "User natural language prompts or showcase command clicks",
    outputs: "Tool executions (set_summary, add_bullet, set_bullet, set_project_included, undo_last_edit)",
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
    role: "Zero-hallucination callback verifier. Scans every synthesized bullet to ensure numbers, technologies, and metrics match verbatim source quotes.",
    inputs: "Generated bullets + quoted source fact spans",
    outputs: "Verification pass/fail status and automatic revision loop feedback",
    activeWhen: "Running verifier or updating bullets on /tailor",
  },
  {
    name: "FastMCP Server & Preflight Engine",
    framework: "Deterministic Engine",
    stage: "Stage 6: Export & MCP",
    routes: ["/export"],
    role: "Runs final integrity checks ensuring 100% citation grounding, exposes 4 FastMCP tools (/api/mcp/tools), and produces vector PDF and DOCX.",
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
  const [activeTab, setActiveTab] = useState<"end-to-end" | "subsystems" | "directory">("end-to-end");
  const [subsystemTab, setSubsystemTab] = useState<"crewai" | "adk" | "mcp" | "guardrails">("crewai");

  if (!isOpen) return null;

  const currentAgent = AGENTS.find((a) => a.routes.includes(pathname));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-[#ECE7DD] flex flex-col overflow-hidden text-[#141A16]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#ECE7DD] bg-[#FAF9F5] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#EAF4EB] text-[#1E6B38]">
                <IconNetwork className="w-4 h-4 text-[#1E6B38]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB]">
                Multi-Agent Architecture
              </span>
              <span className="text-xs text-[#78827A]">Dual Framework: CrewAI + Google ADK</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#141A16]">
              Agent Systems &amp; Complete Execution Flowcharts
            </h2>
            <p className="text-xs text-[#556056]">
              Comprehensive technical flowcharts: end-to-end project workflow, individual agent architectures, and execution handoffs.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#78827A] hover:text-[#141A16] hover:bg-white rounded-full border border-transparent hover:border-[#ECE7DD] transition-all cursor-pointer ml-2"
          >
            <IconClose className="w-5 h-5 text-[#556056]" />
          </button>
        </div>

        {/* View Selection Tabs */}
        <div className="px-6 py-2.5 border-b border-[#ECE7DD] bg-white flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("end-to-end")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "end-to-end"
                ? "bg-[#1E6B38] text-white shadow-xs"
                : "bg-[#FAF9F5] text-[#556056] border border-[#DDD7CA] hover:bg-[#F3EFE6]"
            }`}
          >
            <IconNetwork className="w-3.5 h-3.5" />
            <span>End-to-End Project Flowchart</span>
          </button>

          <button
            onClick={() => setActiveTab("subsystems")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "subsystems"
                ? "bg-[#1E6B38] text-white shadow-xs"
                : "bg-[#FAF9F5] text-[#556056] border border-[#DDD7CA] hover:bg-[#F3EFE6]"
            }`}
          >
            <IconZap className="w-3.5 h-3.5" />
            <span>Individual Agent Architectures</span>
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "directory"
                ? "bg-[#1E6B38] text-white shadow-xs"
                : "bg-[#FAF9F5] text-[#556056] border border-[#DDD7CA] hover:bg-[#F3EFE6]"
            }`}
          >
            <IconBot className="w-3.5 h-3.5" />
            <span>Active Screen Agent &amp; Directory</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#FAF9F5]/50">
          
          {/* TAB 1: END-TO-END PROJECT FLOWCHART */}
          {activeTab === "end-to-end" && (
            <div className="space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-[#ECE7DD] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif font-bold text-[#141A16] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E6B38]" />
                    <span>SkillOra Complete End-to-End System Flowchart</span>
                  </h3>
                  <span className="text-[11px] font-mono text-[#78827A] bg-[#FAF9F5] px-2.5 py-1 rounded-full border border-[#ECE7DD]">
                    6 Stages · 10 Specialized Agents
                  </span>
                </div>
                <p className="text-xs text-[#556056] leading-relaxed">
                  How candidate data flows from raw unverified inputs to verified character-anchored facts, through CrewAI job matching, state transformation into Google ADK session memory, Verifier feedback loops, and deterministic ATS export.
                </p>
              </div>

              {/* Visual Flowchart Diagram Canvas */}
              <div className="space-y-4">
                
                {/* Step 1: Ingestion & Safety Guardrail Gate */}
                <div className="bg-white p-4 rounded-xl border border-[#ECE7DD] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1E6B38] text-white font-bold text-xs flex items-center justify-center">1</span>
                      <h4 className="text-sm font-bold text-[#141A16]">Multi-Modal Ingestion &amp; Pre-Parser Guardrails</h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      CrewAI + Python Guardrails
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#ECE7DD] space-y-1">
                      <p className="font-bold text-[#141A16]">Candidate Inputs</p>
                      <p className="text-[#556056] text-[11px]">PDF Resumes, DOCX files, PPTX slides, GitHub repos, and raw Markdown notes.</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <span>Pre-Parser Guardrail Gate</span>
                      </p>
                      <p className="text-[11px]">Quarantines injection overrides; classifies documents and blocks course slides with HTTP 422.</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                      <p className="font-bold">CrewAI Source Extractor</p>
                      <p className="text-[11px]">Task extracts atomic career facts with verbatim character-offset coordinates in source docs.</p>
                    </div>
                  </div>
                </div>

                {/* Arrow Connector */}
                <div className="flex justify-center text-[#78827A]">
                  <IconArrowDown className="w-4 h-4 text-[#1E6B38]" />
                </div>

                {/* Step 2: Relational SQLite Ledger & Human Review */}
                <div className="bg-white p-4 rounded-xl border border-[#ECE7DD] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1E6B38] text-white font-bold text-xs flex items-center justify-center">2</span>
                      <h4 className="text-sm font-bold text-[#141A16]">Atomic Fact Ledger &amp; Human-in-the-Loop Review</h4>
                    </div>
                    <span className="text-[10px] font-bold text-[#1E6B38] bg-[#EAF4EB] px-2 py-0.5 rounded-full border border-[#C5E1CB]">
                      SQLite Engine (/verify)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#ECE7DD] space-y-1">
                      <p className="font-bold text-[#141A16]">Verbatim Evidence Storage</p>
                      <p className="text-[#556056] text-[11px]">Immutable Fact rows: ID, text, project, source_id, char_start, char_end, and tech stack tags.</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#ECE7DD] space-y-1">
                      <p className="font-bold text-[#141A16]">Candidate Approval Gate</p>
                      <p className="text-[#556056] text-[11px]">Candidates review pending facts: only 'verified' facts are admitted to the active tailoring pool.</p>
                    </div>
                  </div>
                </div>

                {/* Arrow Connector */}
                <div className="flex justify-center text-[#78827A]">
                  <IconArrowDown className="w-4 h-4 text-[#1E6B38]" />
                </div>

                {/* Step 3: CrewAI Job Analysis & 3-Tier Matcher */}
                <div className="bg-white p-4 rounded-xl border border-[#ECE7DD] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1E6B38] text-white font-bold text-xs flex items-center justify-center">3</span>
                      <h4 className="text-sm font-bold text-[#141A16]">CrewAI Job Analyzer &amp; 3-Tier Matching Cascade</h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      CrewAI Flow (/job)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                      <p className="font-bold">JD Analyzer Agent</p>
                      <p className="text-[11px]">Pydantic v2 JobRequirement schema splits must-haves, nice-to-haves, and core keywords.</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#ECE7DD] space-y-1">
                      <p className="font-bold text-[#141A16]">3-Tier Matching Cascade</p>
                      <p className="text-[#556056] text-[11px]">Tier 1 Exact Match → Tier 2 RapidFuzz Normalization → Tier 3 Vector Embeddings.</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-1">
                      <p className="font-bold">Cross-Framework Bridge</p>
                      <p className="text-[11px]">Transforms requirement dictionaries directly into Google ADK session context without DB roundtrips.</p>
                    </div>
                  </div>
                </div>

                {/* Arrow Connector */}
                <div className="flex justify-center text-[#78827A]">
                  <IconArrowDown className="w-4 h-4 text-[#1E6B38]" />
                </div>

                {/* Step 4: Google ADK Tailoring & Verifier Feedback Loop */}
                <div className="bg-white p-4 rounded-xl border border-[#ECE7DD] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1E6B38] text-white font-bold text-xs flex items-center justify-center">4</span>
                      <h4 className="text-sm font-bold text-[#141A16]">Google ADK Tailoring &amp; Verifier Callback Loop</h4>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      Google ADK (/tailor)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-1">
                      <p className="font-bold">ADK Coordinator Agent</p>
                      <p className="text-[11px]">Interactive multi-tool assistant: executes set_summary, add_bullet, and undo_last_edit.</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-1">
                      <p className="font-bold">ADK Resume Writer</p>
                      <p className="text-[11px]">Drafts bullets and summary grounded in verified fact IDs using Google XYZ metric framework.</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#ECE7DD] space-y-1">
                      <p className="font-bold text-[#141A16] flex items-center gap-1">
                        <IconRefresh className="w-3 h-3 text-[#1E6B38]" />
                        <span>Verifier Callback Loop</span>
                      </p>
                      <p className="text-[#556056] text-[11px]">Deterministic number &amp; tech checks; catches hallucinations and loops back for revision.</p>
                    </div>
                  </div>
                </div>

                {/* Arrow Connector */}
                <div className="flex justify-center text-[#78827A]">
                  <IconArrowDown className="w-4 h-4 text-[#1E6B38]" />
                </div>

                {/* Step 5: FastMCP Protocol & Scoring Engine */}
                <div className="bg-white p-4 rounded-xl border border-[#ECE7DD] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1E6B38] text-white font-bold text-xs flex items-center justify-center">5</span>
                      <h4 className="text-sm font-bold text-[#141A16]">FastMCP Protocol &amp; Deterministic ATS Scoring</h4>
                    </div>
                    <span className="text-[10px] font-bold text-[#1E6B38] bg-[#EAF4EB] px-2 py-0.5 rounded-full border border-[#C5E1CB]">
                      FastMCP + Python Engine (/score)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#ECE7DD] space-y-1">
                      <p className="font-bold text-[#141A16]">Anthropic FastMCP Server</p>
                      <p className="text-[#556056] text-[11px]">4 registered tools (file_parser, ledger_db_lookup, github_crawler, ats_calculator) at /api/mcp/tools.</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#ECE7DD] space-y-1">
                      <p className="font-bold text-[#141A16]">Deterministic 5-Factor Score</p>
                      <p className="text-[#556056] text-[11px]">Calculates Keywords (K), Job Fit (J), Experience (E), Quality (Q), Education (A) with 0 drift.</p>
                    </div>
                  </div>
                </div>

                {/* Arrow Connector */}
                <div className="flex justify-center text-[#78827A]">
                  <IconArrowDown className="w-4 h-4 text-[#1E6B38]" />
                </div>

                {/* Step 6: Preflight Verifier & Final Export */}
                <div className="bg-white p-4 rounded-xl border border-[#ECE7DD] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1E6B38] text-white font-bold text-xs flex items-center justify-center">6</span>
                      <h4 className="text-sm font-bold text-[#141A16]">Preflight Integrity Gate &amp; Multi-Format Export</h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                      ReportLab + python-docx (/export)
                    </span>
                  </div>

                  <p className="text-xs text-[#556056] leading-relaxed">
                    Preflight checklist verifies 100% citation grounding, zero unverified claims, and locks score. Generates clean ATS-compliant vector PDF and editable Word DOCX.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: INDIVIDUAL AGENT ARCHITECTURES & FLOWCHARTS */}
          {activeTab === "subsystems" && (
            <div className="space-y-5">
              
              {/* Subsystem Subtabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#ECE7DD] flex-wrap">
                <button
                  onClick={() => setSubsystemTab("crewai")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    subsystemTab === "crewai"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "text-[#556056] hover:text-[#141A16]"
                  }`}
                >
                  CrewAI Batch Flowchart
                </button>

                <button
                  onClick={() => setSubsystemTab("adk")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    subsystemTab === "adk"
                      ? "bg-indigo-50 text-indigo-800 border border-indigo-200"
                      : "text-[#556056] hover:text-[#141A16]"
                  }`}
                >
                  Google ADK Verifier Loop
                </button>

                <button
                  onClick={() => setSubsystemTab("mcp")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    subsystemTab === "mcp"
                      ? "bg-[#EAF4EB] text-[#1E6B38] border border-[#C5E1CB]"
                      : "text-[#556056] hover:text-[#141A16]"
                  }`}
                >
                  FastMCP &amp; Scoring Architecture
                </button>

                <button
                  onClick={() => setSubsystemTab("guardrails")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    subsystemTab === "guardrails"
                      ? "bg-amber-50 text-amber-900 border border-amber-200"
                      : "text-[#556056] hover:text-[#141A16]"
                  }`}
                >
                  Guardrails &amp; Security Flowchart
                </button>
              </div>

              {/* Subsystem 1: CrewAI Batch Extraction & Matcher Flowchart */}
              {subsystemTab === "crewai" && (
                <div className="bg-white p-5 rounded-2xl border border-[#ECE7DD] space-y-4">
                  <div className="border-b border-[#ECE7DD] pb-3 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      CrewAI Architecture
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#141A16]">
                      CrewAI Multi-Agent Ingestion &amp; 3-Tier Matcher Flowchart
                    </h3>
                    <p className="text-xs text-[#556056]">
                      Handles batch extraction, Pydantic schema validation, tech stack enrichment, and cascading requirement matching.
                    </p>
                  </div>

                  {/* Flowchart Steps */}
                  <div className="space-y-3 font-sans text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#141A16]">1. Multi-Modal Document Parsing</span>
                        <span className="font-mono text-[10px] text-[#78827A]">parsers.py</span>
                      </div>
                      <p className="text-[#556056]">PDF (pypdf), DOCX (python-docx), PPTX (python-pptx), or GitHub API cralwer extract text buffer.</p>
                    </div>

                    <div className="flex justify-center text-[#1E6B38]"><IconArrowDown className="w-3.5 h-3.5" /></div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950">2. CrewAI Source Extractor Task</span>
                        <span className="font-mono text-[10px] text-emerald-800">crew_flows.py</span>
                      </div>
                      <p className="text-emerald-900">Task enforces output_pydantic=FactSchema. Extracts atomic claims citing verbatim coordinate spans.</p>
                    </div>

                    <div className="flex justify-center text-[#1E6B38]"><IconArrowDown className="w-3.5 h-3.5" /></div>

                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#141A16]">3. Structure Enrichment &amp; Ledger Write</span>
                        <span className="font-mono text-[10px] text-[#78827A]">structure.py → db.py</span>
                      </div>
                      <p className="text-[#556056]">Generates one fact per skill, builds project tech-stack lines, and commits to SQLite with 'pending' status.</p>
                    </div>

                    <div className="flex justify-center text-[#1E6B38]"><IconArrowDown className="w-3.5 h-3.5" /></div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950">4. CrewAI JD Analyzer &amp; 3-Tier Matcher</span>
                        <span className="font-mono text-[10px] text-emerald-800">matching.py</span>
                      </div>
                      <p className="text-emerald-900">Splits JD into must vs nice-to-haves. Runs Tier 1 Exact Match → Tier 2 RapidFuzz → Tier 3 Embeddings.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Subsystem 2: Google ADK Coordinator & Verifier Loop Flowchart */}
              {subsystemTab === "adk" && (
                <div className="bg-white p-5 rounded-2xl border border-[#ECE7DD] space-y-4">
                  <div className="border-b border-[#ECE7DD] pb-3 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      Google ADK Architecture
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#141A16]">
                      Google ADK Coordinator &amp; Verifier Feedback Loop Flowchart
                    </h3>
                    <p className="text-xs text-[#556056]">
                      Stateful conversational tailoring engine powered by google-adk LlmAgent with registered tools and verifier_callback.
                    </p>
                  </div>

                  {/* Flowchart Steps */}
                  <div className="space-y-3 font-sans text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#141A16]">1. Candidate Conversational Input</span>
                        <span className="font-mono text-[10px] text-[#78827A]">tailor/page.tsx</span>
                      </div>
                      <p className="text-[#556056]">Candidate types instruction (e.g. "Rewrite summary for Senior AI role" or "Quantify with XYZ metrics").</p>
                    </div>

                    <div className="flex justify-center text-indigo-600"><IconArrowDown className="w-3.5 h-3.5" /></div>

                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-950">2. ADK Coordinator &amp; Fast Intent Router</span>
                        <span className="font-mono text-[10px] text-indigo-800">orchestrator.py</span>
                      </div>
                      <p className="text-indigo-900">Executes tools: set_summary, add_bullet, set_bullet, set_project_included, or undo_last_edit.</p>
                    </div>

                    <div className="flex justify-center text-indigo-600"><IconArrowDown className="w-3.5 h-3.5" /></div>

                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-950">3. ADK Resume Writer Synthesis</span>
                        <span className="font-mono text-[10px] text-indigo-800">adk_agents.py</span>
                      </div>
                      <p className="text-indigo-900">Synthesizes bullets weaving verified facts using Google XYZ framework (Accomplished [X] measured by [Y] by doing [Z]).</p>
                    </div>

                    <div className="flex justify-center text-indigo-600"><IconArrowDown className="w-3.5 h-3.5" /></div>

                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950">4. Decision Gate: ADK Verifier Callback</span>
                        <span className="font-mono text-[10px] text-amber-800">verifier_callback()</span>
                      </div>
                      <p className="text-amber-900">
                        Checks every number, percentage, and tech against source quote span. If any ungrounded metric is found:
                      </p>
                      <div className="p-2 rounded-lg bg-white border border-amber-200 font-mono text-[11px] text-rose-700">
                        Revision Loop: Sends rejected claim back to Writer → Rewrites failed bullets (max 2 rounds).
                      </div>
                    </div>

                    <div className="flex justify-center text-[#1E6B38]"><IconArrowDown className="w-3.5 h-3.5" /></div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950">5. Grounded Resume Canvas Commit</span>
                        <span className="font-mono text-[10px] text-emerald-800">tailor/page.tsx</span>
                      </div>
                      <p className="text-emerald-900">Verified bullets committed to resume sheet; React state immediately re-renders canvas.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Subsystem 3: FastMCP Protocol & Scoring Flowchart */}
              {subsystemTab === "mcp" && (
                <div className="bg-white p-5 rounded-2xl border border-[#ECE7DD] space-y-4">
                  <div className="border-b border-[#ECE7DD] pb-3 space-y-1">
                    <span className="text-[10px] font-bold text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB]">
                      MCP &amp; Scoring Architecture
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#141A16]">
                      Model Context Protocol (FastMCP) &amp; Deterministic Scoring Flowchart
                    </h3>
                    <p className="text-xs text-[#556056]">
                      FastMCP tool-calling interface and pure-Python scoring algorithm (100% deterministic, zero LLM drift).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* FastMCP Tools Column */}
                    <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD] space-y-3">
                      <h4 className="font-bold text-[#141A16] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1E6B38]" />
                        <span>Anthropic FastMCP Server (mcp_server.py)</span>
                      </h4>
                      <div className="space-y-2">
                        <div className="p-2 bg-white rounded-lg border border-[#ECE7DD]">
                          <p className="font-mono font-bold text-[#1E6B38] text-[11px]">file_parser_mcp</p>
                          <p className="text-[#556056] text-[11px]">Multi-format file extraction into coordinate fact chunks.</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-[#ECE7DD]">
                          <p className="font-mono font-bold text-[#1E6B38] text-[11px]">ledger_db_lookup_mcp</p>
                          <p className="text-[#556056] text-[11px]">Relational SQLite lookups filtered by user and project.</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-[#ECE7DD]">
                          <p className="font-mono font-bold text-[#1E6B38] text-[11px]">github_crawler_mcp</p>
                          <p className="text-[#556056] text-[11px]">GitHub repository crawler extracting trees and commit history.</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-[#ECE7DD]">
                          <p className="font-mono font-bold text-[#1E6B38] text-[11px]">ats_calculator_mcp</p>
                          <p className="text-[#556056] text-[11px]">Computes explainable ATS match dimensions.</p>
                        </div>
                      </div>
                    </div>

                    {/* Deterministic Scoring Engine Column */}
                    <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD] space-y-3">
                      <h4 className="font-bold text-[#141A16] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1E6B38]" />
                        <span>Deterministic Scoring Engine (scoring.py)</span>
                      </h4>
                      <div className="space-y-2">
                        <div className="p-2 bg-white rounded-lg border border-[#ECE7DD]">
                          <p className="font-bold text-[#141A16] text-[11px]">Keywords (K) · 25% Weight</p>
                          <p className="text-[#556056] text-[11px]">Coverage of job-specific technical keywords in verified ledger.</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-[#ECE7DD]">
                          <p className="font-bold text-[#141A16] text-[11px]">Job Fit (J) · 30% Weight</p>
                          <p className="text-[#556056] text-[11px]">Weighted match score for core must-have responsibilities.</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-[#ECE7DD]">
                          <p className="font-bold text-[#141A16] text-[11px]">Experience (E) · 20% Weight</p>
                          <p className="text-[#556056] text-[11px]">Target seniority match compared against candidate background.</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-[#ECE7DD]">
                          <p className="font-bold text-[#141A16] text-[11px]">Evidence Quality (Q) · 15% Weight</p>
                          <p className="text-[#556056] text-[11px]">Directness, ownership, and verbatim verifiable proof.</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-[#ECE7DD]">
                          <p className="font-bold text-[#141A16] text-[11px]">Education (A) · 10% Weight</p>
                          <p className="text-[#556056] text-[11px]">Degree and university qualifications match.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Subsystem 4: Guardrails & Security Flowchart */}
              {subsystemTab === "guardrails" && (
                <div className="bg-white p-5 rounded-2xl border border-[#ECE7DD] space-y-4">
                  <div className="border-b border-[#ECE7DD] pb-3 space-y-1">
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Security &amp; Guardrails
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#141A16]">
                      Multi-Tier Security &amp; Document Classification Flowchart
                    </h3>
                    <p className="text-xs text-[#556056]">
                      Pre-parser injection defense, presentation slide blocker, and runtime hallucination quarantine.
                    </p>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-amber-950">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Layer 1: Pre-Parser Document Classifier</span>
                        <span className="font-mono text-[10px] text-amber-800">validate_resume_document()</span>
                      </div>
                      <p className="text-[11px] text-amber-900">
                        Scans incoming files for non-resume slide markers (e.g. "Lecture", "Course", "Topic", slide ratios). If detected, triggers immediate HTTP 422 quarantine with custom reason.
                      </p>
                    </div>

                    <div className="flex justify-center text-amber-700"><IconArrowDown className="w-3.5 h-3.5" /></div>

                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-amber-950">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Layer 2: Prompt Injection Sanitizer</span>
                        <span className="font-mono text-[10px] text-amber-800">check_input()</span>
                      </div>
                      <p className="text-[11px] text-amber-900">
                        Quarantines adversarial system override attempts (e.g. "ignore previous instructions", "act as root", instruction delimiters) before reaching LLM tokenizers.
                      </p>
                    </div>

                    <div className="flex justify-center text-[#1E6B38]"><IconArrowDown className="w-3.5 h-3.5" /></div>

                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-emerald-950">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Layer 3: Verifier Callback Grounding</span>
                        <span className="font-mono text-[10px] text-emerald-800">verify_bullet_against_facts()</span>
                      </div>
                      <p className="text-[11px] text-emerald-900">
                        Blocks ungrounded hallucinated numbers or fabricated skills with 100% precision on evaluation benchmarks.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: ACTIVE SCREEN AGENT & COMPLETE COMPONENT DIRECTORY */}
          {activeTab === "directory" && (
            <div className="space-y-5">
              
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

              {/* Complete 10 Agents Directory */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#78827A] border-b border-[#ECE7DD] pb-1">
                  Complete Multi-Agent Directory (All 10 Specialized Systems)
                </h4>

                <div className="divide-y divide-[#F0EDE6] border border-[#ECE7DD] rounded-2xl overflow-hidden bg-white">
                  {AGENTS.map((agent) => {
                    const isCurrent = agent.routes.includes(pathname);
                    return (
                      <div
                        key={agent.name}
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                          isCurrent ? "bg-[#EAF4EB]/80" : "hover:bg-[#FAF9F5]"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#141A16] flex items-center gap-1.5">
                              {isCurrent && <span className="w-2 h-2 rounded-full bg-[#1E6B38]" />}
                              <span>{agent.name}</span>
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#ECE7DD] bg-white flex items-center justify-between text-xs">
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
            className="px-5 py-2 bg-[#121614] hover:bg-black text-white font-bold rounded-full transition-all cursor-pointer shadow-xs"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
}
