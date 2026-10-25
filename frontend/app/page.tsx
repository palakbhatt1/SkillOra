"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { agents, evalMetrics, scoreComponents, team, timeline } from "@/lib/data";

const steps = [
  { phase: "Phase 1 · Source of truth", t: "Add sources", d: "GitHub repos, PDFs, DOCX, PPTX and notes — input-checked for malicious content, PII and file size.", tag: "Ingest" },
  { phase: "Phase 1 · Source of truth", t: "Extract facts", d: "The Source Extractor (CrewAI) turns chunks into facts, each with a quoted source span.", tag: "CrewAI" },
  { phase: "Phase 1 · Source of truth", t: "Verify in the ledger", d: "You confirm, edit or reject every fact. Changed sources flag affected facts as stale.", tag: "Human-in-loop" },
  { phase: "Phase 2 · Per job", t: "Analyze the JD", d: "Pasted job description becomes structured must / nice-have requirements and keywords.", tag: "CrewAI" },
  { phase: "Phase 2 · Per job", t: "Match & select", d: "Exact → fuzzy → embedding matching, then projects chosen by task relevance.", tag: "CrewAI + ADK" },
  { phase: "Phase 2 · Per job", t: "Write & verify", d: "The Writer uses fact IDs only. The Verifier blocks any unsupported claim.", tag: "Google ADK" },
  { phase: "Phase 2 · Per job", t: "Score & export", d: "A deterministic five-component score with evidence, then PDF or DOCX.", tag: "Python" },
];

