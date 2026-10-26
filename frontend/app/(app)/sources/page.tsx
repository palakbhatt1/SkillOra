"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { sources as seedSources, type Source } from "@/lib/data";

function IconDocument({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function IconFolder({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function IconNotes({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function IconShield({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconInspect({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
  );
}

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
      
      {/* Technical Demonstration View Banner */}
      <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#DDD7CA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-1 rounded-lg bg-[#EAF4EB] text-[#1E6B38]">
            <IconInspect className="w-4 h-4 text-[#1E6B38]" />
          </span>
          <div>
            <span className="font-bold text-[#141A16]">System Architecture &amp; Verification: Source Ingestion &amp; Parsing</span>
            <p className="text-[#556056] text-[11px] mt-0.5">
              Multi-modal document extraction, GitHub crawler, and prompt injection guardrails.
            </p>
          </div>
        </div>

        <Link
          href="/job"
          className="px-3.5 py-1.5 bg-white hover:bg-[#FAF9F5] text-[#1E6B38] border border-[#C5E1CB] font-bold text-xs rounded-full shadow-2xs transition-all shrink-0 self-start sm:self-auto flex items-center gap-1"
        >
          <span>← Back to User Workflow</span>
        </Link>
      </div>

      {/* Header section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB]">
            Multi-Modal Source Ingestion
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

      {/* Candidate Profile Builder & Continuous Workspace */}
      <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ECE7DD]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1E6B38] text-white text-lg font-bold flex items-center justify-center shadow-sm">
              {st.profile.name ? st.profile.name.charAt(0) : "P"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#141A16]">{st.profile.name || "Palak Bhatt"}</h2>
                <span className="text-[10px] font-semibold text-[#1E6B38] bg-[#EAF4EB] border border-[#C5E1CB] px-2 py-0.5 rounded-full">
                  Verified Candidate Profile
                </span>
              </div>
              <p className="text-xs text-[#556056] mt-0.5">
                AI &amp; Full-Stack Engineer · B.Tech Computer Science &amp; Engineering (AI/ML)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            <Link
              href="/verify"
              className="px-4 py-2 bg-white hover:bg-[#FAF9F5] text-[#141A16] border border-[#DDD7CA] text-xs font-semibold rounded-full shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Inspect Fact Ledger ({st.facts.length})</span>
            </Link>
            <Link
              href="/job"
              className="px-4 py-2 bg-[#121614] hover:bg-black text-white text-xs font-semibold rounded-full shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Proceed to Job Match &amp; Score</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Profile Details & Linked Assets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E3D7] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#78827A]">Email &amp; Location</span>
            <p className="font-semibold text-[#141A16]">{st.profile.email || "palak@skillora.ai"}</p>
            <p className="text-[#78827A] text-[11px]">Bengaluru, India</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E3D7] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#78827A]">Verified Code Links</span>
            <p className="font-semibold text-[#1E6B38] font-mono flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#141A16]" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>github.com/palakbhatt1</span>
            </p>
            <p className="text-[#78827A] text-[11px]">linkedin.com/in/palakbhatt</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E3D7] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#78827A]">Profile Grounding Status</span>
            <p className="font-bold text-[#1E6B38] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{list.length} Projects Saved in Profile</span>
            </p>
            <p className="text-[#78827A] text-[11px]">Persisted across all sessions</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#141A16] flex items-center gap-2">
            <span>+</span> Continuous Profile Expansion
          </h3>
          <p className="text-xs text-[#78827A]">Add additional codebases, documents, or project notes to expand your fact ledger</p>
        </div>
      </div>

      {/* 3 Main Source Cards */}
      <div className="grid grid-cols-1 gap-5">
        
        {/* Card 1: GitHub / Codebase Ingestion */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#141A16]" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
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
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#1D4ED8] shrink-0">
              <IconDocument className="w-5 h-5 text-[#1D4ED8]" />
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
              <span className="text-[#78827A]">
                <IconFolder className="w-8 h-8 text-[#78827A]" />
              </span>
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
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center text-[#1E6B38] shrink-0">
                <IconNotes className="w-5 h-5 text-[#1E6B38]" />
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
            <div className="flex justify-center text-[#78827A]">
              <IconDocument className="w-8 h-8 text-[#78827A]" />
            </div>
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
                  <span className="w-9 h-9 rounded-xl bg-white border border-[#E5E1D5] shadow-xs flex items-center justify-center shrink-0">
                    {src.type === "github" ? (
                      <svg className="w-4 h-4 text-[#141A16]" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    ) : src.type === "pdf" ? (
                      <IconDocument className="w-4 h-4 text-[#1D4ED8]" />
                    ) : src.type === "docx" || src.type === "pptx" ? (
                      <IconNotes className="w-4 h-4 text-[#1E6B38]" />
                    ) : (
                      <IconDocument className="w-4 h-4 text-[#78827A]" />
                    )}
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
          <IconShield className="w-4 h-4 text-[#1E6B38]" />
          <span>Protected by multi-tier prompt injection guardrails (Section 7)</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/verify"
            className="text-xs font-semibold text-[#556056] hover:text-[#141A16] flex items-center gap-1"
          >
            <span>Inspect Fact Ledger</span>
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            href="/job"
            className="px-5 py-2 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Proceed to Job Match &amp; Score</span>
            <span>→</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
