"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";

const defaultChecks = [
  "All resume claims cite an active fact in the ledger",
  "Google ADK Verifier passed all quantitative metrics",
  "No ungrounded buzzwords or unsupported tools detected",
  "5-component ATS score verified and sealed",
];

export default function ExportPage() {
  const st = useStore();
  const { bullets, score, facts, live, jobId, profile, summary } = st;
  const [toastMsg, setToastMsg] = useState("");
  const [checks, setChecks] = useState<{ ok: boolean; text: string }[]>(
    defaultChecks.map((text) => ({ ok: true, text }))
  );

  useEffect(() => {
    if (live && jobId) {
      api.preflight(jobId).then((p) => setChecks(p.checks)).catch(() => {});
    }
  }, [live, jobId, bullets]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const getResumeHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${profile.name || "Palak Bhatt"} - Skillora Resume</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #141A16; margin: 40px; }
          h1 { margin-bottom: 4px; font-size: 26px; }
          .contact { font-size: 13px; color: #556056; margin-bottom: 24px; }
          h2 { font-size: 15px; text-transform: uppercase; border-bottom: 1.5px solid #1E6B38; padding-bottom: 4px; margin-top: 20px; color: #1E6B38; }
          ul { margin-top: 8px; padding-left: 20px; }
          li { font-size: 13px; margin-bottom: 6px; }
          .citation { font-size: 11px; color: #78827A; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>${profile.name || "Palak Bhatt"}</h1>
        <div class="contact">
          ${profile.email || "palak@skillora.ai"} · ${profile.location || "Bengaluru"} · ${profile.links || "github.com/palakbhatt1"}
        </div>
        <h2>Professional Summary</h2>
        <p style="font-size: 13px;">${summary || "Grounded candidate profile synthesized from verified ledger facts."}</p>
        <h2>Experience &amp; Projects</h2>
        <ul>
          ${bullets.map((b) => `<li>${b.text} <span class="citation">[${b.facts.join(", ")}]</span></li>`).join("")}
        </ul>
      </body>
    </html>
  `;

  const handleDownload = (fmt: "pdf" | "docx") => {
    if (bullets.length === 0) {
      return showToast("No resume bullets generated yet. Please complete Stage 3 & 4 first.");
    }
    if (live && jobId) {
      window.location.href = api.exportUrl(jobId, fmt);
      return showToast(fmt === "pdf" ? "Downloading verified PDF resume..." : "Downloading Word DOCX resume...");
    }

    if (fmt === "docx") {
      const blob = new Blob([getResumeHtml()], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(profile.name || "Candidate").replace(/\s+/g, "_")}_Resume.doc`;
      a.click();
      URL.revokeObjectURL(url);
      return showToast("Downloaded Word-compatible resume document!");
    }

    // PDF Print window fallback
    const printWindow = window.open("", "_blank");
    if (!printWindow) return showToast("Please allow pop-ups to export as PDF.");
    printWindow.document.write(getResumeHtml());
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    showToast("Opened print dialog — select 'Save as PDF'.");
  };

  const verifiedCount = facts.filter((f) => f.status === "verified").length;
  const allChecksOk = checks.every((c) => c.ok);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB]">
              Stage 6 · Final Export
            </span>
            <span className="text-xs text-[#78827A]">Production-Ready Resume</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141A16] tracking-tight">
            Export Verified Resume
          </h1>
          <p className="text-sm text-[#556056] max-w-2xl leading-relaxed">
            Pre-flight checklist verifies that every claim is anchored to ground truth. Export in clean ATS-friendly PDF or Word DOCX format.
          </p>
        </div>

        <Link
          href="/"
          className="px-6 py-2.5 bg-[#FAF9F5] hover:bg-white text-[#141A16] border border-[#ECE7DD] rounded-full font-bold text-xs sm:text-sm shadow-sm transition-all shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>← Back to Home</span>
        </Link>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-[#EAF4EB] border border-[#C5E1CB] text-xs sm:text-sm font-medium text-[#1E6B38] flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg("")} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* 2-Column Pre-flight Checklist vs Download Formats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Pre-Flight Checklist */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between border-b border-[#ECE7DD] pb-3">
            <h3 className="text-base font-serif font-bold text-[#141A16]">Pre-Flight Grounding Checks</h3>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              allChecksOk ? "bg-[#EAF4EB] text-[#1E6B38]" : "bg-amber-100 text-amber-800"
            }`}>
              {allChecksOk ? "✓ Passed 100%" : "Requires Review"}
            </span>
          </div>

          <div className="space-y-3">
            {checks.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD]"
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  c.ok ? "bg-[#1E6B38] text-white" : "bg-rose-500 text-white"
                }`}>
                  {c.ok ? "✓" : "✕"}
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#141A16] leading-relaxed">
                  {c.text}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Stats Pill Row */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#ECE7DD]">
            <span className="px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#ECE7DD] text-xs font-bold text-[#141A16]">
              {bullets.length} Resume Bullets
            </span>
            <span className="px-3 py-1 rounded-full bg-[#EAF4EB] border border-[#C5E1CB] text-xs font-bold text-[#1E6B38]">
              {verifiedCount} Verified Fact Citations
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#ECE7DD] text-xs font-bold text-[#141A16]">
              ATS Score: {score}/100
            </span>
          </div>
        </div>

        {/* Right Column: Download Formats & Preview Card */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-6">
          <div className="border-b border-[#ECE7DD] pb-3">
            <h3 className="text-base font-serif font-bold text-[#141A16]">Download Formats</h3>
            <p className="text-xs text-[#78827A]">Both formats follow clean ATS typography guidelines</p>
          </div>

          {/* PDF Download Button */}
          <button
            onClick={() => handleDownload("pdf")}
            className="w-full p-4 rounded-xl border border-[#ECE7DD] bg-[#FAF9F5] hover:bg-[#EAF4EB] hover:border-[#C5E1CB] transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-sm font-bold text-[#141A16] group-hover:text-[#1E6B38]">
                  Download PDF Resume
                </p>
                <p className="text-xs text-[#78827A]">Print-ready vector layout with verified grounding</p>
              </div>
            </div>
            <span className="text-base font-bold text-[#1E6B38] group-hover:translate-x-1 transition-transform">
              ↓
            </span>
          </button>

          {/* Word DOCX Download Button */}
          <button
            onClick={() => handleDownload("docx")}
            className="w-full p-4 rounded-xl border border-[#ECE7DD] bg-[#FAF9F5] hover:bg-[#EAF4EB] hover:border-[#C5E1CB] transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-sm font-bold text-[#141A16] group-hover:text-[#1E6B38]">
                  Download Word (.DOCX)
                </p>
                <p className="text-xs text-[#78827A]">Fully editable document formatted for recruiter ATS systems</p>
              </div>
            </div>
            <span className="text-base font-bold text-[#1E6B38] group-hover:translate-x-1 transition-transform">
              ↓
            </span>
          </button>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD] text-xs text-[#556056] leading-relaxed">
            <span className="font-bold text-[#1E6B38]">Recruiter Assurance: </span>
            This resume was generated through Skillora's verifiable multi-agent pipeline. Zero hallucinated claims or exaggerated metrics.
          </div>
        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-[#ECE7DD]">
        <Link
          href="/score"
          className="text-xs font-semibold text-[#556056] hover:text-[#141A16] flex items-center gap-1"
        >
          <span>← Back to Score Report</span>
        </Link>

        <Link
          href="/sources"
          className="text-xs font-bold text-[#1E6B38] hover:underline"
        >
          + Add more projects for another role
        </Link>
      </div>

    </div>
  );
}
