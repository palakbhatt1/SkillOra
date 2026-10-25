// Demo dataset for SkillOra. Mirrors the schema in the synopsis:
// Fact { text, source link, cited span, project, status }.

export type FactStatus = "pending" | "verified" | "rejected" | "stale";

export interface Fact {
  id: string;
  text: string;
  project: string;
  source: string;
  sourceType: "github" | "pdf" | "docx" | "note";
  span: string;
  status: FactStatus;
  category: "skill" | "metric" | "experience" | "education";
  declared?: boolean;
  auto?: boolean;
  kind?: "project" | "role" | "education" | "other";
}

export interface Source {
  id: string;
  name: string;
  type: "github" | "pdf" | "docx" | "pptx" | "note";
  detail: string;
  facts: number;
  state: "synced" | "stale" | "processing";
  updated: string;
}

export const sources: Source[] = [
  { id: "s1", name: "harman/skillora-agents", type: "github", detail: "GitHub repo · 142 commits · Python", facts: 14, state: "synced", updated: "2 h ago" },
  { id: "s2", name: "Capstone-Report-Final.pdf", type: "pdf", detail: "PDF · 38 pages", facts: 11, state: "synced", updated: "Yesterday" },
  { id: "s3", name: "Internship-Summary.docx", type: "docx", detail: "DOCX · 4 pages", facts: 7, state: "stale", updated: "5 d ago" },
  { id: "s4", name: "Hackathon-Pitch.pptx", type: "pptx", detail: "PPTX · 18 slides", facts: 6, state: "synced", updated: "3 d ago" },
  { id: "s5", name: "Notes: Chatbot project", type: "note", detail: "Free-text note", facts: 4, state: "synced", updated: "1 w ago" },
];

export const initialFacts: Fact[] = [
  { id: "F101", text: "Built a multi-agent resume tailoring pipeline using CrewAI and Google ADK.", project: "SkillOra", source: "skillora-agents/README.md", sourceType: "github", span: "“SkillOra orchestrates CrewAI flows with Google ADK sub-agents…”", status: "verified", category: "experience" },
  { id: "F102", text: "Implemented a deterministic five-component job-fit scoring engine in plain Python.", project: "SkillOra", source: "skillora-agents/scoring/engine.py", sourceType: "github", span: "“def score(matches) -> JobFit: # five weighted components”", status: "verified", category: "skill" },
  { id: "F103", text: "Reduced resume tailoring time from ~40 minutes to under 3 minutes per application.", project: "SkillOra", source: "Capstone-Report-Final.pdf p.27", sourceType: "pdf", span: "“…average tailoring time dropped from 40 min to 2.8 min…”", status: "pending", category: "metric" },
  { id: "F104", text: "Used sentence-transformers and RapidFuzz for exact → fuzzy → embedding requirement matching.", project: "SkillOra", source: "skillora-agents/matcher/match.py", sourceType: "github", span: "“exact_match() → rapidfuzz.fuzz → cosine(embed(a), embed(b))”", status: "verified", category: "skill" },
  { id: "F105", text: "Served a FastAPI backend with SQLAlchemy and SQLite for the local-first fact ledger.", project: "SkillOra", source: "skillora-agents/api/main.py", sourceType: "github", span: "“app = FastAPI(); engine = create_engine('sqlite:///ledger.db')”", status: "verified", category: "skill" },
  { id: "F106", text: "Developed a LangChain chatbot answering student queries with 91% intent accuracy.", project: "Campus Chatbot", source: "Notes: Chatbot project", sourceType: "note", span: "“intent accuracy hit 91% on the 500-query test set”", status: "pending", category: "metric" },
  { id: "F107", text: "Deployed the chatbot on Hugging Face Spaces serving 300+ weekly users.", project: "Campus Chatbot", source: "Hackathon-Pitch.pptx slide 11", sourceType: "docx", span: "“300+ weekly active users after launch”", status: "pending", category: "metric" },
  { id: "F108", text: "Interned as a backend developer building REST APIs with Django and PostgreSQL.", project: "Internship", source: "Internship-Summary.docx", sourceType: "docx", span: "“Developed REST endpoints using Django REST Framework on PostgreSQL”", status: "stale", category: "experience" },
  { id: "F109", text: "Authored a Next.js dashboard with seven screens for the end-to-end workflow.", project: "SkillOra", source: "skillora-frontend/app", sourceType: "github", span: "“app/(app)/{sources,verify,job,tailor,score,export}”", status: "verified", category: "skill" },
  { id: "F110", text: "Won 2nd place at the university AI hackathon (48 teams).", project: "Hackathon", source: "Hackathon-Pitch.pptx slide 18", sourceType: "docx", span: "“Runner-up — 48 participating teams”", status: "pending", category: "experience" },
];