const marquee = ["Fact ledger", "Zero fabrication", "Explainable score", "CrewAI Flows", "Google ADK", "Gemini", "FastAPI", "Next.js", "Local-first"];

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ---- hero intro ----
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".nav", { y: -80, opacity: 0, duration: 0.9 })
        .from(".hero .eyebrow", { y: 20, opacity: 0, duration: 0.7 }, 0.2)
        .from(".hero h1 .line > span", { yPercent: 110, rotate: 3, duration: 1.1, stagger: 0.12 }, 0.3)
        .from(".hero .lead", { y: 30, opacity: 0, duration: 0.9 }, 0.8)
        .from(".hero-actions .btn", { y: 30, opacity: 0, stagger: 0.1, duration: 0.8 }, 0.95)
        .from(".hero-stats > div", { y: 30, opacity: 0, stagger: 0.1, duration: 0.8 }, 1.05)
        .from(".float-card", { y: 80, opacity: 0, scale: 0.9, stagger: 0.18, duration: 1.1, ease: "back.out(1.4)" }, 0.6);

      gsap.utils.toArray<HTMLElement>(".float-card").forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? 14 : -14, duration: 2.6 + i * 0.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
      gsap.utils.toArray<HTMLElement>(".float-card .bar > i").forEach((el) => {
        gsap.to(el, { width: el.dataset.w + "%", duration: 1.6, delay: 1.4, ease: "power2.out" });
      });
      const o = { v: 0 };
      gsap.to(o, { v: 78, duration: 2, delay: 1.2, ease: "power2.out", onUpdate: () => { const e = document.querySelector("#hero-score"); if (e) e.textContent = String(Math.round(o.v)); } });

      // hero visual parallax on scroll
      gsap.to(".hero-visual", { yPercent: -12, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-copy", { yPercent: 10, opacity: 0.2, scrollTrigger: { trigger: ".hero", start: "20% top", end: "bottom top", scrub: true } });

      // ---- marquee ----
      gsap.to(".marquee-track", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });

      // ---- generic section reveals ----
      gsap.utils.toArray<HTMLElement>(".section-head").forEach((el) => {
        gsap.from(el.children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 82%" } });
      });
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.from(el.children, { y: 60, opacity: 0, scale: 0.96, stagger: 0.09, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 80%" } });
      });

      // ---- problem compare ----
      gsap.from(".cmp-bad", { x: -80, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".compare", start: "top 78%" } });
      gsap.from(".cmp-good", { x: 80, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".compare", start: "top 78%" } });
      gsap.from(".strike", { backgroundSize: "0% 2px", duration: 1.2, ease: "power2.inOut", scrollTrigger: { trigger: ".compare", start: "top 65%" } });

      // ---- pinned horizontal workflow (desktop/tablet only) ----
      mm.add("(min-width: 701px)", () => {
        const track = document.querySelector<HTMLElement>(".pin-track");
        if (!track) return;
        const dist = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: { trigger: ".pin-wrap", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
        });
        gsap.from(".step-card", { opacity: 0.2, scale: 0.92, stagger: 0.1, scrollTrigger: { trigger: ".pin-wrap", start: "top 60%", end: "top top", scrub: true } });
      });
      mm.add("(max-width: 700px)", () => {
        gsap.from(".step-card", { y: 50, opacity: 0, stagger: 0.1, scrollTrigger: { trigger: ".pin-track", start: "top 85%" } });
      });

      // ---- workflow image ----
      gsap.from(".diagram", { scale: 0.92, opacity: 0, y: 60, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".diagram", start: "top 85%" } });

      // ---- score bars ----
      gsap.utils.toArray<HTMLElement>(".score-demo .bar > i").forEach((el) => {
        gsap.to(el, { width: el.dataset.w + "%", duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" } });
      });
      gsap.utils.toArray<HTMLElement>(".score-demo [data-count]").forEach((el) => {
        const o2 = { v: 0 };
        gsap.to(o2, { v: Number(el.dataset.count), duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: () => { el.textContent = String(Math.round(o2.v)); } });
      });

      // ---- metrics counters ----
      gsap.utils.toArray<HTMLElement>(".metric b").forEach((el) => {
        const o3 = { v: 0 };
        gsap.to(o3, { v: Number(el.dataset.count), duration: 2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%" }, onUpdate: () => { el.textContent = Math.round(o3.v) + "%"; } });
      });

      // ---- timeline fill (scrubbed) ----
      gsap.fromTo(".tl-fill", { height: 0 }, { height: "calc(100% - .8rem)", ease: "none", scrollTrigger: { trigger: ".tl", start: "top 70%", end: "bottom 60%", scrub: true } });
      gsap.utils.toArray<HTMLElement>(".tl-item").forEach((el) => {
        gsap.from(el, { x: 60, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
      });

      // ---- CTA ----
      gsap.from(".cta-box", { scale: 0.9, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".cta-box", start: "top 85%" } });

      // ---- card tilt ----
      gsap.utils.toArray<HTMLElement>(".agent, .tilt").forEach((card) => {
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.4 });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.4 });
        gsap.set(card, { transformPerspective: 900 });
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
        });
        card.addEventListener("mouseleave", () => { rx(0); ry(0); });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <nav className="nav">
        <Link href="/" className="brand"><span className="logo">R</span>SkillOra</Link>
        <div className="nav-links">
          <Link href="/how-it-works">How it works</Link><a href="#problem">Problem</a><a href="#workflow">Workflow</a><a href="#agents">Agents</a><a href="#score">Scoring</a><a href="#team">Team</a>
        </div>
        <div className="row" style={{ gap: ".6rem" }}><Link href="/login" className="btn sm">Log in</Link><Link href="/login" className="btn primary sm">Get started →</Link></div>
      </nav>

      {/* ============ HERO ============ */}
      <header className="hero wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Agentic AI · Resume Intelligence</span>
            <h1 className="display" style={{ marginTop: "1.4rem" }}>
              <span className="line"><span>One verified profile.</span></span>
              <span className="line"><span className="grad-text">Every resume, tailored.</span></span>
            </h1>
            <p className="lead" style={{ marginTop: "1.8rem" }}>
              SkillOra keeps a source-linked fact ledger of everything you have built, then tailors a resume per job description — never inventing a detail — and explains your job-fit score line by line.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="btn primary">Create your account →</Link>
              <a href="#workflow" className="btn">See how it works</a>
            </div>
            <div className="hero-stats">
              <div><b>9</b><span>cooperating agents</span></div>
              <div><b>5</b><span>score components</span></div>
              <div><b>0</b><span>fabricated claims</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="float-card one">
              <div className="row between"><span className="chip green"><i className="dot" /> verified</span><span className="mono muted">F101</span></div>
              <p style={{ marginTop: ".8rem", fontWeight: 600 }}>Built a multi-agent resume pipeline with CrewAI + Google ADK.</p>
              <p className="muted small" style={{ marginTop: ".5rem" }}>“…orchestrates CrewAI flows with Google ADK sub-agents…”</p>
            </div>
            <div className="float-card two">
              <div className="row between"><b>Job-fit score</b><span className="chip blue">explainable</span></div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "4.4rem", lineHeight: 1.1 }}><span id="hero-score">0</span><span className="muted" style={{ fontSize: "1.3rem" }}>/100</span></div>
              <div className="stack" style={{ gap: ".5rem" }}>
                <div className="bar"><i data-w="82" style={{ ["--c" as string]: "var(--c-green)" }} /></div>
                <div className="bar"><i data-w="70" style={{ ["--c" as string]: "var(--c-blue)" }} /></div>
                <div className="bar"><i data-w="88" style={{ ["--c" as string]: "var(--c-violet)" }} /></div>
              </div>
            </div>
            <div className="float-card three">
              <div className="row between"><span className="chip rose">Verifier</span><span className="chip">blocked 1 claim</span></div>
              <p style={{ marginTop: ".8rem", fontSize: ".92rem" }}><span className="muted">Draft:</span> “Improved accuracy by 40%”</p>
              <p className="small" style={{ color: "var(--c-rose)", marginTop: ".3rem" }}>✕ No source span supports “40%”. Sent back to Writer.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="marquee">
        <div className="marquee-track">
          {[...marquee, ...marquee].map((m, i) => <span key={i}>{m}</span>)}
        </div>
      </div>

      {/* ============ PROBLEM ============ */}
      <section className="section wrap" id="problem">
        <div className="section-head">
          <span className="eyebrow">The problem</span>
          <h2 className="h2">Generic AI invents. ATS tools hide.</h2>
          <p className="lead">Candidates re-tailor the same resume for every application, and the tools they reach for fail in two ways.</p>
        </div>
        <div className="compare">
          <div className="card cmp-bad glow-line" style={{ ["--tone" as string]: "var(--c-rose)" }}>
            <span className="chip rose">Today</span>
            <h3 className="h3" style={{ margin: "1rem 0" }}>Chat-based tailoring &amp; paywalled ATS</h3>
            <ul className="stack muted" style={{ listStyle: "none" }}>
              <li>✕ Omits a component or attaches the <span className="strike" style={{ backgroundImage: "linear-gradient(var(--c-rose),var(--c-rose))", backgroundRepeat: "no-repeat", backgroundPosition: "0 60%", backgroundSize: "100% 2px" }}>wrong technology</span></li>
              <li>✕ Changes a metric or invents a plausible-sounding description</li>
              <li>✕ Same resume + JD gives different scores run to run</li>
              <li>✕ Reasoning and breakdown hidden behind paid tiers</li>
            </ul>
          </div>
          <div className="card cmp-good glow-line">
            <span className="chip green">With SkillOra</span>
            <h3 className="h3" style={{ margin: "1rem 0" }}>A ledger of facts, an engine of proof</h3>
            <ul className="stack" style={{ listStyle: "none" }}>
              <li>✓ Every claim cites a quoted source span and a fact ID</li>
              <li>✓ A Verifier agent blocks anything the source can’t support</li>
              <li>✓ Scoring is plain Python — identical input, identical score</li>
              <li>✓ Five components, visible evidence, ranked fixes. Free.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============ PINNED WORKFLOW ============ */}
      <section id="workflow" className="pin-wrap">
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3rem" }}>
          <div className="wrap section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Workflow</span>
            <h2 className="h2">From scattered sources to a verified resume</h2>
          </div>
          <div className="pin-track">
            {steps.map((s, i) => (
              <div key={i} className="card step-card tilt">
                <div className="row between"><span className="chip">{s.phase}</span><span className="chip violet">{s.tag}</span></div>
                <div className="step-n grad-text">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="h3">{s.t}</h3>
                <p className="muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section wrap">
        <img className="diagram card flat" src="/workflow.webp" loading="lazy" decoding="async" width={1536} height={1024} alt="SkillOra two-phase workflow diagram" style={{ width: "100%", padding: "1rem", background: "#fff" }} />
      </section>

      {/* ============ AGENTS ============ */}
      <section className="section wrap" id="agents">
        <div className="section-head">
          <span className="eyebrow">The agent team</span>
          <h2 className="h2">Nine specialists, one rule: no claim without a source</h2>
          <p className="lead">CrewAI Flows run the deterministic analysis pipeline; Google ADK runs the interactive, stateful tailoring side.</p>
        </div>
        <div className="grid g3" data-stagger>
          {agents.map((a) => (
            <div key={a.name} className={`card agent glow-line tone-${a.tone}`}>
              <div className="row"><h3 className="h3">{a.name}</h3><span className="chip fw">{a.fw}</span></div>
              <p className="muted" style={{ marginTop: ".9rem" }}>{a.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ SCORE ============ */}
      <section className="section wrap" id="score">
        <div className="grid g2 score-demo" style={{ alignItems: "center", gap: "4rem" }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Explainable scoring</span>
            <h2 className="h2">A score you can argue with</h2>
            <p className="lead">Five weighted components, each with visible evidence. Because it is deterministic code — not an LLM — the same resume and JD always produce the same number.</p>
            <Link href="/score" className="btn" style={{ justifySelf: "start" }}>Open a sample report →</Link>
          </div>
          <div className="card flat">
            {scoreComponents.map((c) => (
              <div key={c.key} className="comp">
                <div className="row between"><span>{c.key} <span className="muted small">· {c.weight}%</span></span><b data-count={c.value}>0</b></div>
                <div className="bar"><i data-w={c.value} style={{ ["--c" as string]: c.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EVAL ============ */}
      <section className="section wrap">
        <div className="section-head">
          <span className="eyebrow">Evaluation</span>
          <h2 className="h2">Measured, not claimed</h2>
          <p className="lead">Four metrics tracked on an evaluation set, each owned by a team member.</p>
        </div>
        <div className="grid g4" data-stagger>
          {evalMetrics.map((m) => (
            <div key={m.label} className="card metric tilt">
              <div className="stat"><b className="grad-text" data-count={m.value}>0%</b><span>{m.label}</span></div>
              <span className="chip" style={{ marginTop: "1.2rem" }}>Owner · {m.owner}</span>
            </div>
          ))}
        </div>
        <p className="muted small" style={{ marginTop: "1rem" }}>Figures shown are illustrative demo values pending the final evaluation run.</p>
      </section>

      {/* ============ TIMELINE ============ */}
      <section className="section wrap">
        <div className="grid g2" style={{ gap: "4rem", alignItems: "start" }}>
          <div className="section-head" style={{ position: "sticky", top: "7rem" }}>
            <span className="eyebrow">Roadmap</span>
            <h2 className="h2">Six weeks, seven screens, one demo</h2>
            <p className="lead">Local-first on a laptop, then containerised and deployed with a public URL.</p>
          </div>
          <div className="tl">
            <div className="tl-fill" />
            {timeline.map((t) => (
              <div key={t.title} className="tl-item">
                <span className="chip green">{t.when}</span>
                <h3 className="h3" style={{ margin: ".6rem 0 .3rem" }}>{t.title}</h3>
                <p className="muted">{t.out}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STACK ============ */}
      <section className="section wrap">
        <div className="section-head">
          <span className="eyebrow">Stack</span>
          <h2 className="h2">Runs entirely on a laptop</h2>
        </div>
        <div className="row wrapflex" data-stagger style={{ gap: ".8rem" }}>
          {["Next.js", "FastAPI", "SQLAlchemy + SQLite", "CrewAI", "Google ADK", "Gemini", "Ollama (optional)", "sentence-transformers", "RapidFuzz", "pdfplumber", "python-docx", "python-pptx", "Jinja + WeasyPrint", "GitHub REST API", "Docker Compose", "GSAP"].map((s) => (
            <span key={s} className="chip" style={{ fontSize: "1rem", padding: ".6rem 1.2rem" }}>{s}</span>
          ))}
        </div>
      </section>

      {/* ============ TEAM ============ */}
      <section className="section wrap" id="team">
        <div className="section-head">
          <span className="eyebrow">Team</span>
          <h2 className="h2">Four builders, one pipeline</h2>
        </div>
        <div className="grid g4" data-stagger>
          {team.map((m) => (
            <div key={m.id} className="card tilt">
              <div className="brand"><span className="logo" style={{ width: "3.4rem", height: "3.4rem", fontSize: "1.3rem" }}>{m.name[0]}</span></div>
              <h3 className="h3" style={{ marginTop: "1.2rem" }}>{m.name}</h3>
              <p className="mono muted" style={{ margin: ".3rem 0 .8rem" }}>{m.id}</p>
              <p className="muted small">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="section wrap">
        <div className="card flat cta-box glow-line" style={{ textAlign: "center", padding: "6rem 2rem" }}>
          <h2 className="display" style={{ fontSize: "4.4rem" }}>See it <span className="grad-text">work.</span></h2>
          <p className="lead" style={{ margin: "1.4rem auto 2.4rem" }}>Walk through all seven screens with a live, interactive demo.</p>
          <Link href="/login" className="btn primary">Get started →</Link>
        </div>
      </section>

      <footer className="footer">
        <span>© SkillOra · Agentic AI Project</span>
        <span>Palak Bhatt · Manya Agarwal · Vanshik Soni · Harman Singh Kanwar</span>
      </footer>
    </div>
  );
}
