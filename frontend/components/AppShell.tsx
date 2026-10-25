"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { animateIn, gsap, useGSAP } from "@/lib/gsap";
import { useStore } from "@/lib/store";
import AgentPanel from "./AgentPanel";

export const screens = [
  { href: "/sources", label: "Add Sources" },
  { href: "/verify", label: "Verify Facts" },
  { href: "/job", label: "New Job" },
  { href: "/tailor", label: "Tailor & Edit" },
  { href: "/score", label: "Score Report" },
  { href: "/export", label: "Export" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const main = useRef<HTMLElement>(null);
  const side = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { score, live, ready, llm, busy, error, notice, mode, profile, logout, analyzed } = useStore();

  // sidebar entrance (once)
  useGSAP(
    () => {
      gsap.from(".side-link", { x: -30, opacity: 0, stagger: 0.06, duration: 0.7, ease: "power3.out" });
      gsap.from(".side .brand", { y: -20, opacity: 0, duration: 0.6 });
    },
    { scope: side }
  );

  // page-level GSAP choreography on every route change
  useGSAP(
    () => {
      setOpen(false);
      if (main.current) animateIn(main.current);
    },
    { scope: main, dependencies: [path] }
  );

  return (
    <div className="shell">
      <aside ref={side} className={`side ${open ? "open" : ""}`}>
        <Link href="/" className="brand">
          <span className="logo">R</span>SkillOra
        </Link>
        <nav className="side-nav">
          {screens.map((s, i) => (
            <Link key={s.href} href={s.href} className={`side-link ${path === s.href ? "active" : ""}`}>
              <span className="n">{i + 1}</span>
              {s.label}
            </Link>
          ))}
        </nav>
        <Link href="/how-it-works" className="side-link" style={{ marginTop: "-.9rem" }}><span className="n">?</span>How it works</Link>
        <AgentPanel />
        <div className="side-foot card flat">
          <div className="row" style={{ marginBottom: ".8rem", gap: ".5rem" }}>
            <span className={`chip ${!ready ? "" : live ? "green" : "amber"}`}><i className="dot" />{!ready ? "connecting" : live ? (llm ? "live · Gemini agents" : "live · rules") : "demo data"}</span>
          </div>
          {live && (
            <div className="side-user">
              <span className="small side-name">{profile.name}</span>
              <button className="btn sm" onClick={logout}>Log out</button>
            </div>
          )}
          <div className="muted small">Current job-fit</div>
          <div className="row between" style={{ marginTop: ".4rem" }}>
            <b style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>{live && !analyzed ? "–" : score}</b>
            {live && !analyzed ? <span className="chip">no job yet</span> : <span className="chip green">live</span>}
          </div>
          <div className="bar" style={{ marginTop: ".6rem" }}>
            <i style={{ width: `${live && !analyzed ? 0 : score}%`, transition: "width .8s" }} />
          </div>
        </div>
      </aside>
      <main className="main" ref={main}>
        <div className="mobile-top">
          <Link href="/" className="brand">
            <span className="logo">R</span>SkillOra
          </Link>
          <button className="btn sm" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
        {(busy || error || notice) && (
          <div className={`banner ${error ? "err" : busy ? "busy" : "ok"}`}>
            {busy && <span className="spin" />}
            <span>{error ? `Something went wrong: ${error}` : busy ? `${busy}…` : notice}</span>
          </div>
        )}
        {children}
        {mode === "rules" && <p className="muted small" style={{ marginTop: "1rem" }}>Gemini was unavailable for this job, so the rule-based fallback ran.</p>}
      </main>
    </div>
  );
}

export function PageHead({ step, title, sub, children }: { step: number; title: string; sub: string; children?: ReactNode }) {
  return (
    <div className="page-head" data-in>
      <div>
        <span className="eyebrow">Step {step} of 6</span>
        <h1 style={{ marginTop: ".6rem" }}>{title}</h1>
        <p>{sub}</p>
      </div>
      <div className="row wrapflex">{children}</div>
    </div>
  );
}
