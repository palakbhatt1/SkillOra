// Data contracts & types for SkillOra.
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

// Clean initial sources & verified facts for Palak Bhatt
export const sources: Source[] = [
  {
    id: "src-1",
    name: "palakbhatt1/SkillOra",
    type: "github",
    detail: "GitHub repo · 12★ · Python / TypeScript",
    facts: 10,
    state: "synced",
    updated: "Just now",
  },
  {
    id: "src-2",
    name: "palakbhatt1/AntiSoch-AntiHarassment-App",
    type: "github",
    detail: "GitHub repo · 5★ · React Native / Python",
    facts: 7,
    state: "synced",
    updated: "Just now",
  },
];

export const initialFacts: Fact[] = [
  // SkillOra Project Facts
  {
    id: "F101",
    project: "SkillOra",
    source: "palakbhatt1/SkillOra",
    sourceType: "github",
    category: "experience",
    kind: "project",
    status: "verified",
    text: "SkillOra is an agentic resume intelligence system that eliminates LLM hallucination drift by anchoring tailored resume claims to an immutable, character-indexed SQLite Fact Ledger.",
    span: "SkillOra: an agentic resume intelligence system that eliminates LLM hallucination drift by anchoring tailored resume claims to an immutable, character-indexed SQLite Fact Ledger.",
  },
  {
    id: "F102",
    project: "SkillOra",
    source: "palakbhatt1/SkillOra",
    sourceType: "github",
    category: "experience",
    kind: "project",
    status: "verified",
    text: "Architected a dual-framework agentic pipeline using CrewAI for batch extraction/matching and Google ADK for live conversational tailoring.",
    span: "Architected a dual-framework agentic pipeline using CrewAI for batch extraction and Google ADK for live conversational tailoring.",
  },
  {
    id: "F103",
    project: "SkillOra",
    source: "palakbhatt1/SkillOra",
    sourceType: "github",
    category: "experience",
    kind: "project",
    status: "verified",
    text: "Implemented verifier_callback hooks to intercept and validate LLM bullet generation against verified fact citations before rendering.",
    span: "Implemented verifier_callback hooks to intercept and validate LLM bullet generation against verified fact citations.",
  },
  {
    id: "F104",
    project: "SkillOra",
    source: "palakbhatt1/SkillOra",
    sourceType: "github",
    category: "experience",
    kind: "project",
    status: "verified",
    text: "Developed Anthropic FastMCP server exposing 4 standardized tools for document parsing, ledger lookup, and ATS calculations.",
    span: "Developed Anthropic FastMCP server exposing 4 standardized tools for document parsing, ledger lookup, and ATS calculations.",
  },
  {
    id: "F105",
    project: "SkillOra",
    source: "palakbhatt1/SkillOra",
    sourceType: "github",
    category: "metric",
    kind: "project",
    status: "verified",
    text: "Achieved 100% Fact Recall and 100% Citation Span Validity on CSE3101 gold-standard benchmark datasets.",
    span: "Achieved 100% Fact Recall and 100% Citation Span Validity on gold-standard benchmark datasets.",
  },
  {
    id: "F106",
    project: "SkillOra",
    source: "palakbhatt1/SkillOra",
    sourceType: "github",
    category: "metric",
    kind: "project",
    status: "verified",
    text: "Reduced end-to-end resume tailoring latency from 40 minutes of manual drafting to under 2.5 seconds.",
    span: "Reduced end-to-end resume tailoring latency from 40 minutes to under 2.5 seconds.",
  },
  {
    id: "F107",
    project: "SkillOra",
    source: "palakbhatt1/SkillOra",
    sourceType: "github",
    category: "metric",
    kind: "project",
    status: "verified",
    text: "Blocked 32/32 (100%) adversarial fabricated claims containing unauthorized metrics or phantom skills.",
    span: "Blocked 32/32 (100%) adversarial fabricated claims containing unauthorized metrics.",
  },
  {
    id: "F108",
    project: "SkillOra",
    source: "palakbhatt1/SkillOra",
    sourceType: "github",
    category: "skill",
    kind: "project",
    status: "verified",
    text: "Next.js 15, React 19, TypeScript, and Tailwind CSS v4 for reactive glassmorphism frontend interface.",
    span: "Next.js 15, React 19, TypeScript, and Tailwind CSS v4",
  },
  {
    id: "F109",
    project: "SkillOra",
    source: "palakbhatt1/SkillOra",
    sourceType: "github",
    category: "skill",
    kind: "project",
    status: "verified",
    text: "FastAPI, Python 3.11, Uvicorn, and SQLAlchemy ORM with SQLite and PostgreSQL databases.",
    span: "FastAPI, Python 3.11, Uvicorn, and SQLAlchemy ORM with SQLite",
  },
  {
    id: "F110",
    project: "SkillOra",
    source: "palakbhatt1/SkillOra",
    sourceType: "github",
    category: "skill",
    kind: "project",
    status: "verified",
    text: "CrewAI Flows, Google ADK (Agent Development Kit), Anthropic FastMCP, and Docker multi-container compose.",
    span: "CrewAI Flows, Google ADK, Anthropic FastMCP, and Docker",
  },

  // AntiSoch Project Facts
  {
    id: "F111",
    project: "AntiSoch",
    source: "palakbhatt1/AntiSoch-AntiHarassment-App",
    sourceType: "github",
    category: "experience",
    kind: "project",
    status: "verified",
    text: "AntiSoch is a safety intelligence platform empowering users to document, report, and detect workplace and online harassment with tamper-proof evidence logs.",
    span: "AntiSoch is a safety intelligence platform empowering users to document and report harassment with tamper-proof evidence logs.",
  },
  {
    id: "F112",
    project: "AntiSoch",
    source: "palakbhatt1/AntiSoch-AntiHarassment-App",
    sourceType: "github",
    category: "experience",
    kind: "project",
    status: "verified",
    text: "Built encrypted incident logging system with location-stamped reports and multi-modal media attachment parsing.",
    span: "Built encrypted incident logging system with location-stamped reports and multi-modal attachments.",
  },
  {
    id: "F113",
    project: "AntiSoch",
    source: "palakbhatt1/AntiSoch-AntiHarassment-App",
    sourceType: "github",
    category: "experience",
    kind: "project",
    status: "verified",
    text: "Integrated NLP classification models to identify toxic speech and categorize severity levels in real time.",
    span: "Integrated NLP classification models to identify toxic speech and categorize severity levels.",
  },
  {
    id: "F114",
    project: "AntiSoch",
    source: "palakbhatt1/AntiSoch-AntiHarassment-App",
    sourceType: "github",
    category: "metric",
    kind: "project",
    status: "verified",
    text: "Processed over 5,000 incident reports with 99.4% uptime and under 250ms API response latency.",
    span: "Processed over 5,000 incident reports with 99.4% uptime and under 250ms latency.",
  },
  {
    id: "F115",
    project: "AntiSoch",
    source: "palakbhatt1/AntiSoch-AntiHarassment-App",
    sourceType: "github",
    category: "metric",
    kind: "project",
    status: "verified",
    text: "Achieved 94.2% precision in identifying toxic speech patterns across conversational text.",
    span: "Achieved 94.2% precision in identifying toxic speech patterns.",
  },
  {
    id: "F116",
    project: "AntiSoch",
    source: "palakbhatt1/AntiSoch-AntiHarassment-App",
    sourceType: "github",
    category: "skill",
    kind: "project",
    status: "verified",
    text: "React Native, Expo, Redux Toolkit, and Tailwind NativeWind for cross-platform mobile frontend.",
    span: "React Native, Expo, Redux Toolkit, and Tailwind",
  },
  {
    id: "F117",
    project: "AntiSoch",
    source: "palakbhatt1/AntiSoch-AntiHarassment-App",
    sourceType: "github",
    category: "skill",
    kind: "project",
    status: "verified",
    text: "Python, PyTorch, HuggingFace Transformers, PostgreSQL, and JWT authentication.",
    span: "Python, PyTorch, HuggingFace Transformers, PostgreSQL",
  },

  // Education Fact
  {
    id: "F118",
    project: "Education",
    source: "Academic Record",
    sourceType: "note",
    category: "education",
    kind: "education",
    status: "verified",
    text: "B.Tech in Computer Science and Engineering with specialization in Artificial Intelligence and Machine Learning (GPA 8.8/10.0).",
    span: "B.Tech in Computer Science and Engineering (AI/ML)",
  },
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
  title: "",
  company: "",
  seniority: "",
  keywords: [] as string[],
};

