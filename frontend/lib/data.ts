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

// Clean initial sources (populated dynamically via API ingestion or file upload)
export const sources: Source[] = [];

// Clean initial facts (populated dynamically from sources)
export const initialFacts: Fact[] = [];

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
