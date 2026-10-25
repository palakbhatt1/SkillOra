"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { api, getToken, setToken } from "@/lib/api";

export default function Login() {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/sources");
    api.health().catch(() => setOffline(true));
  }, [router]);

  useGSAP(
    () => {
      gsap.from(".auth-card", { y: 60, opacity: 0, scale: 0.96, duration: 0.9, ease: "power3.out" });
      gsap.from(".auth-side > *", { y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", delay: 0.2 });
    },
    { scope: root }
  );

  // swap animation when toggling sign in <-> create account
  useGSAP(
    () => { gsap.fromTo(".auth-fields > *", { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.45, ease: "power2.out" }); },
    { scope: root, dependencies: [mode] }
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = mode === "signup" ? await api.signup(email, password, name) : await api.login(email, password);
      setToken(r.token);
      gsap.to(".auth-card", { y: -30, opacity: 0, duration: 0.4, onComplete: () => router.replace("/sources") });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the server.");
      gsap.fromTo(".auth-card", { x: -12 }, { x: 0, duration: 0.5, ease: "elastic.out(1,0.3)" });
      setBusy(false);
    }
  };

  return (
    <div ref={root} className="auth-wrap">
      <div className="auth-side">
        <Link href="/" className="brand"><span className="logo">R</span>SkillOra</Link>
        <h1 className="display" style={{ fontSize: "3.6rem" }}>Your work.<br /><span className="grad-text">Your private ledger.</span></h1>
        <p className="lead">Each account keeps its own sources, verified facts and tailored resumes. Nobody else can see them — and nothing is ever written that your sources can&apos;t back up.</p>
        <ul className="stack muted" style={{ listStyle: "none" }}>
          <li>✓ No resume upload needed — add GitHub repos, documents or notes</li>
          <li>✓ Every claim traced to a quoted source</li>
          <li>✓ One explainable job-fit score</li>
        </ul>
      </div>

      <form className="auth-card card flat" onSubmit={submit}>
        <div className="tabs" style={{ marginBottom: "1.6rem" }}>
          <button type="button" className={`tab ${mode === "login" ? "on" : ""}`} onClick={() => { setMode("login"); setError(""); }}>Log in</button>
          <button type="button" className={`tab ${mode === "signup" ? "on" : ""}`} onClick={() => { setMode("signup"); setError(""); }}>Create account</button>
        </div>
        <div className="stack auth-fields" style={{ gap: "1rem" }}>
          <h2 className="h3">{mode === "login" ? "Welcome back" : "Start your ledger"}</h2>
          {mode === "signup" && <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <input className="input" type="password" placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "signup" ? 8 : 1} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
          {error && <p style={{ color: "var(--c-rose)" }} role="alert">{error}</p>}
          <button className="btn primary" disabled={busy || !email || !password} style={{ justifyContent: "center" }}>
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
          {offline && (
            <p className="muted small">The backend is not reachable. <Link href="/sources" style={{ color: "var(--c-green)" }}>Continue with demo data →</Link></p>
          )}
        </div>
      </form>
    </div>
  );
}
