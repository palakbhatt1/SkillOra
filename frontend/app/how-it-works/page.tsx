"use client";

import Link from "next/link";
import Image from "next/image";
import Ambient from "@/components/Ambient";

interface Step {
  title: string;
  who: string[];
  simple: string;
  points?: string[];
  input: string;
  output: string;
}

const STEPS: Step[] = [
  {
    title: "1. Multi-Modal Source Ingestion",
    who: ["Python Parsers", "GitHub API", "Prompt Injection Guardrails"],
    simple: "Upload your existing resume, GitHub repository URLs, technical reports, or freeform notes. Skillora scans and sanitizes every input against prompt injection.",
    points: [
      "Multi-format support: PDF, DOCX, PPTX, TXT, and ZIP code trees.",
      "Safety verification: File schema integrity and input sanitization.",
      "GitHub intelligence: Traverses READMEs, dependency manifests, and commit history.",
    ],
    input: "Resume.pdf + github.com/palakbhatt1/SkillOra",
    output: "Sanitized plain text chunks with source provenance.",
  },
  {
    title: "2. Verifiable Fact Extraction & Grounding",
    who: ["CrewAI Flow", "Gemini 2.5", "Verbatim Span Checker"],
    simple: "The CrewAI extraction agent extracts discrete achievements and skills. A deterministic validator verifies that every cited span exists verbatim in the raw source.",
    points: [
      "Structured fact schema: Type (Skill, Metric, Role), Project, and Verbatim Citation.",
      "Zero-hallucination guarantee: Discards any AI assertion that lacks source quote backing.",
      "Local SQLite persistence: Stored securely in candidate's local ledger.",
    ],
    input: "“Built a multi-agent resume tailoring pipeline using CrewAI…”",
    output: "Fact #F101 with verbatim source quote span.",
  },
  {
    title: "3. CrewAI Job Description Intelligence",
    who: ["CrewAI JD Analyzer", "RapidFuzz Matcher", "Sentence Embeddings"],
    simple: "When a target job is provided, CrewAI extracts categorized requirements (must-have vs nice-to-have, ATS keywords, seniority).",
    points: [
      "Cascading matcher: Exact token match → RapidFuzz Levenshtein similarity → sentence embeddings.",
      "Deterministic classification: Met, Partial, or Missing Gap.",
      "Project Relevance Selector: Automatically selects candidate projects that prove required skills.",
    ],
    input: "Target Senior Software Engineer Job Description",
    output: "Categorized requirements matrix with match confidence.",
  },
  {
    title: "4. Google ADK Grounded Resume Tailoring",
    who: ["Google ADK Agent", "Grounding Callback Verifier", "XYZ Structuring"],
    simple: "The Google ADK agent drafts targeted resume bullet points using only verified ledger facts. A verifier callback strictly rejects unsupported claims.",
    points: [
      "Interactive assistant: Refine bullets or request emphasis directly in chat.",
      "Clickable citations: Hovering or clicking any bullet reveals the source file and quote.",
      "ATS Keyword Coach: Suggests authentic ways to include missing keywords from real experience.",
    ],
    input: "Verified Facts + Target Job Requirements",
    output: "Tailored resume canvas with verifiable citations.",
  },
  {
    title: "5. Deterministic 5-Component ATS Scoring",
    who: ["Scoring Engine", "Explainable Python Algorithm"],
    simple: "Calculates an objective 0-100 job-fit score across 5 weighted dimensions. Every point earned is transparently explained.",
    points: [
      "5 Components: Hard Skills, Responsibilities, Experience Depth, Evidence Quality, Education.",
      "Customizable profiles: Select role weighting (e.g. AI/ML, Backend, Full-Stack).",
      "Actionable gap alerts: Identifies genuine missing qualifications.",
    ],
    input: "Tailored Resume + Matched Job Requirements",
    output: "Comprehensive ATS Fit Report with component breakdown.",
  },
  {
    title: "6. Pre-Flight Verification & Direct Export",
    who: ["Preflight Validator", "PDF / DOCX Exporter"],
    simple: "Validates that 100% of claims are anchored to verified facts before generating ATS-compatible PDF and Word documents.",
    points: [
      "Zero ungrounded assertions allowed in output.",
      "Standard ATS typography: Clean single-column hierarchy.",
      "Recruiter assurance: Verifiable trace back to source repositories.",
    ],
    input: "Verified Tailored Resume",
    output: "Downloadable PDF and Word (.DOCX) resume files.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#141A16] flex flex-col justify-between relative selection:bg-[#DCFCE7] selection:text-[#166534]">
      <Ambient />

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Skillora Logo" width={28} height={28} priority />
          <span className="text-xl font-serif font-bold text-[#141A16]">Skillora</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/sources" className="text-xs font-semibold text-[#1E6B38] hover:underline">
            Launch Workspace →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 space-y-12 w-full">
        
        {/* Hero title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-3 py-1 rounded-full border border-[#C5E1CB]">
            Architectural Blueprint
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-normal text-[#141A16] tracking-tight leading-tight">
            How Skillora Works
          </h1>
          <p className="text-sm text-[#556056] leading-relaxed">
            A hybrid multi-agent architecture combining <span className="font-semibold text-[#141A16]">CrewAI</span> orchestration, <span className="font-semibold text-[#141A16]">Google ADK</span> tailoring, and <span className="font-semibold text-[#141A16]">deterministic Python engines</span> to eliminate hallucinations.
          </p>
        </div>

        {/* 6 Step Cards */}
        <div className="space-y-6">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECE7DD] pb-3">
                <h3 className="text-lg font-serif font-bold text-[#141A16]">{step.title}</h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {step.who.map((w) => (
                    <span
                      key={w}
                      className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#ECE7DD] text-[10px] font-semibold text-[#1E6B38]"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#556056] leading-relaxed">
                {step.simple}
              </p>

              {step.points && (
                <div className="space-y-1.5 pl-4 border-l-2 border-[#EAF4EB]">
                  {step.points.map((pt, i) => (
                    <p key={i} className="text-xs text-[#556056] leading-relaxed">
                      • {pt}
                    </p>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#78827A] font-sans">Input:</span>
                  <p className="text-[#141A16]">{step.input}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#EAF4EB]/50 border border-[#C5E1CB] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#1E6B38] font-sans">Output:</span>
                  <p className="text-[#1E6B38] font-semibold">{step.output}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Card */}
        <div className="bg-[#121614] text-white p-8 rounded-2xl shadow-xl text-center space-y-4">
          <h2 className="text-2xl font-serif font-bold">Ready to Experience Skillora?</h2>
          <p className="text-xs sm:text-sm text-[#A0ACA2] max-w-md mx-auto">
            Extract verified facts from your GitHub repositories and generate job-specific tailored resumes in under 3 minutes.
          </p>
          <div className="pt-2">
            <Link
              href="/sources"
              className="inline-block px-6 py-2.5 bg-[#1E6B38] hover:bg-[#258245] text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              Get Started Free →
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-xs text-[#78827A] flex items-center justify-between border-t border-[#ECE7DD]">
        <span>Skillora © 2026 · Hybrid Agentic Architecture</span>
        <Link href="/" className="text-[#1E6B38] font-semibold hover:underline">
          Back to Landing Page →
        </Link>
      </footer>
    </div>
  );
}