export interface Requirement {
  id: string;
  text: string;
  level: "must" | "nice";
  category: "skill" | "experience" | "education" | "other";
  match: "met" | "partial" | "missing";
  via: "exact" | "fuzzy" | "embedding" | "none";
  facts: string[];
  confidence: number;
}

export const jobMeta = {
  title: "Machine Learning Engineer",
  company: "Northwind AI",
  seniority: "0–2 years",
  keywords: ["Python", "LLM", "RAG", "LangChain", "FastAPI", "Docker", "PostgreSQL", "Vector DB", "CI/CD", "Evaluation"],
};

export const jobDescription = `Northwind AI is hiring a Machine Learning Engineer (0–2 yrs) to build LLM-powered agent products.

You will:
• Design and ship RAG and multi-agent workflows in Python
• Build APIs with FastAPI and persist data in PostgreSQL
• Evaluate model quality with automated test sets
• Containerise services with Docker and run CI/CD

Must have: Python, LLM application experience, FastAPI, REST APIs.
Nice to have: LangChain, vector databases, Docker, Kubernetes.`;

export const requirements: Requirement[] = [
  { id: "R1", text: "Python proficiency", level: "must", category: "skill", match: "met", via: "exact", facts: ["F101", "F102"], confidence: 0.98 },
  { id: "R2", text: "LLM application experience", level: "must", category: "experience", match: "met", via: "embedding", facts: ["F101", "F106"], confidence: 0.91 },
  { id: "R3", text: "FastAPI & REST APIs", level: "must", category: "skill", match: "met", via: "exact", facts: ["F105", "F108"], confidence: 0.95 },
  { id: "R4", text: "Multi-agent / RAG workflows", level: "must", category: "experience", match: "partial", via: "fuzzy", facts: ["F101"], confidence: 0.72 },
  { id: "R5", text: "PostgreSQL", level: "must", category: "skill", match: "partial", via: "exact", facts: ["F108"], confidence: 0.64 },
  { id: "R6", text: "Automated model evaluation", level: "must", category: "experience", match: "partial", via: "embedding", facts: ["F103"], confidence: 0.58 },
  { id: "R7", text: "LangChain", level: "nice", category: "skill", match: "met", via: "exact", facts: ["F106"], confidence: 0.93 },
  { id: "R8", text: "Vector databases", level: "nice", category: "skill", match: "partial", via: "embedding", facts: ["F104"], confidence: 0.55 },
  { id: "R9", text: "Docker", level: "nice", category: "skill", match: "missing", via: "none", facts: [], confidence: 0 },
  { id: "R10", text: "Kubernetes", level: "nice", category: "skill", match: "missing", via: "none", facts: [], confidence: 0 },
  { id: "R11", text: "B.Tech / B.E. in CS or related", level: "must", category: "education", match: "met", via: "exact", facts: [], confidence: 1 },
];

