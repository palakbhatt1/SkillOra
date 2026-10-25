"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import AgentPanel from "./AgentPanel";
import Ambient from "./Ambient";
import RequirementsModal from "./RequirementsModal";

export const screens = [
  { href: "/sources", step: "1", label: "Sources", icon: "📥" },
  { href: "/verify", step: "2", label: "Fact Ledger", icon: "⚖️" },
  { href: "/job", step: "3", label: "Job Match", icon: "🎯" },
  { href: "/tailor", step: "4", label: "Tailor & Chat", icon: "✨" },
  // Phase 2 Roadmap (Commented out for 60% Mid-Term Milestone):
  // { href: "/score", step: "5", label: "Score & ATS", icon: "📊" },
  // { href: "/export", step: "6", label: "Export", icon: "⤓" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAgentTelemetry, setShowAgentTelemetry] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const { score, live, ready, llm, busy, error, notice, mode, profile, logout, analyzed } = useStore();

  const currentScreenIndex = screens.findIndex(s => s.href === path);
  const progressPercent = currentScreenIndex >= 0 ? ((currentScreenIndex + 1) / screens.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#141A16] flex flex-col relative selection:bg-[#DCFCE7] selection:text-[#166534]">
      <Ambient />

      {/* Top Thin Stage Progress Indicator */}
      {currentScreenIndex >= 0 && (
        <div className="w-full h-1 bg-[#EBE7DD] fixed top-0 left-0 right-0 z-50">
          <div 
            className="h-full bg-gradient-to-r from-[#2E9B4E] to-[#1E6B38] transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Main App Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#ECE7DD] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-7 h-7 transition-transform group-hover:rotate-12 duration-300">
                <Image 
                  src="/logo.png" 
                  alt="Skillora Logo" 
                  width={28} 
                  height={28} 
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-serif font-bold tracking-tight text-[#141A16]">
                Skillora
              </span>
            </Link>

            <span className="hidden sm:inline-block text-[11px] font-semibold text-[#1E6B38] bg-[#EAF4EB] border border-[#C5E1CB] px-2.5 py-0.5 rounded-full">
              Verified Workspace
            </span>
          </div>

          {/* Center 6-Stage Workflow Pills */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F3EFE6] p-1 rounded-full border border-[#E5E0D3]">
            {screens.map((screen) => {
              const isActive = path === screen.href;
              return (
                <Link
                  key={screen.href}
                  href={screen.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-white text-[#1E6B38] shadow-sm font-bold"
                      : "text-[#556056] hover:text-[#141A16] hover:bg-white/50"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isActive ? "bg-[#1E6B38] text-white" : "bg-[#DDD7CA] text-[#556056]"
                  }`}>
                    {screen.step}
                  </span>
                  <span>{screen.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-3">
            {/* Live ATS Score Pill (Phase 2 - commented out for Mid-Term) */}
            {/*
            <Link
              href="/score"
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E1D5] hover:border-[#1E6B38] shadow-sm transition-all"
            >
              <span className="text-xs text-[#6A756D] font-medium">ATS Score:</span>
              <span className="text-xs font-bold text-[#1E6B38]">
                {live && !analyzed ? "—" : `${score}/100`}
              </span>
            </Link>
            */}

            {/* 11 Requirements Matrix for Faculty & Evaluators */}
            <button
              type="button"
              onClick={() => setShowRequirements(true)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-[#EAF4EB] text-[#1E6B38] border border-[#BDE0C3] hover:bg-[#D5EBD7] transition-all cursor-pointer shadow-xs"
              title="View 11 Course Requirements Compliance Matrix"
            >
              <span>📋</span>
              <span className="hidden sm:inline">11 Requirements</span>
            </button>

            {/* Agent Telemetry Toggle */}
            <button
              type="button"
              onClick={() => setShowAgentTelemetry(!showAgentTelemetry)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showAgentTelemetry
                  ? "bg-[#1E6B38] text-white border-[#1E6B38] shadow-sm"
                  : "bg-white text-[#465048] border-[#E5E1D5] hover:border-[#CBD5E1]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                !ready ? "bg-amber-400" : live ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`} />
              <span className="hidden md:inline">Agents</span>
              <span>{showAgentTelemetry ? "✕" : "⚡"}</span>
            </button>

            {/* Candidate Avatar / Info */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E5E1D5]">
              <div className="w-7 h-7 rounded-full bg-[#1E6B38] text-white text-xs font-bold flex items-center justify-center">
                {profile.name ? profile.name.charAt(0) : "P"}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-xs font-bold text-[#141A16] leading-none">{profile.name || "Palak Bhatt"}</p>
                <p className="text-[10px] text-[#6B756E] leading-tight">Ledger Ready</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white border border-[#E5E1D5] text-[#141A16]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#ECE7DD] bg-[#FAF9F5] px-4 py-3 space-y-1.5 shadow-lg">
            {screens.map((screen) => (
              <Link
                key={screen.href}
                href={screen.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium ${
                  path === screen.href
                    ? "bg-[#EAF4EB] text-[#1E6B38] font-bold"
                    : "text-[#465048] hover:bg-white"
                }`}
              >
                <span>{screen.icon}</span>
                <span>{screen.step}. {screen.label}</span>
              </Link>
            ))}
            <div className="pt-2 border-t border-[#ECE7DD] flex items-center justify-between text-xs text-[#556056] px-2">
              <Link href="/how-it-works" className="hover:underline">How It Works</Link>
              <Link href="/login" className="hover:underline">Change Profile</Link>
            </div>
          </div>
        )}
      </header>

      {/* System Status / Agent Action Banners */}
      {(busy || error || notice) && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-sm transition-all ${
            error
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : busy
              ? "bg-[#EAF4EB] border-[#C5E1CB] text-[#1E6B38]"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}>
            {busy && (
              <div className="animate-spin w-4 h-4 border-2 border-[#1E6B38] border-t-transparent rounded-full shrink-0" />
            )}
            <span>{error ? `Attention: ${error}` : busy ? `${busy}…` : notice}</span>
          </div>
        </div>
      )}

      {/* Main Workspace Body & Collapsible Telemetry */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main App Content View */}
          <main className={showAgentTelemetry ? "lg:col-span-8 transition-all" : "lg:col-span-12 transition-all"}>
            {children}
            {mode === "rules" && (
              <p className="text-xs text-[#78827A] mt-4 text-center">
                Running in deterministic fallback mode (RapidFuzz & exact matching).
              </p>
            )}
          </main>

          {/* Agent Telemetry Drawer (CrewAI + Google ADK) */}
          {showAgentTelemetry && (
            <aside className="lg:col-span-4 sticky top-24 bg-white rounded-2xl border border-[#ECE7DD] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DD]">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <h3 className="text-sm font-bold text-[#141A16]">Agent Telemetry</h3>
                </div>
                <button
                  onClick={() => setShowAgentTelemetry(false)}
                  className="text-xs text-[#78827A] hover:text-[#141A16] px-2 py-1 rounded-lg hover:bg-[#FAF9F5]"
                >
                  ✕ Close
                </button>
              </div>
              <AgentPanel />
            </aside>
          )}

        </div>
      </div>

      {/* Persistent Footer */}
      <footer className="mt-auto border-t border-[#ECE7DD] bg-[#FAF9F5] py-4 text-xs text-[#78827A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-800">Skillora</span>
            <span>· Deterministic Grounding & Multi-Agent Resume Architecture</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/how-it-works" className="hover:text-[#141A16] hover:underline">How It Works</Link>
            <Link href="/verify" className="hover:text-[#141A16] hover:underline">Fact Ledger</Link>
            <Link href="/export" className="hover:text-[#141A16] hover:underline">Export Resume</Link>
          </div>
        </div>
      </footer>
      <RequirementsModal isOpen={showRequirements} onClose={() => setShowRequirements(false)} />
    </div>
  );
}
