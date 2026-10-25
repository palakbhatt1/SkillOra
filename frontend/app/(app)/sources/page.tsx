"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { sources as seedSources, type Source } from "@/lib/data";

export default function SourcesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const st = useStore();
  const [demoList, setDemoList] = useState<Source[]>(seedSources);
  const list = st.live ? st.sources : demoList;

  const [githubUrl, setGithubUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handlePresetNotes = () => {
    setNotes(
      "Architected Skillora: an agentic resume intelligence system using CrewAI flows and Google ADK.\n" +
      "Implemented a 5-component deterministic ATS scoring engine with RapidFuzz and sentence embeddings.\n" +
      "Built a local SQLite fact ledger with verifiable verbatim quotes, reducing resume tailoring time from 40 min to under 3 min.\n" +
      "Deployed with FastAPI backend and Next.js reactive frontend."
    );
  };

  const handleIngestGithub = async () => {
    if (!githubUrl.trim() || isIngesting) return;
    setIsIngesting(true);
    setFeedbackMsg("");
    try {
      if (st.live) {
        const res = await st.addGithub(githubUrl.trim());
        setFeedbackMsg(res || "GitHub repository successfully ingested into fact ledger!");
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        setDemoList((prev) => [
          {
            id: "src-" + Date.now(),
            name: githubUrl.trim(),
            type: "github",
            detail: "GitHub Repo · Ingested facts",
            facts: 8,
            state: "synced",
            updated: "Just now",
          },
          ...prev,
        ]);
        setFeedbackMsg("GitHub repository facts extracted to ledger (demo mode).");
      }
      setGithubUrl("");
    } catch (err: unknown) {
      setFeedbackMsg(err instanceof Error ? err.message : "Error extracting GitHub repository.");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile || isIngesting) return;
    setIsIngesting(true);
    setFeedbackMsg("");
    try {
      if (st.live) {
        const res = await st.upload(selectedFile);
        setFeedbackMsg(res || "Document parsed and facts added to ledger!");
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        setDemoList((prev) => [
          {
            id: "src-" + Date.now(),
            name: selectedFile.name,
            type: "pdf",
            detail: `Document · ${(selectedFile.size / 1024).toFixed(1)} KB`,
            facts: 6,
            state: "synced",
            updated: "Just now",
          },
          ...prev,
        ]);
        setFeedbackMsg(`Document ${selectedFile.name} parsed (demo mode).`);
      }
      setSelectedFile(null);
    } catch (err: unknown) {
      setFeedbackMsg(err instanceof Error ? err.message : "Error uploading document.");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleIngestNotes = async () => {
    if (!notes.trim() || isIngesting) return;
    setIsIngesting(true);
    setFeedbackMsg("");
    try {
      if (st.live) {
        const res = await st.addNote("Production Notes", notes.trim());
        setFeedbackMsg(res || "Notes extracted and claims cataloged!");
      } else {
        await new Promise((r) => setTimeout(r, 900));
        setDemoList((prev) => [
          {
            id: "src-" + Date.now(),
            name: "Production Notes",
            type: "note",
            detail: "Text summary · Verified metrics",
            facts: 4,
            state: "synced",
            updated: "Just now",
          },
          ...prev,
        ]);
        setFeedbackMsg("Notes parsed into factual claims.");
      }
      setNotes("");
    } catch (err: unknown) {
      setFeedbackMsg(err instanceof Error ? err.message : "Error parsing notes.");
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB]">
            Stage 1 · Source Ingestion
          </span>
          <span className="text-xs text-[#78827A]">Multi-Modal Parsers</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141A16] tracking-tight">
          Add Experience Sources
        </h1>
        <p className="text-sm text-[#556056] max-w-2xl leading-relaxed">
          Skillora extracts real factual claims from your code repositories, resumes, slide decks, and project specs. Every extracted bullet preserves its verbatim citation.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-[#EAF4EB] border border-[#C5E1CB] text-xs sm:text-sm font-medium text-[#1E6B38] flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg("")} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* 3 Main Source Cards */}
      <div className="grid grid-cols-1 gap-5">
        
        {/* Card 1: GitHub / Codebase Ingestion */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-lg shrink-0">
                🐙
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#141A16]">GitHub Repository URL</h3>
                <p className="text-xs text-[#78827A]">Auto-parses README, commits, file trees, and package dependencies</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGithubUrl("palakbhatt1/SkillOra")}
                className="text-[11px] font-semibold text-[#1E6B38] bg-[#EAF4EB] hover:bg-[#D5EED8] px-2.5 py-1 rounded-lg transition-colors"
              >
                + Palak's Repo
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleIngestGithub()}
              placeholder="https://github.com/username/repository or owner/repo"
              className="flex-1 h-11 px-4 rounded-xl border border-[#E5E1D5] bg-[#FAF9F6] text-xs sm:text-sm text-[#141A16] placeholder:text-[#9DA69E] focus:outline-none focus:border-[#1E6B38] focus:bg-white transition-all font-mono"
            />
            <button
              onClick={handleIngestGithub}
              disabled={isIngesting || !githubUrl.trim()}
              className="h-11 px-5 rounded-xl bg-[#1E6B38] hover:bg-[#16532B] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors shadow-sm cursor-pointer gap-1.5"
            >
              {isIngesting ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>Extract Facts</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Document / File Upload */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-lg shrink-0">
              📄
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#141A16]">Upload Document (PDF, DOCX, PPTX, or TXT)</h3>
              <p className="text-xs text-[#78827A]">Parses prior resumes, project slides, capstone reports, or architecture docs</p>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#D4CFC2] hover:border-[#1E6B38] bg-[#FAF9F6] hover:bg-white rounded-xl py-7 px-4 text-center cursor-pointer transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.zip"
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-1.5">
              <span className="text-2xl">📁</span>
              {selectedFile ? (
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-semibold text-[#1E6B38]">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs sm:text-sm font-semibold text-[#141A16]">
                    Click to choose a file or drag and drop
                  </p>
                  <p className="text-xs text-[#78827A]">
                    Supports PDF, DOCX, PPTX, TXT, or ZIP code archives
                  </p>
                </>
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="flex justify-end">
              <button
                onClick={handleUploadFile}
                disabled={isIngesting}
                className="px-5 py-2 rounded-xl bg-[#1E6B38] hover:bg-[#16532B] text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                {isIngesting ? "Extracting..." : "Process Uploaded File →"}
              </button>
            </div>
          )}
        </div>

        {/* Card 3: Project Notes & Metrics */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center text-lg shrink-0">
                📝
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#141A16]">Project Notes & Production Metrics</h3>
                <p className="text-xs text-[#78827A]">Paste raw bullets, unformatted impact metrics, or team achievements</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePresetNotes}
              className="text-xs font-semibold text-[#1E6B38] hover:text-[#16532B] transition-colors"
            >
              + Insert Sample Notes
            </button>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add details about your role, technologies used, quantitative metrics (e.g. 35% latency reduction), and architecture..."
            className="w-full p-4 rounded-xl border border-[#E5E1D5] bg-[#FAF9F6] text-xs sm:text-sm text-[#141A16] placeholder:text-[#9DA69E] focus:outline-none focus:border-[#1E6B38] focus:bg-white transition-all leading-relaxed"
          />

          {notes.trim() && (
            <div className="flex justify-end">
              <button
                onClick={handleIngestNotes}
                disabled={isIngesting}
                className="px-5 py-2 rounded-xl bg-[#1E6B38] hover:bg-[#16532B] text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                {isIngesting ? "Extracting..." : "Catalog Notes to Ledger →"}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Active Ingested Sources Section */}
      <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#ECE7DD] pb-3">
          <div>
            <h3 className="text-base font-serif font-bold text-[#141A16]">Ingested Sources</h3>
            <p className="text-xs text-[#78827A]">
              {list.length} source documents providing evidence for the fact ledger
            </p>
          </div>

          <Link
            href="/verify"
            className="px-4 py-2 bg-[#121614] hover:bg-black text-white text-xs font-semibold rounded-full shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Review Fact Ledger</span>
            <span>→</span>
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <span className="text-3xl">📥</span>
            <p className="font-bold text-sm text-[#141A16]">No sources added yet</p>
            <p className="text-xs text-[#556056] max-w-sm mx-auto">
              Add a GitHub repository, upload a document, or paste project notes above to extract verified facts into your ledger.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EDE6]">
            {list.map((src) => (
              <div key={src.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E5E1D5] flex items-center justify-center text-xs font-bold text-[#1E6B38] uppercase shrink-0">
                    {src.type}
                  </span>
                  <div className="truncate">
                    <p className="text-xs sm:text-sm font-bold text-[#141A16] truncate">{src.name}</p>
                    <p className="text-[11px] text-[#78827A] truncate">{src.detail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-[#1E6B38] bg-[#EAF4EB] border border-[#C5E1CB] px-2.5 py-0.5 rounded-full">
                    {src.facts} facts
                  </span>
                  <span className="text-[11px] text-[#78827A] hidden sm:inline">{src.updated}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security & Prompt Injection Assurance */}
      <div className="pt-2 pb-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78827A] gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#1E6B38]">🛡️</span>
          <span>Protected by multi-tier prompt injection guardrails (Section 7)</span>
        </div>

        <Link
          href="/verify"
          className="text-xs sm:text-sm font-bold text-[#1E6B38] hover:underline flex items-center gap-1"
        >
          <span>Proceed to Fact Verification</span>
          <span>→</span>
        </Link>
      </div>

    </div>
  );
}