export const projects = [
  { id: "P1", name: "SkillOra — Agentic Resume Platform", reason: "Directly matches multi-agent, LLM and FastAPI requirements.", relevance: 96, picked: true },
  { id: "P2", name: "Campus Chatbot (LangChain)", reason: "Shows LangChain + deployed LLM app with measurable users.", relevance: 84, picked: true },
  { id: "P3", name: "Backend Internship — Django/PostgreSQL", reason: "Only evidence of PostgreSQL and production REST APIs.", relevance: 71, picked: true },
  { id: "P4", name: "Hackathon: Smart Attendance (OpenCV)", reason: "Computer vision — low task relevance for this role.", relevance: 32, picked: false },
];

export interface Bullet {
  id: string;
  project: string;
  text: string;
  facts: string[];
  verified: boolean;
}

export const resumeSummary =
  "Early-career ML engineer who builds verifiable multi-agent LLM products in Python, with hands-on FastAPI, LangChain and PostgreSQL experience.";

export const initialBullets: Bullet[] = [
  { id: "B1", project: "SkillOra", text: "Built a multi-agent resume tailoring pipeline using CrewAI and Google ADK, with a Verifier agent blocking unsupported claims.", facts: ["F101"], verified: true },
  { id: "B2", project: "SkillOra", text: "Implemented a deterministic five-component job-fit scoring engine in Python so scores stay stable across runs.", facts: ["F102"], verified: true },
  { id: "B3", project: "SkillOra", text: "Matched JD requirements to a fact ledger using exact, fuzzy and embedding similarity (RapidFuzz + sentence-transformers).", facts: ["F104"], verified: true },
  { id: "B4", project: "Campus Chatbot", text: "Developed a LangChain chatbot for student queries reaching 91% intent accuracy on a 500-query test set.", facts: ["F106"], verified: true },
  { id: "B5", project: "Backend Internship", text: "Developed REST endpoints with Django REST Framework on PostgreSQL.", facts: ["F108"], verified: true },
];

export interface Keyword {
  id: string;
  word: string;
  state: "suggested" | "gap" | "accepted" | "rejected";
  rewrite?: string;
  fact?: string;
  note: string;
}

export const initialKeywords: Keyword[] = [
  { id: "K1", word: "RAG", state: "suggested", rewrite: "Matched JD requirements to a fact ledger using retrieval (embedding similarity) over verified project facts — a RAG-style grounding loop.", fact: "F104", note: "Grounded in F104 (embedding matcher)." },
  { id: "K2", word: "PostgreSQL", state: "suggested", rewrite: "Developed REST endpoints with Django REST Framework on PostgreSQL.", fact: "F108", note: "Already supported by F108 — surfaced in the summary." },
  { id: "K3", word: "Evaluation", state: "suggested", rewrite: "Validated the platform against an evaluation set covering extraction accuracy, matching quality and score stability.", fact: "F103", note: "Grounded in F103 (capstone report evaluation)." },
  { id: "K4", word: "Docker", state: "gap", note: "No fact supports Docker. Add a source or leave it out — SkillOra will not invent it." },
  { id: "K5", word: "Kubernetes", state: "gap", note: "Genuine gap. Consider a project that uses it." },
];

export const scoreComponents = [
  { key: "Skills match", value: 87, color: "var(--c-green)", weight: 40, why: "Required skills mostly evidenced; preferred skills partly." },
  { key: "Responsibility relevance", value: 89, color: "var(--c-blue)", weight: 25, why: "Your projects show comparable work to the job's duties." },
  { key: "Relevant experience", value: 50, color: "var(--c-violet)", weight: 15, why: "1 relevant year vs 2 asked for." },
  { key: "Evidence quality", value: 80, color: "var(--c-amber)", weight: 10, why: "Bullets name tools, show ownership and cite verified sources." },
  { key: "Education", value: 90, color: "var(--c-rose)", weight: 10, why: "Required degree matched." },
];

