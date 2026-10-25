"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface Step {
  title: string;
  who: string[];
  simple: string;
  points?: string[];
  input: string;
  output: string;
  tone?: "ok" | "bad";
  extra?: "score";
}

const PHASE1 = ["Sign up", "Add sources", "Make facts", "Check facts"];
const PHASE2 = ["Paste job", "Match", "Pick projects", "Write bullets", "Verify", "Score", "Export"];

const STEPS: Step[] = [
  {
    title: "Create your account",
    who: ["Next.js", "FastAPI", "PostgreSQL (Docker)"],
    simple: "Sign up with an email and password. Everything you add is saved in your own private space, so nobody else can ever see your data.",
    input: "Your email + password",
    output: "A private account. Other users get “not found” if they try to open your data.",
  },
  {
    title: "Add your sources",
    who: ["Python parsers", "GitHub API", "Input checker"],
    simple: "Give SkillOra the proof of your work: your resume (optional), GitHub repos, project documents or notes. It first checks every input is safe, then reads it.",
    points: [
      "Safety check: right file type, small enough, no hidden instructions aimed at the AI.",
      "GitHub is kept light: only the README, languages and a few config files are read, not the whole repo.",
      "GitHub links found inside your resume are offered to you, so you choose which repos to add.",
    ],
    input: "Resume.pdf  +  github.com/you/RashanMate",
    output: "Clean text from each source, ready to read.",
  },
  {
    title: "Turn them into facts",
    who: ["Source Extractor", "CrewAI + Gemini", "Python check"],
    simple: "An AI agent reads the text and writes down facts about your work. Every fact keeps the exact sentence it came from. Then a code check deletes any fact whose sentence is not really in your file, so the AI cannot make things up.",
    points: [
      "Your skills list becomes one fact per skill.",
      "Each project's “Built with …” line is kept so tools can be matched later.",
      "Each fact is labelled project, job or education.",
    ],
    input: "“Architected a scraping-driven directory of 44,000+ verified freight agents…”",
    output: "Fact F105 + its original quote (the proof).",
  },
  {
    title: "Check the facts",
    who: ["You"],
    simple: "Facts from your own files are confirmed for you, so you only review exceptions. Anything with a number waits for your click, because numbers are the easiest thing to get wrong.",
    points: ["You can confirm, edit or reject any fact.", "If you later change a source, facts whose quote disappeared are marked stale."],
    input: "“40+ verified suppliers” (contains a number)",
    output: "Waits for your click. The skill “React” was auto-confirmed.",
  },
  {
    title: "Paste a job description",
    who: ["JD Analyzer", "CrewAI + Gemini"],
    simple: "The agent reads the job post and lists what the company really wants: must-have skills, nice-to-haves, keywords and experience level.",
    input: "“Must have: Python, FastAPI. Nice to have: Docker, Kubernetes.”",
    output: "A clean list: 7 must-have and 4 nice-to-have requirements.",
  },
  {
    title: "Match the job to you",
    who: ["Matcher", "CrewAI + Python"],
    simple: "For each requirement it looks for proof in your confirmed facts. It tries three ways: the exact word (k8s counts as Kubernetes), then similar spelling, then similar meaning. A CrewAI agent double-checks the borderline cases.",
    input: "Requirement: Docker",
    output: "✓ Met — your skill fact “Docker”.   (FastAPI → ✕ Missing: it is not on your resume.)",
  },
  {
    title: "Pick what to show",
    who: ["Project Selector", "Python"],
    simple: "Not every project helps for every job. It scores how much each project supports this job and keeps the best 3 projects and the 2 most relevant jobs. You can switch any of them on or off.",
    input: "6 projects and jobs",
    output: "Hospiverse, SkyForge Agents, Hlty.care + the SkyForge internship selected.",
  },
  {
    title: "Write the bullet points",
    who: ["Resume Writer", "Google ADK + Gemini"],
    simple: "Related facts are grouped, and the Writer turns each group into one clear sentence: 2 bullets per project, 3 per job. It may only use what those facts say.",
    input: "Two facts about RashanMate",
    output: "“Implemented quantity and unit input, local saving of the last list, and quick item buttons…”",
  },
  {
    title: "Verify every bullet",
    who: ["Verifier", "ADK callback + Python"],
    simple: "A strict checker compares each bullet with the quoted sentences. A number that is not there, a tool you never used, or a boast like “expert” is rejected and sent back to the Writer. If it still fails, your original wording is used.",
    input: "“Improved speed by 55% using Docker”",
    output: "✕ Rejected — “55” and “Docker” are not in your source.",
    tone: "bad",
  },
  {
    title: "Fill the gaps honestly",
    who: ["Keyword Coach", "Python"],
    simple: "For keywords the job wants that your resume lacks: if one of your facts supports it, it suggests a rewrite. If not, it tells you it is a real gap. If you truly know a skill, you can declare it. It counts for less and is clearly marked.",
    input: "Job wants “Docker”, resume has no proof",
    output: "“Real gap — add a project, or declare the skill.” It never invents it.",
  },
  {
    title: "Score the resume",
    who: ["Scoring Engine", "plain Python, no AI"],
    simple: "A score out of 100 made of five parts. It is plain code, not AI, so the same resume and job always give the same score, and every point comes with a reason. The weights below are for the Standard profile; you can switch to Skills-first, Credentials-first or Graduate. Mandatory requirements are checked separately as eligibility, so one gap never hides behind other strengths.",
    input: "Your matches, skills, projects and bullets",
    output: "Job-fit score + the top fixes, ranked by how many points they would add.",
    extra: "score",
  },
  {
    title: "Chat and edit",
    who: ["Coordinator", "Google ADK + Gemini"],
    simple: "Ask the Coordinator why your score is low, what your gaps are, or to add or remove a project. Simple questions are answered instantly by its tools. Edit any bullet yourself and it is re-checked on the spot.",
    input: "“Why is my score low?”",
    output: "“Missing must-haves: PostgreSQL… Top fix: verify the 4 pending facts.”",
  },
  {
    title: "Download the resume",
    who: ["fpdf2", "python-docx"],
    simple: "Export a PDF or Word file. Only bullets that passed the Verifier are included, with your name, links, skills, experience, projects and education (degree, college, years).",
    input: "Your verified resume",
    output: "SkillOra-Resume.pdf  /  SkillOra-Resume.docx",
  },
];

