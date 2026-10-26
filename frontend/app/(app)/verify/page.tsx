"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Fact, FactStatus } from "@/lib/data";

// ============================================================================
// MINIMALIST SVG ICONS (Zero Emojis)
// ============================================================================

function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconClose({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function IconEdit({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function IconGithub({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function IconCode({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function IconDocument({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconChart({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IconAcademic({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
    </svg>
  );
}

function IconBolt({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function IconFolder({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function IconArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function IconArrowLeft({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function IconPlus({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function IconShield({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconUndo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2m-15-7l4-4m-4 4l4 4" />
    </svg>
  );
}

// Helper to extract clean tech chips from tech-stack facts
function parseTechTokens(facts: Fact[]): string[] {
  const tokens = new Set<string>();
  facts.forEach((f) => {
    const cleaned = f.text
      .replace(/^Tech stack:\s*/i, "")
      .replace(/\s+for\s+.*$/i, "");
    const parts = cleaned.split(/[,;•\n]|(?:\s+and\s+)/);
    parts.forEach((p) => {
      const trimmed = p.trim().replace(/^\W+|\W+$/g, "");
      if (trimmed.length > 1 && trimmed.length < 35 && !trimmed.toLowerCase().startsWith("for ")) {
        tokens.add(trimmed);
      }
    });
  });
  return Array.from(tokens);
}

type Tab = "all" | "review" | FactStatus;
const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All Facts" },
  { id: "review", label: "Needs Review" },
  { id: "verified", label: "Verified" },
  { id: "pending", label: "Pending" },
  { id: "stale", label: "Stale" },
  { id: "rejected", label: "Rejected" },
];

const matches = (f: Fact, t: Tab) => {
  if (t === "all") return true;
  if (t === "review") return f.status === "pending" || f.status === "stale";
  return f.status === t;
};

export default function VerifyPage() {
  const {
    facts,
    setFactStatus,
    editFact,
    deleteFact,
    createFact,
    verifyProject,
    unverifyProject,
    deleteProject,
    declareSkill,
    confirmGroup,
    live,
    addNote,
  } = useStore();

  const [tab, setTab] = useState<Tab>("all");
  const [newSkill, setNewSkill] = useState("");

  // Square cards: active project for modal inspection
  const [activeModalProjectName, setActiveModalProjectName] = useState<string | null>(null);

  // Form Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetProject, setTargetProject] = useState<string>("");

  // Inline section additions inside Inspection Modal
  const [newFeatureText, setNewFeatureText] = useState("");
  const [newMetricText, setNewMetricText] = useState("");
  const [newTechText, setNewTechText] = useState("");
  const [newDescText, setNewDescText] = useState("");
  const [showAddDescInput, setShowAddDescInput] = useState(false);

  // Inline editing state inside Inspection Modal
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [editingFactText, setEditingFactText] = useState("");

  // Form Fields for Add Project
  const [newProjName, setNewProjName] = useState("");
  const [newProjOverview, setNewProjOverview] = useState("");
  const [newProjFeatures, setNewProjFeatures] = useState("");
  const [newProjMetrics, setNewProjMetrics] = useState("");
  const [newProjTech, setNewProjTech] = useState("");

  // Form Fields for Edit Project
  const [editProjName, setEditProjName] = useState("");
  const [editProjOverview, setEditProjOverview] = useState("");

  // Local facts state override for custom project adds/deletes
  const [customFacts, setCustomFacts] = useState<Fact[]>([]);

  const effectiveFacts = useMemo(() => {
    const map = new Map<string, Fact>();
    facts.forEach((f) => map.set(f.id, f));
    customFacts.forEach((f) => map.set(f.id, f));
    return Array.from(map.values());
  }, [facts, customFacts]);

  const pendingCount = effectiveFacts.filter((f) => f.status === "pending").length;
  const verifiedCount = effectiveFacts.filter((f) => f.status === "verified").length;
  const pct = effectiveFacts.length ? Math.round((verifiedCount / effectiveFacts.length) * 100) : 0;

  const filteredFacts = useMemo(() => {
    return effectiveFacts.filter((f) => matches(f, tab));
  }, [effectiveFacts, tab]);

  // Group facts by project
  const projectGroups = useMemo(() => {
    const map = new Map<string, Fact[]>();
    filteredFacts.forEach((f) => {
      const p = f.project || "General";
      map.set(p, [...(map.get(p) ?? []), f]);
    });
    return [...map.entries()];
  }, [filteredFacts]);

  // Unified Project Card Items (derived in real time)
  const projectCardItems = useMemo(() => {
    return projectGroups.map(([projName, groupFacts]) => {
      const isEducation = projName.toLowerCase() === "education";
      const verifiedList = groupFacts.filter((f) => f.status === "verified");
      const isVerified = groupFacts.length > 0 && verifiedList.length === groupFacts.length;
      const sourceType =
        groupFacts[0]?.sourceType || (groupFacts[0]?.source?.includes("/") ? "github" : "manual");
      const source = groupFacts[0]?.source || "Verified Source";

      const introFact =
        groupFacts.find(
          (f) =>
            f.category === "experience" &&
            (f.text.toLowerCase().includes("is an") ||
              f.text.toLowerCase().includes("is a") ||
              f.text.toLowerCase().includes("platform") ||
              f.text.toLowerCase().includes("system") ||
              f.text.toLowerCase().includes("application"))
        ) || groupFacts.find((f) => f.category === "experience");

      const coreFeatures = groupFacts.filter(
        (f) => f.category === "experience" && f.id !== introFact?.id
      );

      const resultsAndMetrics = groupFacts.filter(
        (f) =>
          f.category === "metric" ||
          (f.category !== "education" &&
            f.category !== "skill" &&
            /\d+/.test(f.text) &&
            f.id !== introFact?.id)
      );

      const techStackFacts = groupFacts.filter((f) => f.category === "skill");
      const techChips = parseTechTokens(techStackFacts);

      return {
        name: projName,
        isEducation,
        source,
        sourceType,
        facts: groupFacts,
        verifiedCount: verifiedList.length,
        totalCount: groupFacts.length,
        isVerified,
        techChips,
        introFact,
        coreFeatures,
        resultsAndMetrics,
        techStackFacts,
      };
    });
  }, [projectGroups]);

  // Currently active modal project
  const activeModalProject = useMemo(() => {
    if (!activeModalProjectName) return null;
    return (
      projectCardItems.find(
        (p) => p.name.toLowerCase() === activeModalProjectName.toLowerCase()
      ) || null
    );
  }, [projectCardItems, activeModalProjectName]);

  // Project-level Verification Toggle
  const handleToggleProjectVerify = async (projectName: string, isCurrentlyVerified: boolean) => {
    if (isCurrentlyVerified) {
      await unverifyProject(projectName);
      setCustomFacts((prev) =>
        prev.map((f) => (f.project === projectName ? { ...f, status: "pending" } : f))
      );
    } else {
      await verifyProject(projectName);
      setCustomFacts((prev) =>
        prev.map((f) => (f.project === projectName ? { ...f, status: "verified" } : f))
      );
    }
  };

  // Delete Project Card
  const handleDeleteProject = async (projectName: string) => {
    await deleteProject(projectName);
    setCustomFacts((prev) => prev.filter((f) => f.project !== projectName));
    if (activeModalProjectName === projectName) {
      setActiveModalProjectName(null);
    }
  };

  // Add Feature to project
  const handleAddFeature = async (projectName: string) => {
    if (!newFeatureText.trim()) return;
    await createFact({
      project: projectName,
      category: "experience",
      status: "verified",
      text: newFeatureText.trim(),
    });
    setNewFeatureText("");
  };

  // Add Metric to project
  const handleAddMetric = async (projectName: string) => {
    if (!newMetricText.trim()) return;
    await createFact({
      project: projectName,
      category: "metric",
      status: "verified",
      text: newMetricText.trim(),
    });
    setNewMetricText("");
  };

  // Add Tech token to project
  const handleAddTech = async (projectName: string) => {
    if (!newTechText.trim()) return;
    await createFact({
      project: projectName,
      category: "skill",
      status: "verified",
      text: `Tech stack: ${newTechText.trim()}`,
    });
    setNewTechText("");
  };

  // Add Description to project
  const handleAddDescription = async (projectName: string) => {
    if (!newDescText.trim()) return;
    await createFact({
      project: projectName,
      category: "experience",
      status: "verified",
      text: newDescText.trim(),
    });
    setNewDescText("");
    setShowAddDescInput(false);
  };

  // Save inline fact edit
  const handleSaveInlineFact = async (id: string) => {
    if (!editingFactText.trim()) return;
    await editFact(id, editingFactText.trim());
    setCustomFacts((prev) =>
      prev.map((f) => (f.id === id ? { ...f, text: editingFactText.trim(), status: "verified" } : f))
    );
    setEditingFactId(null);
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    await declareSkill(newSkill.trim());
    setNewSkill("");
  };

  // Open Edit Modal for a project
  const handleOpenEditProject = (projName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetProject(projName);
    setEditProjName(projName);
    const item = projectCardItems.find((p) => p.name === projName);
    setEditProjOverview(item?.introFact ? item.introFact.text : "");
    setShowEditModal(true);
  };

  // Save Project Edit
  const handleSaveProjectEdit = () => {
    if (!editProjName.trim()) return;
    const oldName = targetProject;
    const newName = editProjName.trim();
    setCustomFacts((prev) =>
      prev.map((f) => {
        if (f.project === oldName) {
          const updated = { ...f, project: newName };
          if (editProjOverview.trim() && f.category === "experience") {
            updated.text = editProjOverview.trim();
          }
          return updated;
        }
        return f;
      })
    );
    effectiveFacts.forEach((f) => {
      if (f.project === oldName) {
        f.project = newName;
      }
    });
    setShowEditModal(false);
  };

  // Open Delete Modal for a project
  const handleOpenDeleteProject = (projName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetProject(projName);
    setShowDeleteModal(true);
  };

  // Confirm Project Delete
  const handleConfirmDelete = async () => {
    await handleDeleteProject(targetProject);
    setShowDeleteModal(false);
  };

  // Handle Add New Project
  const handleCreateProject = async () => {
    if (!newProjName.trim()) return;
    const projName = newProjName.trim();
    const now = Date.now();
    const newFactsToAdd: Fact[] = [];

    // 1. Overview / Intro Fact
    if (newProjOverview.trim()) {
      newFactsToAdd.push({
        id: `F${now}-1`,
        project: projName,
        source: `${projName} Spec`,
        sourceType: "note",
        category: "experience",
        kind: "project",
        status: "verified",
        text: newProjOverview.trim(),
        span: newProjOverview.trim(),
      });
    }

    // 2. Core Features
    if (newProjFeatures.trim()) {
      const featureLines = newProjFeatures
        .split("\n")
        .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
        .filter((l) => l.length > 0);
      featureLines.forEach((feat, idx) => {
        newFactsToAdd.push({
          id: `F${now}-F${idx + 1}`,
          project: projName,
          source: `${projName} Features`,
          sourceType: "note",
          category: "experience",
          kind: "project",
          status: "verified",
          text: feat,
          span: feat,
        });
      });
    }

    // 3. Results & Metrics
    if (newProjMetrics.trim()) {
      const metricLines = newProjMetrics
        .split("\n")
        .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
        .filter((l) => l.length > 0);
      metricLines.forEach((met, idx) => {
        newFactsToAdd.push({
          id: `F${now}-M${idx + 1}`,
          project: projName,
          source: `${projName} Metrics`,
          sourceType: "note",
          category: "metric",
          kind: "project",
          status: "verified",
          text: met,
          span: met,
        });
      });
    }

    // 4. Tech Stack
    if (newProjTech.trim()) {
      newFactsToAdd.push({
        id: `F${now}-T1`,
        project: projName,
        source: `${projName} Tech Stack`,
        sourceType: "note",
        category: "skill",
        kind: "project",
        status: "verified",
        text: `Tech stack: ${newProjTech.trim()}`,
        span: newProjTech.trim(),
      });
    }

    setCustomFacts((prev) => [...prev, ...newFactsToAdd]);

    if (live) {
      try {
        await addNote(
          projName,
          `${projName}: ${newProjOverview}\n\nFeatures:\n${newProjFeatures}\n\nMetrics:\n${newProjMetrics}\n\nTech Stack:\n${newProjTech}`
        );
      } catch {}
    }

    // Reset Form
    setNewProjName("");
    setNewProjOverview("");
    setNewProjFeatures("");
    setNewProjMetrics("");
    setNewProjTech("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Technical Demonstration View Banner */}
      <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#DDD7CA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#EAF4EB] text-[#1E6B38] flex items-center justify-center shrink-0">
            <IconShield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#141A16]">
                System Architecture &amp; Verification: Fact Ledger Engine
              </span>
              <span className="text-[10px] font-bold text-[#1E6B38] bg-[#EAF4EB] px-2 py-0.5 rounded-full border border-[#C5E1CB]">
                SQLite Ledger · Zero Hallucination
              </span>
            </div>
            <p className="text-[#556056] text-[11px] mt-0.5">
              Active Agents: Deterministic Fact Ledger &amp; ADK Callback Verifier (character-offset spans &amp; human-in-the-loop review).
            </p>
          </div>
        </div>

        <Link
          href="/job"
          className="px-3.5 py-1.5 bg-white hover:bg-[#FAF9F5] text-[#1E6B38] border border-[#C5E1CB] font-bold text-xs rounded-full shadow-2xs transition-all shrink-0 self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
        >
          <IconArrowLeft className="w-3.5 h-3.5" />
          <span>Back to User Workflow</span>
        </Link>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E6B38] bg-[#EAF4EB] px-2.5 py-0.5 rounded-full border border-[#C5E1CB]">
              Grounding &amp; Verification Engine
            </span>
            <span className="text-xs text-[#78827A]">Interactive Fact Ledger &amp; Project Cards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141A16] tracking-tight">
            Verify Fact Ledger
          </h1>
          <p className="text-sm text-[#556056] max-w-2xl leading-relaxed">
            Candidate projects extracted from verified codebases and documentation. Click any project card to inspect, verify, and edit its four resume sections.
          </p>
        </div>

        <Link
          href="/job"
          className="px-6 py-2.5 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>Return to Match &amp; Score</span>
          <IconArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Progress & Verification Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#ECE7DD] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 max-w-lg">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#141A16]">
              <span>Grounding Ledger Health</span>
              <span className="text-[#1E6B38] font-mono">
                {verifiedCount} of {effectiveFacts.length} Verified ({pct}%)
              </span>
            </div>

            <div className="w-full h-2.5 bg-[#FAF7F0] border border-[#ECE7DD] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2E9B4E] to-[#1E6B38] rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="text-xs text-[#78827A]">
              {effectiveFacts.length === 0 ? (
                <span>Ledger is empty. Ingest experience sources in Stage 1 or click + Add Project below.</span>
              ) : pendingCount > 0 ? (
                <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                  <span>{pendingCount} claims await your review before resume tailoring.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[#1E6B38] font-semibold">
                  <IconCheck className="w-3.5 h-3.5" />
                  <span>All project facts and tech stacks are verified and ready for tailoring.</span>
                </div>
              )}
            </div>
          </div>

          {pendingCount > 0 && (
            <button
              onClick={() => confirmGroup(null)}
              className="px-4 py-2 bg-[#EAF4EB] hover:bg-[#D5EED8] text-[#1E6B38] border border-[#C5E1CB] rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer self-start sm:self-center flex items-center gap-1.5"
            >
              <IconCheck className="w-3.5 h-3.5" />
              <span>Verify All {pendingCount} Pending Claims</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Add Custom Skill Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((t) => {
            const count = effectiveFacts.filter((f) => matches(f, t.id)).length;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1E6B38] text-white shadow-sm"
                    : "bg-white text-[#556056] border border-[#ECE7DD] hover:bg-[#FAF9F5]"
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Add Custom Skill */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            placeholder="+ Declare custom skill"
            className="h-8 px-3 rounded-lg border border-[#E5E1D5] bg-white text-xs text-[#141A16] placeholder:text-[#9DA69E] focus:outline-none focus:border-[#1E6B38]"
          />
          <button
            onClick={handleAddSkill}
            disabled={!newSkill.trim()}
            className="h-8 px-3 rounded-lg bg-[#1E6B38] hover:bg-[#16532B] disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* Section Header: Square Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <IconFolder className="w-4 h-4 text-[#1E6B38]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141A16]">
              Project Cards ({projectCardItems.length} Projects)
            </h3>
          </div>
          <span className="text-xs text-[#78827A]">
            Click any card to inspect &amp; verify
          </span>
        </div>

        {/* ================================================================= */}
        {/* SQUARE CARDS GRID (aspect-square)                                 */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {projectCardItems.map((project) => (
            <div
              key={project.name}
              onClick={() => setActiveModalProjectName(project.name)}
              className="aspect-square p-5 rounded-2xl bg-white border border-[#ECE7DD] shadow-2xs hover:shadow-lg hover:border-[#1E6B38] transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              {/* Top row: Icon & Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#DDD7CA] group-hover:border-[#C5E1CB] group-hover:bg-[#EAF4EB] text-[#556056] group-hover:text-[#1E6B38] flex items-center justify-center transition-colors shrink-0">
                  {project.sourceType === "github" ? (
                    <IconGithub className="w-5 h-5" />
                  ) : project.isEducation ? (
                    <IconAcademic className="w-5 h-5" />
                  ) : (
                    <IconCode className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shadow-2xs ${
                    project.isVerified
                      ? "bg-[#EAF4EB] text-[#1E6B38] border-[#C5E1CB]"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      project.isVerified ? "bg-[#1E6B38]" : "bg-amber-600"
                    }`}
                  />
                  <span>{project.isVerified ? "Verified" : "Needs Review"}</span>
                </span>
              </div>

              {/* Middle: Project Name, Source, Tech Badges */}
              <div className="my-auto py-2 space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-[#141A16] group-hover:text-[#1E6B38] transition-colors line-clamp-1">
                  {project.name}
                </h3>
                <p className="text-xs text-[#78827A] truncate font-medium">
                  {project.source}
                </p>

                {/* Quick Tech Stack preview */}
                {project.techChips.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {project.techChips.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAF9F5] border border-[#ECE7DD] text-[#556056]"
                      >
                        {t}
                      </span>
                    ))}
                    {project.techChips.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAF9F5] text-[#78827A]">
                        +{project.techChips.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom row: Claims count & quick buttons */}
              <div className="pt-3 border-t border-[#ECE7DD] flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#78827A]">
                  {project.verifiedCount} / {project.totalCount} claims
                </span>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleProjectVerify(project.name, project.isVerified)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      project.isVerified
                        ? "bg-[#FAF9F5] hover:bg-[#ECE7DD] text-[#556056] border-[#DDD7CA]"
                        : "bg-[#1E6B38] hover:bg-[#16532B] text-white border-[#1E6B38] shadow-2xs"
                    }`}
                    title={project.isVerified ? "Mark pending" : "Verify all claims in project"}
                  >
                    {project.isVerified ? (
                      <IconUndo className="w-3.5 h-3.5" />
                    ) : (
                      <IconCheck className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleOpenDeleteProject(project.name, e)}
                    className="p-1.5 rounded-lg border border-[#DDD7CA] hover:border-rose-200 text-[#78827A] hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    title={`Delete ${project.name}`}
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalProjectName(project.name)}
                    className="px-2.5 py-1 rounded-lg bg-[#EAF4EB] text-[#1E6B38] border border-[#C5E1CB] hover:bg-[#D5EBD7] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Inspect 4 resume sections"
                  >
                    <span>Inspect</span>
                    <IconArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* "+ Add Project" Square Card */}
          <div
            onClick={() => setShowAddModal(true)}
            className="aspect-square p-5 rounded-2xl border-2 border-dashed border-[#D4CFC2] hover:border-[#1E6B38] bg-[#FAF9F6] hover:bg-white text-center cursor-pointer transition-all flex flex-col items-center justify-center group shadow-xs"
          >
            <div className="w-12 h-12 rounded-full bg-white group-hover:bg-[#EAF4EB] border border-[#D4CFC2] group-hover:border-[#C5E1CB] flex items-center justify-center text-[#556056] group-hover:text-[#1E6B38] mb-3 transition-all shadow-2xs">
              <IconPlus className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#141A16] group-hover:text-[#1E6B38] transition-colors">
              Add New Project
            </h4>
            <p className="text-[11px] text-[#78827A] mt-1 max-w-[160px] leading-tight">
              Define a new project and catalog its verified claims
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* PROJECT INSPECTION & VERIFICATION MODAL                             */}
      {/* =================================================================== */}
      {activeModalProject && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setActiveModalProjectName(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#ECE7DD] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-[#141A16]"
          >
            {/* Modal Top Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#ECE7DD]">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF4EB] border border-[#C5E1CB] text-[#1E6B38] flex items-center justify-center shrink-0">
                  {activeModalProject.sourceType === "github" ? (
                    <IconGithub className="w-6 h-6" />
                  ) : activeModalProject.isEducation ? (
                    <IconAcademic className="w-6 h-6" />
                  ) : (
                    <IconCode className="w-6 h-6" />
                  )}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#141A16] tracking-tight">
                      {activeModalProject.name}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${
                        activeModalProject.isVerified
                          ? "bg-[#EAF4EB] text-[#1E6B38] border-[#C5E1CB]"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          activeModalProject.isVerified ? "bg-[#1E6B38]" : "bg-amber-600"
                        }`}
                      />
                      <span>
                        {activeModalProject.isVerified ? "Verified" : "Needs Review"}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-[#78827A] flex items-center gap-1.5 truncate">
                    <span>Source:</span>
                    <span className="font-medium text-[#556056]">
                      {activeModalProject.source}
                    </span>
                    <span>·</span>
                    <span>
                      {activeModalProject.verifiedCount} / {activeModalProject.totalCount} claims verified
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Controls & Close */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleToggleProjectVerify(
                      activeModalProject.name,
                      activeModalProject.isVerified
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    activeModalProject.isVerified
                      ? "bg-[#FAF9F5] hover:bg-[#ECE7DD] text-[#556056] border border-[#DDD7CA]"
                      : "bg-[#1E6B38] hover:bg-[#16532B] text-white shadow-xs"
                  }`}
                >
                  {activeModalProject.isVerified ? (
                    <>
                      <IconUndo className="w-3.5 h-3.5" />
                      <span>Mark Pending</span>
                    </>
                  ) : (
                    <>
                      <IconCheck className="w-3.5 h-3.5" />
                      <span>Verify Project</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteProject(activeModalProject.name)}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-[#DDD7CA] hover:border-rose-200 text-[#78827A] hover:text-rose-600 transition-all cursor-pointer"
                  title={`Delete ${activeModalProject.name}`}
                >
                  <IconTrash className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalProjectName(null)}
                  className="p-2 rounded-xl bg-[#FAF9F5] hover:bg-[#ECE7DD] text-[#556056] border border-[#DDD7CA] transition-all cursor-pointer"
                  title="Close"
                >
                  <IconClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: The 4 Core Resume Sections */}
            <div className="space-y-6 divide-y divide-[#ECE7DD]">
              {/* ----------------------------------------------------------- */}
              {/* SECTION 1: DESCRIPTION                                      */}
              {/* ----------------------------------------------------------- */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconDocument className="w-4 h-4 text-[#1E6B38]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#141A16]">
                      1. Project Description
                    </h3>
                  </div>
                  {activeModalProject.introFact && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        activeModalProject.introFact.status === "verified"
                          ? "bg-[#EAF4EB] text-[#1E6B38] border-[#C5E1CB]"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {activeModalProject.introFact.status}
                    </span>
                  )}
                </div>

                {activeModalProject.introFact ? (
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#ECE7DD] space-y-2.5">
                    {editingFactId === activeModalProject.introFact.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingFactText}
                          onChange={(e) => setEditingFactText(e.target.value)}
                          rows={3}
                          className="w-full p-2.5 rounded-xl border border-[#1E6B38] bg-white text-xs leading-relaxed focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveInlineFact(activeModalProject.introFact!.id)}
                            className="px-3 py-1 rounded-lg bg-[#1E6B38] text-white text-xs font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFactId(null)}
                            className="px-3 py-1 rounded-lg bg-white border border-[#DDD7CA] text-[#556056] text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm text-[#141A16] leading-relaxed">
                          {activeModalProject.introFact.text}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-[#ECE7DD] text-[11px] text-[#78827A]">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFactId(activeModalProject.introFact!.id);
                                setEditingFactText(activeModalProject.introFact!.text);
                              }}
                              className="text-[#1E6B38] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <IconEdit className="w-3 h-3" />
                              <span>Edit description</span>
                            </button>
                            <span>·</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFactStatus(
                                  activeModalProject.introFact!.id,
                                  activeModalProject.introFact!.status === "verified"
                                    ? "stale"
                                    : "verified"
                                )
                              }
                              className="hover:underline font-semibold text-[#556056] cursor-pointer"
                            >
                              {activeModalProject.introFact.status === "verified"
                                ? "Mark Pending"
                                : "Mark Verified"}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteFact(activeModalProject.introFact!.id)}
                            className="text-rose-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-dashed border-[#DDD7CA] space-y-2">
                    <p className="text-xs text-[#78827A]">
                      No overview description extracted yet. Add a high-level summary of this project.
                    </p>
                    {showAddDescInput ? (
                      <div className="space-y-2">
                        <textarea
                          value={newDescText}
                          onChange={(e) => setNewDescText(e.target.value)}
                          placeholder="e.g. SkillOra is an AI-powered automated verification and grounding platform..."
                          rows={2}
                          className="w-full p-2.5 rounded-xl border border-[#1E6B38] bg-white text-xs focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddDescription(activeModalProject.name)}
                            className="px-3 py-1 bg-[#1E6B38] text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Save Description
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddDescInput(false)}
                            className="px-3 py-1 bg-white border border-[#DDD7CA] text-[#556056] text-xs rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddDescInput(true)}
                        className="px-3 py-1.5 rounded-xl bg-[#EAF4EB] text-[#1E6B38] border border-[#C5E1CB] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <IconPlus className="w-3.5 h-3.5" />
                        <span>Add Description</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ----------------------------------------------------------- */}
              {/* SECTION 2: CORE FEATURES & ARCHITECTURE                     */}
              {/* ----------------------------------------------------------- */}
              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconBolt className="w-4 h-4 text-[#1E6B38]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#141A16]">
                      2. Main Core Features &amp; Architecture
                    </h3>
                  </div>
                  <span className="text-xs text-[#78827A]">
                    {activeModalProject.coreFeatures.length} features
                  </span>
                </div>

                <div className="space-y-2">
                  {activeModalProject.coreFeatures.length === 0 ? (
                    <p className="text-xs text-[#78827A] italic p-3 bg-[#FAF9F5] rounded-xl border border-[#ECE7DD]">
                      No features recorded yet. Add one below.
                    </p>
                  ) : (
                    activeModalProject.coreFeatures.map((feat) => {
                      const isEditing = editingFactId === feat.id;
                      return (
                        <div
                          key={feat.id}
                          className="p-3 rounded-xl bg-[#FAF9F5] border border-[#ECE7DD] space-y-1.5"
                        >
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingFactText}
                                onChange={(e) => setEditingFactText(e.target.value)}
                                rows={2}
                                className="w-full p-2 rounded-lg border border-[#1E6B38] bg-white text-xs focus:outline-none"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveInlineFact(feat.id)}
                                  className="px-2.5 py-1 bg-[#1E6B38] text-white text-xs font-bold rounded cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFactId(null)}
                                  className="px-2.5 py-1 bg-white border border-[#DDD7CA] text-[#556056] text-xs rounded cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2 flex-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B38] mt-1.5 shrink-0" />
                                <p className="text-xs text-[#141A16] font-medium leading-relaxed">
                                  {feat.text}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                    feat.status === "verified"
                                      ? "bg-[#EAF4EB] text-[#1E6B38] border-[#C5E1CB]"
                                      : "bg-amber-100 text-amber-800 border-amber-200"
                                  }`}
                                >
                                  {feat.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFactId(feat.id);
                                    setEditingFactText(feat.text);
                                  }}
                                  className="p-1 text-[#78827A] hover:text-[#1E6B38] cursor-pointer"
                                  title="Edit feature"
                                >
                                  <IconEdit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFactStatus(
                                      feat.id,
                                      feat.status === "verified" ? "stale" : "verified"
                                    )
                                  }
                                  className="p-1 text-[#78827A] hover:text-[#1E6B38] cursor-pointer"
                                  title={
                                    feat.status === "verified" ? "Mark pending" : "Verify"
                                  }
                                >
                                  {feat.status === "verified" ? (
                                    <IconUndo className="w-3.5 h-3.5" />
                                  ) : (
                                    <IconCheck className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteFact(feat.id)}
                                  className="p-1 text-[#78827A] hover:text-rose-600 cursor-pointer"
                                  title="Delete feature"
                                >
                                  <IconTrash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Add Feature Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeature(activeModalProject.name);
                        }
                      }}
                      placeholder="+ Add architectural feature or capability"
                      className="flex-1 px-3 py-2 rounded-xl border border-[#DDD7CA] bg-white text-xs focus:outline-none focus:border-[#1E6B38]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddFeature(activeModalProject.name)}
                      disabled={!newFeatureText.trim()}
                      className="px-3.5 py-2 rounded-xl bg-[#1E6B38] text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------- */}
              {/* SECTION 3: RESULTS ACHIEVED & METRICS                        */}
              {/* ----------------------------------------------------------- */}
              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconChart className="w-4 h-4 text-[#1E6B38]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#141A16]">
                      3. Results Achieved &amp; Impact Metrics
                    </h3>
                  </div>
                  <span className="text-xs text-[#78827A]">
                    {activeModalProject.resultsAndMetrics.length} metrics
                  </span>
                </div>

                <div className="space-y-2">
                  {activeModalProject.resultsAndMetrics.length === 0 ? (
                    <p className="text-xs text-[#78827A] italic p-3 bg-[#FAF9F5] rounded-xl border border-[#ECE7DD]">
                      No quantitative metrics added yet. Add numbers, latency, scale, or impact below.
                    </p>
                  ) : (
                    activeModalProject.resultsAndMetrics.map((met) => {
                      const isEditing = editingFactId === met.id;
                      return (
                        <div
                          key={met.id}
                          className="p-3 rounded-xl bg-[#F7FCF8] border border-[#C5E1CB] space-y-1.5"
                        >
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingFactText}
                                onChange={(e) => setEditingFactText(e.target.value)}
                                rows={2}
                                className="w-full p-2 rounded-lg border border-[#1E6B38] bg-white text-xs focus:outline-none"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveInlineFact(met.id)}
                                  className="px-2.5 py-1 bg-[#1E6B38] text-white text-xs font-bold rounded cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFactId(null)}
                                  className="px-2.5 py-1 bg-white border border-[#DDD7CA] text-[#556056] text-xs rounded cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs text-[#141A16] font-semibold leading-relaxed flex-1">
                                {met.text}
                              </p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                    met.status === "verified"
                                      ? "bg-[#EAF4EB] text-[#1E6B38] border-[#C5E1CB]"
                                      : "bg-amber-100 text-amber-800 border-amber-200"
                                  }`}
                                >
                                  {met.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFactId(met.id);
                                    setEditingFactText(met.text);
                                  }}
                                  className="p-1 text-[#78827A] hover:text-[#1E6B38] cursor-pointer"
                                  title="Edit metric"
                                >
                                  <IconEdit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFactStatus(
                                      met.id,
                                      met.status === "verified" ? "stale" : "verified"
                                    )
                                  }
                                  className="p-1 text-[#78827A] hover:text-[#1E6B38] cursor-pointer"
                                  title={
                                    met.status === "verified" ? "Mark pending" : "Verify"
                                  }
                                >
                                  {met.status === "verified" ? (
                                    <IconUndo className="w-3.5 h-3.5" />
                                  ) : (
                                    <IconCheck className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteFact(met.id)}
                                  className="p-1 text-[#78827A] hover:text-rose-600 cursor-pointer"
                                  title="Delete metric"
                                >
                                  <IconTrash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Add Metric Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newMetricText}
                      onChange={(e) => setNewMetricText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMetric(activeModalProject.name);
                        }
                      }}
                      placeholder="+ Add measurable outcome (e.g. reduced response latency by 35%)"
                      className="flex-1 px-3 py-2 rounded-xl border border-[#DDD7CA] bg-white text-xs focus:outline-none focus:border-[#1E6B38]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddMetric(activeModalProject.name)}
                      disabled={!newMetricText.trim()}
                      className="px-3.5 py-2 rounded-xl bg-[#1E6B38] text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------- */}
              {/* SECTION 4: TECH STACK USED                                  */}
              {/* ----------------------------------------------------------- */}
              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconCode className="w-4 h-4 text-[#1E6B38]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#141A16]">
                      4. Tech Stack Used
                    </h3>
                  </div>
                  <span className="text-xs text-[#78827A]">
                    {activeModalProject.techChips.length} technologies
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-[#FAF9F5] border border-[#ECE7DD]">
                    {activeModalProject.techChips.length === 0 ? (
                      <span className="text-xs text-[#78827A] italic">
                        No technologies listed. Add stack items below.
                      </span>
                    ) : (
                      activeModalProject.techChips.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#DDD7CA] text-xs font-bold text-[#141A16] flex items-center gap-1.5 shadow-2xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B38]" />
                          <span>{tech}</span>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add Tech Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTechText}
                      onChange={(e) => setNewTechText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTech(activeModalProject.name);
                        }
                      }}
                      placeholder="+ Add technology (e.g. Next.js, FastAPI, PostgreSQL)"
                      className="flex-1 px-3 py-2 rounded-xl border border-[#DDD7CA] bg-white text-xs focus:outline-none focus:border-[#1E6B38]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTech(activeModalProject.name)}
                      disabled={!newTechText.trim()}
                      className="px-3.5 py-2 rounded-xl bg-[#1E6B38] text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="pt-4 border-t border-[#ECE7DD] flex items-center justify-between">
              <span className="text-xs text-[#78827A]">
                All changes automatically synchronize with your verified evidence ledger.
              </span>
              <button
                type="button"
                onClick={() => setActiveModalProjectName(null)}
                className="px-5 py-2 rounded-xl bg-[#141A16] hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-[#ECE7DD]">
        <Link
          href="/sources"
          className="text-xs font-semibold text-[#556056] hover:text-[#141A16] flex items-center gap-1.5 cursor-pointer"
        >
          <IconArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sources</span>
        </Link>

        <Link
          href="/job"
          className="px-6 py-2.5 bg-[#121614] hover:bg-black text-white rounded-full font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Continue to Job Match</span>
          <IconArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* MODAL 1: Add New Project Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[#FAF9F5] border border-[#DDD7CA] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-[#141A16]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ECE7DD] pb-3">
              <div className="flex items-center gap-2">
                <IconFolder className="w-5 h-5 text-[#1E6B38]" />
                <h3 className="text-base font-bold font-serif text-[#141A16]">Add New Project</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-[#ECE7DD] text-[#78827A] hover:text-[#141A16] cursor-pointer"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#141A16]">Project Name *</label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Campus Chatbot, E-Commerce Platform"
                  className="w-full h-9 px-3 rounded-lg border border-[#E5E1D5] bg-white text-xs focus:outline-none focus:border-[#1E6B38]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#141A16]">Project Overview / One-Liner *</label>
                <textarea
                  value={newProjOverview}
                  onChange={(e) => setNewProjOverview(e.target.value)}
                  rows={2}
                  placeholder="Describe what the project does and its main purpose..."
                  className="w-full p-2.5 rounded-lg border border-[#E5E1D5] bg-white text-xs focus:outline-none focus:border-[#1E6B38]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#141A16]">Core Features (1 per line)</label>
                <textarea
                  value={newProjFeatures}
                  onChange={(e) => setNewProjFeatures(e.target.value)}
                  rows={3}
                  placeholder="Architected RAG pipeline with LangChain&#10;Built real-time socket chat streaming"
                  className="w-full p-2.5 rounded-lg border border-[#E5E1D5] bg-white text-xs focus:outline-none focus:border-[#1E6B38]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#141A16]">Key Results &amp; Metrics (1 per line)</label>
                <textarea
                  value={newProjMetrics}
                  onChange={(e) => setNewProjMetrics(e.target.value)}
                  rows={2}
                  placeholder="Reduced response latency to 180ms&#10;Achieved 98.5% user satisfaction"
                  className="w-full p-2.5 rounded-lg border border-[#E5E1D5] bg-white text-xs focus:outline-none focus:border-[#1E6B38]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#141A16]">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={newProjTech}
                  onChange={(e) => setNewProjTech(e.target.value)}
                  placeholder="Python, FastAPI, LangChain, React, Docker"
                  className="w-full h-9 px-3 rounded-lg border border-[#E5E1D5] bg-white text-xs focus:outline-none focus:border-[#1E6B38]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE7DD]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#DDD7CA] text-[#556056] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={!newProjName.trim() || !newProjOverview.trim()}
                className="px-5 py-2 rounded-xl bg-[#1E6B38] hover:bg-[#16532B] disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>Create Project &amp; Catalog Facts</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Project Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-[#FAF9F5] border border-[#DDD7CA] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-[#141A16]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ECE7DD] pb-3">
              <div className="flex items-center gap-2">
                <IconEdit className="w-4 h-4 text-[#1E6B38]" />
                <h3 className="text-base font-bold font-serif text-[#141A16]">
                  Edit Project: {targetProject}
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg hover:bg-[#ECE7DD] text-[#78827A] hover:text-[#141A16] cursor-pointer"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#141A16]">Project Name</label>
                <input
                  type="text"
                  value={editProjName}
                  onChange={(e) => setEditProjName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[#E5E1D5] bg-white text-xs focus:outline-none focus:border-[#1E6B38]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#141A16]">Project Overview Description</label>
                <textarea
                  value={editProjOverview}
                  onChange={(e) => setEditProjOverview(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-[#E5E1D5] bg-white text-xs focus:outline-none focus:border-[#1E6B38]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE7DD]">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#DDD7CA] text-[#556056] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProjectEdit}
                className="px-5 py-2 rounded-xl bg-[#1E6B38] hover:bg-[#16532B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-[#FAF9F5] border border-[#DDD7CA] rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 text-[#141A16]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <IconTrash className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#141A16]">Delete {targetProject}?</h3>
              <p className="text-xs text-[#556056] leading-relaxed">
                Are you sure you want to delete this project? This will remove all its verified claims and metrics from your active fact ledger.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-3 border-t border-[#ECE7DD]">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#DDD7CA] text-[#556056] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Yes, Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
