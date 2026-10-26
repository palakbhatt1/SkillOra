"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import RequirementsModal from "@/components/RequirementsModal";
import AgentPanel from "@/components/AgentPanel";

function IconClipboard({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function IconZap({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function IconScale({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-4 9 4m-9-4v20m0 0l-4-4m4 4l4-4M5 10l4 7H1l4-7zm14 0l4 7h-8l4-7z" />
    </svg>
  );
}

function IconDocument({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function IconInspect({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
  );
}

export default function FacultyPage() {
  const st = useStore();
  const [showRequirements, setShowRequirements] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB] flex items-center gap-1.5">
              <IconInspect className="w-3.5 h-3.5 text-[#1E6B38]" />
              <span>System Architecture &amp; Verification</span>
            </span>
            <span className="text-xs text-[#78827A]">Core Infrastructure &amp; Systems Inspection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141A16] tracking-tight">
            System Architecture &amp; Verification
          </h1>
          <p className="text-sm text-[#556056] max-w-2xl leading-relaxed">
            Technical inspection portal for system architecture. Verify multi-agent orchestration, deterministic fact grounding, prompt injection guardrails, and MCP tool servers.
          </p>
        </div>

        <Link
          href="/job"
          className="px-6 py-2.5 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>← Back to User Workspace</span>
        </Link>
      </div>

      {/* 4 Technical Pillar Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Requirements */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-[#EAF4EB] text-[#1E6B38]">
                <IconClipboard className="w-5 h-5 text-[#1E6B38]" />
              </span>
              <span className="text-[10px] font-bold text-[#1E6B38] bg-[#EAF4EB] px-2 py-0.5 rounded-full border border-[#C5E1CB]">
                Compliance Matrix
              </span>
            </div>
            <h3 className="text-base font-serif font-bold text-[#141A16]">
              Requirements
            </h3>
            <p className="text-xs text-[#556056] leading-relaxed">
              Complete traceability matrix mapping every requirement (Dual Frameworks, MCP, Grounding, Guardrails, LangFuse) directly to implementation files.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowRequirements(true)}
            className="w-full py-2.5 rounded-xl bg-[#EAF4EB] hover:bg-[#D5EBD7] text-[#1E6B38] font-bold text-xs border border-[#C5E1CB] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Open Requirements</span>
            <span>→</span>
          </button>
        </div>

        {/* Card 2: Dual Multi-Agent Telemetry */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                <IconZap className="w-5 h-5 text-emerald-700" />
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                CrewAI + Google ADK
              </span>
            </div>
            <h3 className="text-base font-serif font-bold text-[#141A16]">
              Agent Telemetry &amp; Execution
            </h3>
            <p className="text-xs text-[#556056] leading-relaxed">
              Inspect real-time agent execution traces, CrewAI flow orchestrations, Google ADK resume synthesis, and evaluator-optimizer loops.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAgentPanel(!showAgentPanel)}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-[#FAF9F5] text-[#141A16] font-bold text-xs border border-[#DDD7CA] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{showAgentPanel ? "Hide Agent Telemetry Drawer" : "Open Agent Telemetry Drawer"}</span>
          </button>
        </div>

        {/* Card 3: Fact Ledger & Citation Grounding */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-[#EAF4EB] text-[#1E6B38]">
                <IconScale className="w-5 h-5 text-[#1E6B38]" />
              </span>
              <span className="text-[10px] font-bold text-[#1E6B38] bg-[#EAF4EB] px-2 py-0.5 rounded-full border border-[#C5E1CB]">
                {st.facts.length} Verified Claims
              </span>
            </div>
            <h3 className="text-base font-serif font-bold text-[#141A16]">
              Verifiable Career Fact Ledger
            </h3>
            <p className="text-xs text-[#556056] leading-relaxed">
              Relational SQLite fact store storing verbatim character-offset citations. Human-in-the-loop review and callback verification.
            </p>
          </div>

          <Link
            href="/verify"
            className="w-full py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAF4EB] text-[#1E6B38] font-bold text-xs border border-[#ECE7DD] transition-all flex items-center justify-center gap-1.5"
          >
            <span>Inspect Fact Ledger Engine</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 4: Source Ingestion & MCP Tools */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <IconDocument className="w-5 h-5 text-indigo-700" />
              </span>
              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                FastMCP (4 Tools)
              </span>
            </div>
            <h3 className="text-base font-serif font-bold text-[#141A16]">
              Source Parsers &amp; MCP Protocol
            </h3>
            <p className="text-xs text-[#556056] leading-relaxed">
              Multi-modal document extraction (PDF, DOCX, PPTX), GitHub repository crawling, prompt injection guardrails, and Model Context Protocol server.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/sources"
              className="flex-1 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAF4EB] text-[#141A16] font-bold text-xs border border-[#ECE7DD] transition-all text-center"
            >
              Source Ingestion
            </Link>
            <a
              href="http://127.0.0.1:8000/api/mcp/tools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-[#1E6B38] hover:bg-[#16532B] text-white font-bold text-xs transition-all text-center shadow-xs"
            >
              MCP API (JSON) ↗
            </a>
          </div>
        </div>

      </div>

      {/* Embedded Agent Drawer if toggled */}
      {showAgentPanel && (
        <div className="p-6 rounded-2xl bg-white border border-[#1E6B38]/30 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE7DD] pb-3">
            <h4 className="text-base font-serif font-bold text-[#141A16]">Live Multi-Agent Telemetry Stream</h4>
            <button
              onClick={() => setShowAgentPanel(false)}
              className="text-xs text-[#78827A] hover:text-[#141A16]"
            >
              ✕ Close
            </button>
          </div>
          <AgentPanel />
        </div>
      )}

      {/* 11 Requirements Modal */}
      {showRequirements && (
        <RequirementsModal isOpen={showRequirements} onClose={() => setShowRequirements(false)} />
      )}

    </div>
  );
}