const WEIGHTS: [string, number][] = [["Skills match", 40], ["Responsibility relevance", 25], ["Relevant experience", 15], ["Evidence quality", 10], ["Education", 10]];

const AI = [
  ["Read your files and write facts", "Source Extractor — CrewAI + Gemini"],
  ["Read the job description", "JD Analyzer — CrewAI + Gemini"],
  ["Double-check borderline matches", "Matcher — CrewAI + Gemini"],
  ["Write the bullet points", "Resume Writer — Google ADK + Gemini"],
  ["Answer open questions in chat", "Coordinator — Google ADK + Gemini"],
];
const CODE = [
  ["Check that quotes really exist in your file", "Span gate"],
  ["Match requirements (exact → fuzzy → meaning)", "Matcher tiers"],
  ["Reject wrong numbers, tools and boasts", "Verifier checks"],
  ["Choose which projects to show", "Project Selector"],
  ["Calculate the score", "Scoring Engine"],
  ["Export PDF and Word", "fpdf2 · python-docx"],
];

const TRUST = [
  ["Every fact has a quote", "Each fact points to the exact sentence in your own file. No quote, no fact."],
  ["Numbers must match", "A bullet cannot contain a number, tool or boast that its source does not contain."],
  ["Same score every time", "Scoring is plain code, not AI, so results never change between runs."],
  ["Your data stays yours", "Every account is separate. Sign-in is required for everything."],
];


