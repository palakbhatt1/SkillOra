"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Fact, FactStatus } from "@/lib/data";

type Tab = "all" | "review" | FactStatus;
const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All Facts" },
  { id: "review", label: "Needs Review" },
  { id: "verified", label: "Verified" },
  { id: "pending", label: "Pending" },
  { id: "stale", label: "Stale" },
  { id: "rejected", label: "Rejected" },
];

const matches = (f: Fact, t: Tab) => {
  if (t === "all") return true;
  if (t === "review") return f.status === "pending" || f.status === "stale";
  return f.status === t;
};

export default function VerifyPage() {
  const { facts, setFactStatus, editFact, declareSkill, confirmGroup } = useStore();
  const [tab, setTab] = useState<Tab>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const pendingCount = facts.filter((f) => f.status === "pending").length;
  const verifiedCount = facts.filter((f) => f.status === "verified").length;
  const pct = facts.length ? Math.round((verifiedCount / facts.length) * 100) : 0;

  const filteredFacts = useMemo(() => {
    return facts.filter((f) => matches(f, tab));
  }, [facts, tab]);

  // Group facts by project
  const projectGroups = useMemo(() => {
    const map = new Map<string, Fact[]>();
    filteredFacts.forEach((f) => {
      const p = f.project || "General";
      map.set(p, [...(map.get(p) ?? []), f]);
    });
    return [...map.entries()];
  }, [filteredFacts]);

  const handleStartEdit = (f: Fact) => {
    setEditingId(f.id);
    setEditText(f.text);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;
    await editFact(id, editText.trim());
    setEditingId(null);
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    await declareSkill(newSkill.trim());
    setNewSkill("");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB]">
              Stage 2 · Grounding Engine
            </span>
            <span className="text-xs text-[#78827A]">Local SQLite Fact Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141A16] tracking-tight">
            Verify Fact Ledger
          </h1>
          <p className="text-sm text-[#556056] max-w-2xl leading-relaxed">
            Every bullet point generated on your resume is strictly grounded in these verified facts. Review extracted claims and their verbatim source spans.
          </p>
        </div>

        <Link
          href="/job"
          className="px-6 py-2.5 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Proceed to Job Match</span>
          <span>→</span>
        </Link>
      </div>

      {/* Progress & Verification Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 max-w-lg">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#141A16]">
              <span>Grounding Ledger Health</span>
              <span className="text-[#1E6B38] font-mono">{verifiedCount} of {facts.length} Verified ({pct}%)</span>
            </div>
            
            <div className="w-full h-2.5 bg-[#FAF7F0] border border-[#ECE7DD] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#2E9B4E] to-[#1E6B38] rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="text-xs text-[#78827A]">
              {pendingCount > 0 ? (
                <span>⚠️ {pendingCount} claims await your review before resume tailoring.</span>
              ) : (
                <span className="text-[#1E6B38] font-semibold">✓ All extracted claims are verified and ready for tailoring.</span>
              )}
            </p>
          </div>

          {pendingCount > 0 && (
            <button
              onClick={() => confirmGroup(null)}
              className="px-4 py-2 bg-[#EAF4EB] hover:bg-[#D5EED8] text-[#1E6B38] border border-[#C5E1CB] rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer self-start sm:self-center"
            >
              ✓ Verify All {pendingCount} Pending Claims
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Add Custom Skill Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((t) => {
            const count = facts.filter((f) => matches(f, t.id)).length;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#1E6B38] text-white shadow-sm"
                    : "bg-white text-[#556056] border border-[#ECE7DD] hover:bg-[#FAF9F5]"
                }`}
              >
                <span>{t.label}</span>
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Add Custom Skill */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            placeholder="+ Declare custom skill"
            className="h-8 px-3 rounded-lg border border-[#E5E1D5] bg-white text-xs text-[#141A16] placeholder:text-[#9DA69E] focus:outline-none focus:border-[#1E6B38]"
          />
          <button
            onClick={handleAddSkill}
            disabled={!newSkill.trim()}
            className="h-8 px-3 rounded-lg bg-[#1E6B38] hover:bg-[#16532B] disabled:opacity-40 text-white text-xs font-semibold"
          >
            Add
          </button>
        </div>
      </div>

      {/* Grouped Claims List */}
      {projectGroups.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#ECE7DD] space-y-3">
          <span className="text-3xl">📭</span>
          <p className="text-sm font-bold text-[#141A16]">No facts found under "{tab}"</p>
          <Link href="/sources" className="inline-block text-xs font-semibold text-[#1E6B38] hover:underline">
            + Add more sources in Stage 1
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {projectGroups.map(([projectName, groupFacts]) => (
            <div key={projectName} className="bg-white rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] overflow-hidden">
              
              {/* Project Group Header */}
              <div className="bg-[#FAF9F5] px-6 py-3.5 border-b border-[#ECE7DD] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📁</span>
                  <h3 className="text-sm font-serif font-bold text-[#141A16]">{projectName}</h3>
                </div>
                <span className="text-xs font-semibold text-[#78827A] bg-white border border-[#ECE7DD] px-2.5 py-0.5 rounded-full">
                  {groupFacts.length} claims
                </span>
              </div>

              {/* Facts Rows */}
              <div className="divide-y divide-[#F0EDE6]">
                {groupFacts.map((fact) => {
                  const isVerified = fact.status === "verified";
                  const isPending = fact.status === "pending";
                  const isStale = fact.status === "stale";
                  const isRejected = fact.status === "rejected";

                  return (
                    <div key={fact.id} className="p-5 sm:p-6 space-y-3 hover:bg-[#FAF9F6]/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        
                        {/* Claim Text and Edit Form */}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E5E1D5] text-[#1E6B38]">
                              {fact.category || "EXPERIENCE"}
                            </span>
                            <span className="text-xs text-[#78827A] font-mono">{fact.id}</span>
                          </div>

                          {editingId === fact.id ? (
                            <div className="space-y-2 pt-1">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}
                                className="w-full p-2.5 text-xs sm:text-sm border border-[#1E6B38] rounded-xl bg-white focus:outline-none"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSaveEdit(fact.id)}
                                  className="px-3 py-1 bg-[#1E6B38] text-white text-xs font-bold rounded-lg"
                                >
                                  Save Edit
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="group">
                              <p className="text-xs sm:text-sm font-semibold text-[#141A16] leading-relaxed">
                                {fact.text}
                              </p>
                              <button
                                onClick={() => handleStartEdit(fact)}
                                className="text-[11px] text-[#78827A] hover:text-[#1E6B38] mt-1 inline-flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
                              >
                                <span>✎ Edit claim</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Status Badge & Action Buttons */}
                        <div className="flex items-center gap-2 self-start shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            isVerified
                              ? "bg-[#EAF4EB] text-[#1E6B38] border border-[#C5E1CB]"
                              : isPending
                              ? "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
                              : isStale
                              ? "bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA]"
                              : "bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]"
                          }`}>
                            {fact.status}
                          </span>

                          <div className="flex items-center gap-1.5 pl-2 border-l border-[#ECE7DD]">
                            {!isVerified && (
                              <button
                                onClick={() => setFactStatus(fact.id, "verified")}
                                className="px-2.5 py-1 rounded-lg bg-[#1E6B38] hover:bg-[#16532B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                              >
                                Verify
                              </button>
                            )}
                            {!isPending && (
                              <button
                                onClick={() => setFactStatus(fact.id, "pending")}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all"
                              >
                                Revert
                              </button>
                            )}
                            {!isRejected && (
                              <button
                                onClick={() => setFactStatus(fact.id, "rejected")}
                                className="px-2 py-1 rounded-lg hover:bg-rose-50 text-rose-600 text-xs font-medium transition-all"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Source Citation Span Box */}
                      {fact.span && (
                        <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#ECE7DD] text-xs font-mono text-[#556056] leading-relaxed flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[#1E6B38] font-bold">Citation: </span>
                            <span>"{fact.span}"</span>
                          </div>
                          {fact.source && (
                            <span className="text-[10px] text-[#78827A] shrink-0 font-sans bg-white px-2 py-0.5 rounded border border-[#E5E1D5]">
                              {fact.source}
                            </span>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-[#ECE7DD]">
        <Link
          href="/sources"
          className="text-xs font-semibold text-[#556056] hover:text-[#141A16] flex items-center gap-1"
        >
          <span>← Back to Sources</span>
        </Link>

        <Link
          href="/job"
          className="px-6 py-2.5 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
        >
          <span>Continue to Job Match</span>
          <span>→</span>
        </Link>
      </div>

    </div>
  );
}
