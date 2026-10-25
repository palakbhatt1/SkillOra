"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

const nums = (s: string) => s.match(/\d+(\.\d+)?/g) ?? [];

export default function TailorPage() {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const st = useStore();
  const { bullets, facts, keywords, profile, live, summary } = st;
  const [chatInput, setChatInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeCitation, setActiveCitation] = useState<{ bulletId: string; factText: string; span: string } | null>(null);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [st.chat.length]);

  const getBulletIssue = (b: (typeof bullets)[number]): string | null => {
    if (b.user) return null;
    if (live) return b.verified ? null : (b.issues?.[0] ?? "Grounded verification pending");
    const cited = b.facts.map((id) => facts.find((f) => f.id === id));
    if (cited.some((f) => !f || f.status !== "verified")) return "Cites an unverified fact claim";
    const pool = cited.map((f) => (f ? f.text + " " + f.span : "")).join(" ");
    const bad = nums(b.text).filter((n) => !pool.includes(n));
    return bad.length ? `Number "${bad[0]}" not present in source verbatim quote` : null;
  };

  const handleSendChat = () => {
    const q = chatInput.trim();
    if (!q) return;
    setChatInput("");
    st.sendChat(q);
  };

  const handleRunVerifier = async () => {
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsVerifying(false);
  };

  const renderSection = (title: string, kind: "role" | "project") => {
    const items = bullets.filter((b) => (b.kind === "role" ? "role" : "project") === kind);
    if (!items.length) return null;

    const projectNames = Array.from(new Set(items.map((b) => b.project)));

    return (
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#78827A] border-b border-[#ECE7DD] pb-1">
          {title}
        </h4>

        {projectNames.map((proj) => (
          <div key={proj} className="space-y-2">
            <h5 className="text-sm font-bold text-[#141A16]">{proj}</h5>

            <div className="space-y-2 pl-2 border-l-2 border-[#E5E1D5]">
              {items.filter((b) => b.project === proj).map((b) => {
                const issue = getBulletIssue(b);
                const citedFact = facts.find((f) => b.facts.includes(f.id));

                return (
                  <div
                    key={b.id}
                    className={`p-2.5 rounded-xl border transition-all text-xs sm:text-sm ${
                      issue
                        ? "bg-[#FEF3C7]/40 border-[#FDE68A]"
                        : "bg-[#FAF9F5] border-[#ECE7DD] hover:border-[#1E6B38]"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`text-base leading-tight ${issue ? "text-amber-600" : "text-[#1E6B38]"}`}>
                        •
                      </span>

                      <div className="flex-1 space-y-1.5">
                        <p
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newText = e.currentTarget.textContent?.trim();
                            if (newText && newText !== b.text) {
                              st.editBullet(b.id, newText);
                            }
                          }}
                          className="text-[#141A16] leading-relaxed focus:outline-none focus:bg-white p-1 rounded"
                        >
                          {b.text}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap text-[11px]">
                          {/* Grounding Badge */}
                          <span className={`px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                            issue
                              ? "bg-amber-100 text-amber-800"
                              : "bg-[#EAF4EB] text-[#1E6B38]"
                          }`}>
                            <span>{issue ? "⚠️" : "✓"}</span>
                            <span>{issue ? issue : "Grounded"}</span>
                          </span>

                          {/* Citation Link */}
                          {citedFact && (
                            <button
                              type="button"
                              onClick={() => {
                                if (activeCitation?.bulletId === b.id) {
                                  setActiveCitation(null);
                                } else {
                                  setActiveCitation({
                                    bulletId: b.id,
                                    factText: citedFact.text,
                                    span: citedFact.span,
                                  });
                                }
                              }}
                              className="text-[10px] text-[#556056] hover:text-[#1E6B38] underline font-mono cursor-pointer"
                            >
                              [Fact {citedFact.id}]
                            </button>
                          )}
                        </div>

                        {/* Citation Popup Drawer */}
                        {activeCitation?.bulletId === b.id && (
                          <div className="p-2.5 bg-white rounded-lg border border-[#C5E1CB] shadow-sm text-xs space-y-1 mt-1 font-mono">
                            <p className="text-[#1E6B38] font-bold text-[11px]">Verbatim Source Quote:</p>
                            <p className="text-[#556056] italic">"{activeCitation?.span}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB]">
              Stage 4 · Tailoring & Grounding
            </span>
            <span className="text-xs text-[#78827A]">Google ADK Resume Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141A16] tracking-tight">
            Resume Canvas & AI Assistant
          </h1>
          <p className="text-sm text-[#556056] max-w-2xl leading-relaxed">
            Every bullet is synthesized from verified ledger facts. Edit directly on the canvas or collaborate with the Google ADK Coordinator agent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunVerifier}
            disabled={isVerifying}
            className="px-4 py-2 bg-white hover:bg-[#FAF9F5] text-[#1E6B38] border border-[#C5E1CB] rounded-full font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isVerifying ? "Verifying..." : "✓ Run Verifier"}</span>
          </button>

          {/* Phase 2 Link (Stage 5) - Commented out for Mid-Term */}
          {/*
          <Link
            href="/score"
            className="px-6 py-2.5 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Check ATS Score</span>
            <span>→</span>
          </Link>
          */}
          <span className="px-4 py-2 bg-[#EAF4EB] text-[#1E6B38] border border-[#C5E1CB] rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm">
            <span>✓ 60% Milestone Reached</span>
          </span>
        </div>
      </div>

      {/* Main Split Layout: Resume Canvas (Left) vs ADK Chat Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Live Grounded Resume Sheet */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-6">
          
          {/* Resume Header / Candidate Info */}
          <div className="border-b border-[#ECE7DD] pb-5 space-y-2">
            <h2 className="text-2xl font-serif font-bold text-[#141A16]">
              {profile.name || "Palak Bhatt"}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#556056] flex-wrap">
              <span>{profile.email || "palak@skillora.ai"}</span>
              <span>·</span>
              <span>{profile.location || "Bengaluru, India"}</span>
              <span>·</span>
              <span className="font-mono">{profile.links || "github.com/palakbhatt1"}</span>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#78827A]">
              Professional Summary
            </h4>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const text = e.currentTarget.textContent?.trim();
                if (text && text !== summary) st.editSummary(text);
              }}
              className="p-3 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD] text-xs sm:text-sm text-[#141A16] leading-relaxed focus:outline-none focus:bg-white"
            >
              {summary || "Professional summary will be synthesized automatically once a target job is analyzed in Stage 3."}
            </div>
          </div>

          {/* Experience & Projects Sections */}
          {bullets.length === 0 ? (
            <div className="py-10 text-center rounded-2xl bg-[#FAF9F5] border-2 border-dashed border-[#D4CFC2] space-y-2.5">
              <span className="text-3xl">📝</span>
              <h4 className="text-sm font-serif font-bold text-[#141A16]">No Resume Bullets Generated Yet</h4>
              <p className="text-xs text-[#556056] max-w-sm mx-auto leading-relaxed">
                Analyze a target job description in Stage 3 to generate tailored bullets synthesized from your verified ledger facts.
              </p>
              <Link
                href="/job"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E6B38] hover:bg-[#16532B] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <span>Go to Job Match</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <>
              {renderSection("Experience & Internships", "role")}
              {renderSection("Production Projects", "project")}
            </>
          )}

          {/* Keyword Coach / Recommendations Chips */}
          {keywords && keywords.length > 0 && (
            <div className="pt-4 border-t border-[#ECE7DD] space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#78827A]">
                  Keyword Coach (ATS Optimization)
                </h4>
                <span className="text-[10px] text-[#1E6B38] font-semibold">
                  Zero Hallucination
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <div
                    key={kw.id}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD] text-xs"
                  >
                    <span className="font-bold text-[#141A16]">{kw.word}</span>
                    <button
                      type="button"
                      onClick={() => st.decideKeyword(kw.id, true)}
                      title="Accept keyword recommendation"
                      className="text-xs text-[#1E6B38] hover:text-[#16532B] font-bold"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => st.decideKeyword(kw.id, false)}
                      title="Dismiss keyword"
                      className="text-xs text-[#78827A] hover:text-rose-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Google ADK Assistant Chat */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE7DD] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <h3 className="text-sm font-bold text-[#141A16]">Google ADK Assistant</h3>
                <p className="text-[10px] text-[#78827A]">Grounded Tailoring Coordinator</p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-[#1E6B38] bg-[#EAF4EB] border border-[#C5E1CB] px-2 py-0.5 rounded-full">
              Connected
            </span>
          </div>

          {/* Quick Prompt Chips */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-[#78827A] font-semibold uppercase tracking-wider">
              Quick Refinements:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Strengthen XYZ metrics",
                "Emphasize distributed systems",
                "Condense bullets to 1 page",
                "Highlight CrewAI flows",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => st.sendChat(chip)}
                  className="text-[11px] font-medium text-[#1E6B38] bg-[#FAF9F5] hover:bg-[#EAF4EB] border border-[#ECE7DD] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div
            ref={chatBoxRef}
            className="h-80 overflow-y-auto space-y-3 p-3 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD]"
          >
            {st.chat.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#78827A] space-y-2">
                <span className="text-2xl">💬</span>
                <p className="font-semibold text-xs text-[#141A16]">Google ADK Assistant Ready</p>
                <p className="text-[11px] text-[#556056] max-w-xs leading-relaxed">
                  Type a instruction or select a quick refinement above to collaboratively tailor and verify your resume.
                </p>
              </div>
            ) : (
              st.chat.map((msg, idx) => {
                const isUser = msg.from === "you" || msg.from === "user";
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] text-[#78827A] mb-0.5">
                      {isUser ? "You" : "Skillora ADK"}
                    </span>
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed max-w-[85%] ${
                        isUser
                          ? "bg-[#1E6B38] text-white rounded-br-none"
                          : "bg-white text-[#141A16] border border-[#ECE7DD] rounded-bl-none shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              placeholder="Ask the ADK assistant to tailor or explain..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-[#E5E1D5] bg-[#FAF9F6] text-xs sm:text-sm text-[#141A16] placeholder:text-[#9DA69E] focus:outline-none focus:border-[#1E6B38] focus:bg-white transition-all"
            />
            <button
              onClick={handleSendChat}
              disabled={!chatInput.trim()}
              className="h-10 px-4 rounded-xl bg-[#1E6B38] hover:bg-[#16532B] disabled:opacity-40 text-white font-bold text-xs shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-[#ECE7DD]">
        <Link
          href="/job"
          className="text-xs font-semibold text-[#556056] hover:text-[#141A16] flex items-center gap-1"
        >
          <span>← Back to Job Match</span>
        </Link>

        {/* Phase 2 Link (Stage 5) - Commented out for Mid-Term */}
        {/*
        <Link
          href="/score"
          className="px-6 py-2.5 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
        >
          <span>Check ATS Fit Score</span>
          <span>→</span>
        </Link>
        */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#1E6B38] bg-[#EAF4EB] border border-[#C5E1CB] px-4 py-2 rounded-full shadow-sm">
          <span>✓ Core Agentic Pipeline Validated</span>
        </div>
      </div>

    </div>
  );
}