const PROFILE_TABLE: [string, number, number, number, number, number][] = [
  ["Standard", 40, 25, 15, 10, 10],
  ["Skills-first", 50, 25, 10, 10, 5],
  ["Credentials-first", 30, 20, 15, 10, 25],
  ["Graduate / entry-level", 35, 30, 0, 20, 15],
];

const FORMULAS: { name: string; code: string; simple: string; formula: string; example: string }[] = [
  {
    name: "Skills match", code: "K",
    simple: "For every skill the job asks for, we give your resume 0 to 1 point depending on how well it is proved. Then we take the weighted average. Required skills count for 75% and nice-to-haves for 25%.",
    formula: "K = 100 × Σ(importance × match) ÷ Σ(importance)      then   K = 0.75 × K(required) + 0.25 × K(preferred)",
    example: "React 1.0, TypeScript 1.0, REST 1.0, Docker 0.5, Kubernetes 0 with importance 5, 4, 3, 2, 1  →  13 ÷ 15 = 86.7",
  },
  {
    name: "Responsibility relevance", code: "J",
    simple: "Does your past work look like the work this job does, not just use the same tools? 60% comes from how well the job's duties are proved, 40% from how relevant your best project is.",
    formula: "J = 0.6 × (duties proved) + 0.4 × (best project relevance)",
    example: "duties 100, best project 81  →  0.6 × 100 + 0.4 × 81 = 92.4",
  },
  {
    name: "Relevant experience", code: "E",
    simple: "Years you have divided by the years the job asks for, capped at 100%. It is only used when you entered your years and the job states what it needs. Otherwise it is skipped and its weight is shared by the other parts.",
    formula: "E = 100 × min(1, your years ÷ years needed)",
    example: "1 year of experience, the job asks for 3  →  100 × 1 ÷ 3 = 33",
  },
  {
    name: "Evidence quality", code: "Q",
    simple: "How convincing are your bullets? We look at three things in every bullet: does it name real tools (directness), does it start with an ownership word like Built or Designed (ownership), and does it have a number or several tools and pass the Verifier (verifiable).",
    formula: "Q = 100 × (0.40 × directness + 0.35 × ownership + 0.25 × verifiable)",
    example: "directness 0.89, ownership 0.96, verifiable 0.89  →  100 × (0.356 + 0.336 + 0.222) = 91",
  },
  {
    name: "Education", code: "A",
    simple: "How well your education meets what the job requires. If the job states no education requirement, you get full marks for having a verified degree, and a neutral 50 if none is found.",
    formula: "A = 100 × Σ(importance × match) ÷ Σ(importance)      (same weighted average as skills)",
    example: "required degree matched  →  A = 100",
  },
];

const MATCH_VALUES: [string, string][] = [
  ["1.0", "Proved in a project or job"],
  ["0.7", "Only listed in the skills section"],
  ["0.5", "Related or partly proved, or declared without proof"],
  ["0", "No evidence at all"],
];