export const recommendations = [
  { n: 1, title: "Verify the 3 pending metric facts", impact: "+4", detail: "F103, F106 and F107 hold your strongest numbers but are unverified, so they can’t be used." },
  { n: 2, title: "Add a Docker source", impact: "+3", detail: "Upload a Dockerfile or repo that containerises a service — the JD lists Docker as nice-to-have and CI/CD in duties." },
  { n: 3, title: "Accept the “RAG” grounded rewrite", impact: "+2", detail: "A fact already supports it; accepting lifts requirement R4 from partial to met." },
];

export const chatSeed = [
  { from: "agent", text: "I selected 3 projects for Northwind AI. Want me to lead with SkillOra?" },
  { from: "user", text: "Yes, and make the summary mention LangChain." },
  { from: "agent", text: "Done — summary updated using F106. Verifier passed all 5 bullets." },
];

export const agents = [
  { name: "Source Extractor", fw: "CrewAI", role: "Turns parsed chunks into candidate facts, each with a quoted source span.", tone: "green" },
  { name: "JD Analyzer", fw: "CrewAI", role: "Structures a job description into must / nice-have requirements and keywords.", tone: "green" },
  { name: "Matcher", fw: "CrewAI", role: "Links requirements to facts: exact → fuzzy → embedding. Labels met / partial / missing.", tone: "green" },
  { name: "Coordinator", fw: "Google ADK", role: "Runs the interactive chat session, holds state, delegates to sub-agents.", tone: "violet" },
  { name: "Project Selector", fw: "Google ADK", role: "Picks projects by task relevance — with a one-line reason each.", tone: "violet" },
  { name: "Resume Writer", fw: "Google ADK", role: "Writes bullets and a summary line using fact IDs only.", tone: "violet" },
  { name: "Verifier", fw: "ADK callback", role: "Blocks any claim not supported by its cited span. Number, tech and entailment checks.", tone: "rose" },
  { name: "Keyword Coach", fw: "Matcher + Writer", role: "Proposes grounded rewrites for missing keywords — or surfaces a genuine gap.", tone: "amber" },
  { name: "Scoring Engine", fw: "Plain Python", role: "Deterministic five-component score — code, not an LLM, so it never drifts.", tone: "blue" },
] as const;

export const team = [
  { name: "Palak Bhatt", id: "230839", role: "Resume Tailoring Engine + Keyword Coach, entire Next.js frontend" },
  { name: "Manya Agarwal", id: "230811", role: "Profile Builder — parsers, Source Extractor, fact ledger, verification API" },
  { name: "Vanshik Soni", id: "230887", role: "JD Analyzer & Matcher — structured requirements, exact→fuzzy→embedding" },
  { name: "Harman Singh Kanwar", id: "230656", role: "Explainable Scoring & Export — scoring engine, PDF/DOCX, fabrication metric" },
];

export const timeline = [
  { when: "Sept · wk 3", title: "Problem & Design", out: "Charter, fact-ledger schema, CrewAI + ADK set up" },
  { when: "Late Sept – Oct", title: "Development", out: "Ingestion, JD Analyzer, Matcher, score core, Phase-2 demo" },
  { when: "Nov · wk 1–2", title: "Integration & Testing", out: "Writer + Verifier, edit/re-score loop, end-to-end" },
  { when: "Nov · wk 2–3", title: "Evaluation & UI", out: "Eval set run, all 7 screens polished" },
  { when: "Nov · wk 3", title: "Deployment", out: "Docker Compose, hosted Postgres, public URL" },
  { when: "Nov · last wk", title: "Final Demo", out: "Report, repo, presentation, viva-ready" },
];

export const evalMetrics = [
  { label: "Fact-extraction accuracy", value: 94, suffix: "%", owner: "Manya" },
  { label: "Requirement-matching quality", value: 89, suffix: "%", owner: "Vanshik" },
  { label: "Score stability (same input)", value: 100, suffix: "%", owner: "Harman" },
  { label: "Fabrication catch rate", value: 97, suffix: "%", owner: "Palak" },
];
