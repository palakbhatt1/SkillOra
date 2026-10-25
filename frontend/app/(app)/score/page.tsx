"use client";

import Link from "next/link";
import ScoreRing from "@/components/ScoreRing";
import { useStore } from "@/lib/store";

export default function ScorePage() {
  const { score, components, recs, facts, keywords, live, analyzed, scoreProfile, profiles, setScoreProfile, eligibility } = useStore();
  const pendingCount = facts.filter((f) => f.status === "pending").length;
  const openKeywords = keywords.filter((k) => k.state === "suggested").length;
  const showProfiles = live && analyzed && profiles && profiles.length > 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB]">
              Stage 5 · Explainable Scoring
            </span>
            <span className="text-xs text-[#78827A]">Deterministic 5-Component ATS Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141A16] tracking-tight">
            Job-Fit Score & Analysis
          </h1>
          <p className="text-sm text-[#556056] max-w-2xl leading-relaxed">
            No black-box guesses. Skillora computes a transparent 0-100 score based on verified evidence, skill overlap, and role requirements.
          </p>
        </div>

        <Link
          href="/export"
          className="px-6 py-2.5 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Proceed to Export</span>
          <span>→</span>
        </Link>
      </div>

      {/* Role Profile Switcher */}
      {showProfiles && (
        <div className="bg-white p-5 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#141A16]">Scoring Weight Profile</h3>
              <p className="text-xs text-[#78827A]">Adapt component weights based on target seniority and company size</p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {profiles.map((p) => {
                const isActive = scoreProfile?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setScoreProfile(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#1E6B38] text-white shadow-sm"
                        : "bg-[#FAF9F5] text-[#556056] border border-[#ECE7DD] hover:bg-white"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Score Overview & Component Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Radial ATS Gauge Card */}
        <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center space-y-6">
          <ScoreRing value={score} size={200} />

          <div className="space-y-2">
            <h3 className="text-lg font-serif font-bold text-[#141A16]">
              {score === 0 ? "Awaiting Job Analysis" : score >= 80 ? "Exceptional Match" : score >= 60 ? "Competitive Match" : "Needs Targeted Polish"}
            </h3>
            <p className="text-xs text-[#556056] max-w-sm leading-relaxed">
              {score === 0
                ? "Analyze a target job description in Stage 3 to compute an explainable, deterministic ATS score across 5 weighted dimensions."
                : "Every point is backed by verified facts in your ledger. Fabricated claims are barred from boosting the score."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <span className="px-3 py-1 rounded-full bg-[#EAF4EB] text-[#1E6B38] font-semibold border border-[#C5E1CB]">
              ✓ Deterministic Formula
            </span>
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] font-semibold border border-[#FDE68A]">
                ⚠️ {pendingCount} facts pending
              </span>
            )}
            {openKeywords > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-semibold border border-[#DBEAFE]">
                💡 {openKeywords} keyword suggestions
              </span>
            )}
          </div>
        </div>

        {/* Right Column: 5 Weighted Components Breakdown */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex items-center justify-between border-b border-[#ECE7DD] pb-3">
            <h3 className="text-base font-serif font-bold text-[#141A16]">Component Breakdown</h3>
            <span className="text-xs text-[#78827A]">5 Weighted Dimensions</span>
          </div>

          <div className="space-y-4">
            {components.map((c) => (
              <div key={c.key} className="space-y-1.5 p-3 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD]">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-[#141A16]">{c.key}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1E6B38]">
                      {c.scored === false ? "N/A" : `${Math.round(c.value)}/100`}
                    </span>
                    <span className="text-[11px] text-[#78827A]">({c.weight}% weight)</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#E5E1D5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2E9B4E] to-[#1E6B38] rounded-full transition-all duration-700"
                    style={{ width: `${c.scored === false ? 0 : Math.min(c.value, 100)}%` }}
                  />
                </div>

                {c.why && (
                  <p className="text-[11px] text-[#556056] leading-relaxed pt-0.5">
                    {c.why}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Actionable Recommendations & Gaps */}
      {recs && recs.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-base font-serif font-bold text-[#141A16]">Optimization Recommendations</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recs.map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-[#ECE7DD] bg-[#FAF9F5] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E6B38]">{rec.title}</span>
                  <span className="text-[10px] font-semibold text-[#78827A] uppercase">
                    {rec.impact || "High Impact"}
                  </span>
                </div>
                <p className="text-xs text-[#556056] leading-relaxed">{rec.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-[#ECE7DD]">
        <Link
          href="/tailor"
          className="text-xs font-semibold text-[#556056] hover:text-[#141A16] flex items-center gap-1"
        >
          <span>← Back to Resume Editor</span>
        </Link>

        <Link
          href="/export"
          className="px-6 py-2.5 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
        >
          <span>Continue to Export</span>
          <span>→</span>
        </Link>
      </div>

    </div>
  );
}