export default function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".hw-hero > *", { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" });
      gsap.from(".hw-flow .hw-chip", { y: 24, opacity: 0, stagger: 0.07, duration: 0.6, ease: "back.out(1.6)", delay: 0.5 });

      // progress line that fills as you scroll through the steps
      gsap.fromTo(".hw-fill", { height: 0 }, { height: "100%", ease: "none", scrollTrigger: { trigger: ".hw-steps", start: "top 60%", end: "bottom 70%", scrub: true } });

      gsap.utils.toArray<HTMLElement>(".hw-step").forEach((el) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 78%", toggleActions: "play none none none" } });
        tl.from(el.querySelector(".hw-num"), { scale: 0, rotate: -90, duration: 0.5, ease: "back.out(2)" })
          .from(el.querySelector(".hw-text") ? (el.querySelector(".hw-text") as HTMLElement).children : [], { y: 30, opacity: 0, stagger: 0.09, duration: 0.6, ease: "power3.out" }, "-=0.2")
          .from(el.querySelector(".hw-in"), { x: 40, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.4")
          .from(el.querySelector(".hw-arrow"), { scaleY: 0, transformOrigin: "top", duration: 0.3 }, "-=0.1")
          .from(el.querySelector(".hw-out"), { x: 40, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.05");
        gsap.to(el.querySelector(".hw-num"), { scrollTrigger: { trigger: el, start: "top 55%", end: "bottom 55%", toggleClass: { targets: el, className: "active" } } });
      });

      gsap.utils.toArray<HTMLElement>(".hw-bar > i").forEach((b) =>
        gsap.to(b, { width: b.dataset.w + "%", duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: b, start: "top 90%" } })
      );
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((g) =>
        gsap.from(g.children, { y: 40, opacity: 0, stagger: 0.09, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: g, start: "top 82%" } })
      );
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <nav className="nav">
        <Link href="/" className="brand"><span className="logo">R</span>SkillOra</Link>
        <div className="nav-links"><a href="#steps">Step by step</a><a href="#formulas">Formulas</a><a href="#ai">AI vs code</a><a href="#trust">Why trust it</a></div>
        <div className="row" style={{ gap: ".6rem" }}><Link href="/login" className="btn sm">Log in</Link><Link href="/sources" className="btn primary sm">Open the app →</Link></div>
      </nav>

      <header className="wrap" style={{ paddingTop: "9rem", paddingBottom: "3rem" }}>
        <div className="hw-hero stack" style={{ gap: "1.4rem" }}>
          <span className="eyebrow">How SkillOra works</span>
          <h1 className="display" style={{ fontSize: "4.6rem" }}>From your work to <span className="grad-text">an honest resume</span>, step by step.</h1>
          <p className="lead">SkillOra keeps a list of facts about your work, each with its proof. For every job it builds a resume from those facts only, checks every line, and explains your fit score.</p>
        </div>

        <div className="hw-flow" style={{ marginTop: "3rem" }}>
          <div className="card flat">
            <span className="chip green">Phase 1 · once</span>
            <p className="muted small" style={{ margin: ".6rem 0 1rem" }}>Build your source of truth.</p>
            <div className="row wrapflex" style={{ gap: ".5rem" }}>
              {PHASE1.map((p, i) => <span key={p} className="hw-chip chip">{i + 1}. {p}</span>)}
            </div>
          </div>
          <div className="card flat">
            <span className="chip blue">Phase 2 · every job</span>
            <p className="muted small" style={{ margin: ".6rem 0 1rem" }}>Tailor the resume to one job description.</p>
            <div className="row wrapflex" style={{ gap: ".5rem" }}>
              {PHASE2.map((p, i) => <span key={p} className="hw-chip chip">{i + 5}. {p}</span>)}
            </div>
          </div>
        </div>
      </header>

      <section id="steps" className="wrap" style={{ paddingBottom: "5rem" }}>
        <div className="hw-steps">
          <div className="hw-line"><div className="hw-fill" /></div>
          {STEPS.map((s, i) => (
            <article key={s.title} className="hw-step">
              <div className="hw-num">{i + 1}</div>
              <div className="hw-text">
                <h2 className="h2" style={{ fontSize: "2.1rem" }}>{s.title}</h2>
                <div className="row wrapflex" style={{ gap: ".4rem" }}>{s.who.map((w) => <span key={w} className="chip violet">{w}</span>)}</div>
                <p style={{ fontSize: "1.1rem" }}>{s.simple}</p>
                {s.points && <ul className="stack muted" style={{ listStyle: "none", gap: ".5rem" }}>{s.points.map((p) => <li key={p}>• {p}</li>)}</ul>}
                {s.extra === "score" && (
                  <div className="stack" style={{ gap: ".6rem" }}>
                    {WEIGHTS.map(([k, w]) => (
                      <div key={k}>
                        <div className="row between small"><span>{k}</span><b>{w} points</b></div>
                        <div className="bar hw-bar"><i data-w={w * 2.2} /></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="hw-example">
                <div className="hw-in card flat"><span className="muted small">YOU GIVE</span><p>{s.input}</p></div>
                <div className="hw-arrow">↓</div>
                <div className={`hw-out card flat ${s.tone === "bad" ? "bad" : ""}`}><span className="muted small">YOU GET</span><p>{s.output}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>


      <section id="formulas" className="wrap" style={{ paddingBlock: "4rem" }}>
        <span className="eyebrow">The score, in simple maths</span>
        <h2 className="h2" style={{ margin: "1rem 0" }}>Which formulas we use</h2>
        <p className="lead" style={{ marginBottom: "2rem" }}>The job-fit score is plain arithmetic, not AI. Five parts, each from 0 to 100, are added up with weights. The weights depend on the scoring profile you pick.</p>

        <div className="card glow-line" data-reveal style={{ marginBottom: "1.6rem" }}>
          <span className="chip green">Standard profile</span>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", margin: "1rem 0 .4rem", lineHeight: 1.3, overflowWrap: "anywhere" }}>
            Score = <b className="grad-text">0.40</b>·Skills + <b className="grad-text">0.25</b>·Responsibilities + <b className="grad-text">0.15</b>·Experience + <b className="grad-text">0.10</b>·Evidence + <b className="grad-text">0.10</b>·Education
          </p>
          <p className="muted">If a part cannot be scored (for example, you did not enter your years), it is left out and the other weights are shared: <span className="mono">Score = Σ(weight × part) ÷ Σ(weights of scored parts)</span></p>
        </div>

        <div className="grid g3" data-reveal style={{ marginBottom: "1.6rem" }}>
          {FORMULAS.map((f) => (
            <div key={f.code} className="card">
              <div className="row between"><h3 className="h3">{f.name}</h3><span className="chip violet">{f.code}</span></div>
              <p style={{ margin: ".8rem 0" }}>{f.simple}</p>
              <p className="mono" style={{ padding: ".6rem .8rem", borderRadius: ".6rem", background: "rgba(255,255,255,.05)", overflowWrap: "anywhere" }}>{f.formula}</p>
              <p className="muted small" style={{ marginTop: ".7rem" }}><b>Example:</b> {f.example}</p>
            </div>
          ))}
          <div className="card">
            <h3 className="h3">How well is a skill proved?</h3>
            <p className="muted small" style={{ margin: ".5rem 0 1rem" }}>Every requirement gets a match value from the evidence in your resume.</p>
            <div className="stack" style={{ gap: ".5rem" }}>
              {MATCH_VALUES.map(([v, t]) => (
                <div key={v} className="row" style={{ gap: ".8rem" }}><span className="chip green" style={{ minWidth: "3rem", justifyContent: "center" }}>{v}</span><span>{t}</span></div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid g2" data-reveal>
          <div className="card flat">
            <h3 className="h3">Worked example</h3>
            <p className="muted small" style={{ margin: ".4rem 0 1rem" }}>A real run on a resume, Standard profile.</p>
            <div className="stack" style={{ gap: ".4rem" }}>
              {[["Skills", "91 × 0.40", "36.4"], ["Responsibilities", "92 × 0.25", "23.0"], ["Experience", "33 × 0.15", "5.0"], ["Evidence", "91 × 0.10", "9.1"], ["Education", "100 × 0.10", "10.0"]].map(([a, b, c]) => (
                <div key={a} className="row between"><span>{a}</span><span className="muted mono">{b}</span><b>{c}</b></div>
              ))}
              <div className="row between" style={{ borderTop: "1px solid var(--line)", paddingTop: ".6rem", marginTop: ".3rem" }}><b>Score</b><b className="grad-text" style={{ fontSize: "1.4rem" }}>≈ 84 / 100</b></div>
            </div>
          </div>
          <div className="card flat">
            <h3 className="h3">Scoring profiles</h3>
            <p className="muted small" style={{ margin: ".4rem 0 1rem" }}>Different roles weigh things differently. You choose the profile on the Score screen and the score updates instantly.</p>
            <div className="stack" style={{ gap: ".4rem" }}>
              <div className="row between small muted"><span style={{ flex: 1.4 }}>Profile</span><span style={{ flex: 1, textAlign: "right" }}>Skills / Resp. / Exp. / Evid. / Edu.</span></div>
              {PROFILE_TABLE.map(([n, k, j, e, q, a]) => (
                <div key={n} className="row between"><span style={{ flex: 1.4 }}>{n}</span><b className="mono" style={{ flex: 1, textAlign: "right" }}>{k} / {j} / {e} / {q} / {a}</b></div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid g3" data-reveal style={{ marginTop: "1.6rem" }}>
          <div className="card">
            <h3 className="h3">Eligibility is separate</h3>
            <p className="muted" style={{ marginTop: ".6rem" }}>A missing mandatory qualification is never hidden by other strengths. It shows as “needs review”, not a failed score. Missing from your resume does not mean you lack it: add proof or confirm it.</p>
          </div>
          <div className="card">
            <h3 className="h3">Checking the ranking: NDCG</h3>
            <p className="mono" style={{ margin: ".6rem 0", overflowWrap: "anywhere" }}>DCG = Σ (2^rel − 1) ÷ log₂(position + 1)     NDCG = DCG ÷ ideal DCG</p>
            <p className="muted">In simple words: did the best project come first? 100% means the order matches the reference ranking exactly. We use it to test the Project Selector.</p>
          </div>
          <div className="card">
            <h3 className="h3">An honest note</h3>
            <p className="muted" style={{ marginTop: ".6rem" }}>The weights are our own starting assumptions, inspired by general ATS ideas: weighted skill matching, required versus preferred, and eligibility kept apart. They are not any company&apos;s real formula, and should be validated with real data.</p>
          </div>
        </div>
      </section>

      <section id="ai" className="wrap" style={{ paddingBlock: "4rem" }}>
        <h2 className="h2" style={{ marginBottom: "1rem" }}>What is AI, and what is plain code?</h2>
        <p className="lead" style={{ marginBottom: "2rem" }}>Agents handle the language work. Everything that must be exact and repeatable is ordinary code. That is why the score never drifts and nothing is made up.</p>
        <div className="grid g2" data-reveal>
          <div className="card glow-line"><span className="chip violet">AI agents (Gemini)</span>
            <div className="stack" style={{ marginTop: "1.2rem" }}>{AI.map(([a, b]) => <div key={a}><b>{a}</b><div className="muted small">{b}</div></div>)}</div></div>
          <div className="card glow-line tone-blue"><span className="chip green">Plain code (no AI)</span>
            <div className="stack" style={{ marginTop: "1.2rem" }}>{CODE.map(([a, b]) => <div key={a}><b>{a}</b><div className="muted small">{b}</div></div>)}</div></div>
        </div>
        <p className="muted small" style={{ marginTop: "1.2rem" }}>If Gemini is busy or offline, each AI step falls back to rule-based code, and the screen tells you which path ran.</p>
      </section>

      <section id="trust" className="wrap" style={{ paddingBlock: "3rem 6rem" }}>
        <h2 className="h2" style={{ marginBottom: "2rem" }}>Why you can trust the result</h2>
        <div className="grid g4" data-reveal>
          {TRUST.map(([t, d]) => <div key={t} className="card"><h3 className="h3" style={{ marginBottom: ".7rem" }}>{t}</h3><p className="muted">{d}</p></div>)}
        </div>
        <div className="row wrapflex" style={{ gap: ".6rem", marginTop: "2.5rem" }} data-reveal>
          {["Next.js", "GSAP", "FastAPI", "PostgreSQL (Docker)", "CrewAI", "Google ADK", "Gemini", "RapidFuzz", "pdfplumber", "python-docx", "fpdf2", "GitHub REST API"].map((t) => <span key={t} className="chip" style={{ fontSize: ".95rem", padding: ".5rem 1rem" }}>{t}</span>)}
        </div>
        <div style={{ marginTop: "3rem" }}><Link href="/sources" className="btn primary">Open the app →</Link></div>
      </section>
    </div>
  );
}
