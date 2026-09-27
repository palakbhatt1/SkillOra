"use client";

import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AddSources() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '1';

  const [githubUrl, setGithubUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetNotes = () => {
    setNotes(
      "Architected high-throughput microservices using FastAPI, Redis, and PostgreSQL. " +
      "Engineered automated CI/CD deployment pipelines on Docker & Kubernetes, reducing build times by 45%. " +
      "Scaled backend API to process 12,000 requests/sec with 99.99% uptime."
    );
  };

  const handleIngest = async () => {
    if (!githubUrl.trim() && !notes.trim() && !selectedFile) {
      setErrorMessage('Please provide a GitHub URL, upload a document, or write project notes to extract facts.');
      return;
    }

    setIsIngesting(true);
    setErrorMessage('');
    setStatusMessage('Extracting facts & pre-filling project card...');

    try {
      // 1. Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch(`${API_BASE}/projects/${id}/sources/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error(`File upload failed (${uploadRes.status})`);
        }
      }

      // 2. Add GitHub repo source if provided
      if (githubUrl.trim()) {
        const ghRes = await fetch(`${API_BASE}/projects/${id}/sources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'github',
            url_or_name: githubUrl.trim(),
          }),
        });

        if (!ghRes.ok) {
          throw new Error(`Failed to add GitHub source (${ghRes.status})`);
        }
      }

      // 3. Add Project Notes if provided
      if (notes.trim()) {
        const notesRes = await fetch(`${API_BASE}/projects/${id}/sources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'notes',
            url_or_name: 'candidate_notes.txt',
            raw_text: notes.trim(),
          }),
        });

        if (!notesRes.ok) {
          throw new Error(`Failed to save notes (${notesRes.status})`);
        }
      }

      // 4. Trigger Ingestion Flow on Backend
      const ingestRes = await fetch(`${API_BASE}/projects/${id}/ingest`, {
        method: 'POST',
      });

      if (!ingestRes.ok) {
        throw new Error(`Ingestion process failed (${ingestRes.status})`);
      }

      const result = await ingestRes.json();
      setStatusMessage(`Extracted ${result.total_facts || 0} facts! Opening ledger...`);

      // Immediate clean redirect to ledger
      window.location.assign(`/projects/${id}/verify`);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Failed to connect to backend at http://localhost:8000.'
      );
      setIsIngesting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] text-[#141A16] relative flex flex-col selection:bg-[#DCFCE7] selection:text-[#166534] font-sans pb-16 overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* --- Ambient Background Aesthetic (matching reference image pixel-by-pixel) --- */}
      {/* ========================================================================= */}
      
      {/* 1. Large soft mint glow on the upper left */}
      <div className="absolute -top-12 -left-32 w-[520px] h-[520px] rounded-full bg-[#E5F5E6] opacity-75 blur-[110px] pointer-events-none -z-10" />
      
      {/* 2. Soft pastel amber/yellow solid dot on mid-left */}
      <div className="absolute top-[44%] left-[7%] w-9 h-9 rounded-full bg-[#FCE5B0] opacity-85 shadow-sm pointer-events-none -z-10" />
      
      {/* 3. Delicate sweeping golden arc sweeping from top right */}
      <svg 
        className="absolute -top-14 right-0 w-[580px] h-[640px] pointer-events-none -z-10 opacity-35" 
        viewBox="0 0 580 640" 
        fill="none"
      >
        <circle cx="540" cy="190" r="370" stroke="#DFD7BE" strokeWidth="1.25" />
      </svg>

      {/* 4. Pastel mint solid circle on mid-right along the arc */}
      <div className="absolute top-[28%] right-[11%] w-11 h-11 rounded-full bg-[#D7F3DE] opacity-85 pointer-events-none -z-10" />

      {/* 5. Pastel mint solid circle on bottom-right */}
      <div className="absolute top-[68%] right-[4%] w-12 h-12 rounded-full bg-[#DAF4E1] opacity-75 pointer-events-none -z-10" />

      {/* 6. Diffuse mint ambient glow on lower right */}
      <div className="absolute top-[50%] -right-28 w-[480px] h-[480px] rounded-full bg-[#E2F5E5] opacity-70 blur-[105px] pointer-events-none -z-10" />


      {/* ========================================================================= */}
      {/* --- Top Navbar (matching reference image) --- */}
      {/* ========================================================================= */}
      <header className="w-full max-w-[1180px] mx-auto px-6 sm:px-10 pt-6 pb-4 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 transition-transform group-hover:rotate-12 duration-300">
            <Image 
              src="/logo.png" 
              alt="Skillora Logo" 
              width={32} 
              height={32} 
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-9 text-[13.5px] font-medium text-[#4B554D]">
          <div className="flex items-center gap-1 hover:text-[#141A16] cursor-pointer transition-colors">
            <span>Product</span>
            <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <Link href="/projects/1/sources" className="hover:text-[#141A16] transition-colors">
            How It Works
          </Link>
          <Link href="/projects/1/verify" className="hover:text-[#141A16] transition-colors">
            Pricing
          </Link>
          <Link href="/projects/1/sources" className="hover:text-[#141A16] transition-colors">
            Resources
          </Link>
        </nav>

        {/* Right User Avatar Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E5ECE4] text-[#245C33] text-xs font-semibold cursor-pointer hover:bg-[#DCE5DB] transition-colors">
          <div className="w-5 h-5 rounded-full bg-[#D7E2D6] text-[#245C33] flex items-center justify-center font-bold text-[11px]">
            P
          </div>
          <svg className="w-3 h-3 text-[#4B554D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </header>


      {/* ========================================================================= */}
      {/* --- Main Content Section (Centered, spacious, comfortable scrolling) --- */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[860px] mx-auto px-6 sm:px-8 flex-1 flex flex-col pt-3 pb-8">
        
        {/* --- Sub-header Navigation Row --- */}
        <div className="flex items-center justify-between pb-6 shrink-0">
          <Link 
            href="/" 
            className="px-4 py-2 bg-[#FAF9F5] hover:bg-white text-[#2D3830] text-xs sm:text-[13px] font-medium rounded-full border border-[#E5E1D5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to SkillOra Home</span>
          </Link>

          <Link
            href={`/projects/${id}/verify`}
            className="px-4 py-2 bg-[#EEF5EE] hover:bg-[#E3EFE3] text-[#1E6334] text-xs sm:text-[13px] font-semibold rounded-full border border-[#D5E5D5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all flex items-center gap-2"
          >
            <span>View Fact Ledger</span>
            <span>→</span>
          </Link>
        </div>

        {/* --- Title Section with Floating 3D Badges in Whitespace --- */}
        <div className="relative pt-2 pb-8 shrink-0">
          
          <div className="max-w-[500px] space-y-2">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#1E6538]">
              PROFILE BUILDER
            </span>
            <h1 className="text-[40px] sm:text-[46px] font-serif font-normal text-[#121614] tracking-[-0.03em] leading-[1.12]">
              Add Raw Project Sources
            </h1>
            <p className="text-[#5A655D] text-xs sm:text-[13.5px] leading-relaxed pt-1">
              Upload code repositories, documents, or notes. The agentic extractor verifies source spans and extracts atomic, auditable facts into your career ledger.
            </p>
          </div>

          {/* Floating 3D Badges: Positioned safely to the right of the title text, completely clear of subnav buttons */}
          <div className="hidden md:block absolute -top-1 right-2 w-[240px] h-[150px] pointer-events-none select-none">
            
            {/* 1. GitHub Card: White squircle with soft drop shadow, slight CCW tilt */}
            <div 
              className="absolute top-0 right-14 w-[84px] h-[84px] bg-white rounded-[22px] shadow-[0_16px_36px_rgba(0,0,0,0.06)] border border-[#ECE7DD] flex items-center justify-center -rotate-6 transition-transform hover:rotate-0"
            >
              <svg className="w-10 h-10 text-[#141A16]" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>

            {/* 2. Blue Document Card: White squircle, slight CW tilt */}
            <div 
              className="absolute top-12 right-0 w-[62px] h-[66px] bg-white rounded-[18px] shadow-[0_12px_28px_rgba(0,0,0,0.05)] border border-[#ECE7DD] flex items-center justify-center rotate-8 transition-transform hover:rotate-0"
            >
              <svg className="w-7 h-7 text-[#3B82F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>

            {/* 3. Green Note Card: Smaller white squircle, slight CCW tilt */}
            <div 
              className="absolute top-26 right-14 w-[48px] h-[52px] bg-white rounded-[14px] shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-[#ECE7DD] flex items-center justify-center -rotate-4 transition-transform hover:rotate-0"
            >
              <svg className="w-6 h-6 text-[#22C55E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>

          </div>

        </div>

        {/* Status / Error Toast notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-[13px] flex items-center justify-between gap-3 shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-red-500 font-bold">⚠️</span>
              <p className="font-medium">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-red-600 hover:text-red-800 text-xs font-bold px-1">✕</button>
          </div>
        )}

        {statusMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] text-xs sm:text-[13px] flex items-center justify-between gap-3 shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="animate-spin w-4 h-4 border-2 border-[#166534] border-t-transparent rounded-full shrink-0"></div>
              <p className="font-semibold">{statusMessage}</p>
            </div>
            <Link
              href={`/projects/${id}/verify`}
              className="px-3 py-1 bg-[#1E6B38] hover:bg-[#16552B] text-white text-xs font-semibold rounded-lg shrink-0 transition-all shadow-sm"
            >
              View Ledger →
            </Link>
          </div>
        )}

        {/* ========================================================================= */}
        {/* --- The 3 Dedicated Input Cards (matching reference layout & borders) --- */}
        {/* ========================================================================= */}
        <div className="space-y-4 sm:space-y-5">
          
          {/* Card 1: GitHub Repository URL */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3.5 mb-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F4F5] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#141A16] leading-tight">GitHub Repository URL</h3>
                <p className="text-xs text-[#78827A] pt-0.5">Auto-parses README & package dependencies</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <input 
                type="text" 
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleIngest();
                }}
                placeholder="https://github.com/username/repository"
                className="flex-1 h-11 px-4 rounded-xl border border-[#E5E1D5] bg-[#FAF9F6] text-xs sm:text-sm text-[#141A16] placeholder:text-[#9DA69E] focus:outline-none focus:border-[#6B9E75] focus:bg-white transition-all font-mono"
              />
              <button
                onClick={handleIngest}
                disabled={isIngesting || (!githubUrl.trim() && !notes.trim() && !selectedFile)}
                title="Extract Facts to Ledger"
                className="w-11 h-11 rounded-xl bg-[#6B9E75] hover:bg-[#598E64] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold text-base shrink-0 transition-colors shadow-sm cursor-pointer"
              >
                {isIngesting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <span>→</span>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Upload Document */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3.5 mb-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#3B82F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-[#141A16]">Upload Document (PDF, DOCX, PPTX, or TXT)</h3>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-[#D4CFC2] hover:border-[#6B9E75] bg-white hover:bg-[#FAF9F6] rounded-xl py-7 sm:py-8 px-4 text-center cursor-pointer transition-all"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md"
                className="hidden"
              />
              
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className="w-8 h-8 flex items-center justify-center text-[#4B5563]">
                  <svg className="w-7 h-7 text-[#576159]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                    <path d="M12 13v6" />
                    <path d="m9 16 3-3 3 3" />
                  </svg>
                </div>

                {selectedFile ? (
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-[#1E6538]">
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
                    <p className="text-xs sm:text-sm font-semibold text-[#181F1A]">
                      Click to choose a file or drag and drop
                    </p>
                    <p className="text-xs text-[#869188]">
                      Supports PDF reports, project slides, and technical specs
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Project Notes & Key Metrics */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-[#141A16]">Project Notes & Key Metrics</h3>
              </div>

              <button 
                type="button" 
                onClick={handlePresetNotes}
                className="text-xs sm:text-[13px] font-semibold text-[#1E6B38] hover:text-[#145028] cursor-pointer transition-colors"
              >
                + Insert Sample Production Notes
              </button>
            </div>

            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add key details about the project, your role, technologies used, metrics, and impact..."
              className="w-full h-22 sm:h-24 p-4 rounded-xl border border-[#E5E1D5] bg-white text-xs sm:text-sm text-[#141A16] placeholder:text-[#9DA69E] focus:outline-none focus:border-[#6B9E75] transition-all resize-none leading-relaxed"
            />
          </div>

        </div>

        {/* ========================================================================= */}
        {/* --- Bottom Security Assurance Row (matching reference image) --- */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between pt-6 pb-4 text-xs text-[#717C74] shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#7E8881] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Protected by prompt injection guardrails (Section 7)</span>
          </div>

          {/* If notes or file are added, sleek inline trigger */}
          {(notes.trim() || selectedFile) && (
            <button
              onClick={handleIngest}
              disabled={isIngesting}
              className="text-xs sm:text-sm font-semibold text-[#1E6B38] hover:underline cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <span>{isIngesting ? "Extracting..." : "Extract to Ledger →"}</span>
            </button>
          )}
        </div>

      </main>

    </div>
  );
}