export const jobDescription = "";

export const requirements: Requirement[] = [];

export interface ProjectItem {
  id: string;
  name: string;
  reason: string;
  relevance: number;
  picked: boolean;
}

export const projects: ProjectItem[] = [];

export interface Bullet {
  id: string;
  project: string;
  text: string;
  facts: string[];
  verified: boolean;
  kind?: "role" | "project";
  user?: boolean;
  issues?: string[];
}

export const resumeSummary = "";

export const initialBullets: Bullet[] = [];

export interface Keyword {
  id: string;
  word: string;
  state: "suggested" | "gap" | "accepted" | "rejected";
  rewrite?: string;
  fact?: string;
  note: string;
}

export const initialKeywords: Keyword[] = [];

export const scoreComponents = [
  { key: "Skills match", value: 0, color: "var(--c-green)", weight: 40, why: "Awaiting job analysis." },
  { key: "Responsibility relevance", value: 0, color: "var(--c-blue)", weight: 25, why: "Awaiting job analysis." },
  { key: "Relevant experience", value: 0, color: "var(--c-violet)", weight: 15, why: "Awaiting job analysis." },
  { key: "Evidence quality", value: 0, color: "var(--c-amber)", weight: 10, why: "Awaiting job analysis." },
  { key: "Education", value: 0, color: "var(--c-rose)", weight: 10, why: "Awaiting job analysis." },
];

export const recommendations: { n: number; title: string; impact: string; detail: string }[] = [];

export const chatSeed: { from: string; text: string }[] = [];

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
