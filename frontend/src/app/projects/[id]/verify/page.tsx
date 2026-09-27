"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Fact = {
  id: number;
  project_id: number;
  fact_type: string;
  claim: string;
  source_span: string;
  source_file: string;
  status: string; // 'pending' | 'verified' | 'stale' | 'rejected'
};

type Project = {
  id: number;
  title: string;
  summary: string;
  tech_stack: string;
  role?: string;
  facts: Fact[];
};

export default function VerifyProject() {
  const params = useParams();
  const id = (params?.id as string) || '1';

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingFactId, setEditingFactId] = useState<number | null>(null);
  const [editedClaim, setEditedClaim] = useState<string>('');
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [cardSummary, setCardSummary] = useState('');
  const [cardTechStack, setCardTechStack] = useState('');
  const [cardRole, setCardRole] = useState('');

  // Fetch real project data & facts from backend
  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await fetch(`${API_BASE}/projects/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to load project (${res.status})`);
      }
      const data: Project = await res.json();
      setProject(data);
      setCardTitle(data.title || '');
      setCardSummary(data.summary || '');
      setCardTechStack(data.tech_stack || '');
      setCardRole(data.role || '');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Unable to connect to backend. Please ensure backend is running at http://localhost:8000.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // Real API call to update fact status (Accept, Revert, Reject)
  const updateFactStatus = async (factId: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/facts/${factId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update fact status');
      }

      const updatedFact = await res.json();
      setProject((prev) =>
        prev
          ? {
              ...prev,
              facts: prev.facts.map((f) => (f.id === factId ? { ...f, status: updatedFact.status } : f)),
            }
          : null
      );
    } catch (err: any) {
      alert(`Error updating fact: ${err.message}`);
    }
  };

  // Real API call to save edited fact claim
  const saveFactEdit = async (factId: number) => {
    try {
      const res = await fetch(`${API_BASE}/facts/${factId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: editedClaim }),
      });

      if (!res.ok) {
        throw new Error('Failed to save edited claim');
      }

      const updated = await res.json();
      setProject((prev) =>
        prev
          ? {
              ...prev,
              facts: prev.facts.map((f) => (f.id === factId ? { ...f, claim: updated.claim } : f)),
            }
          : null
      );
      setEditingFactId(null);
    } catch (err: any) {
      alert(`Error saving claim: ${err.message}`);
    }
  };

  // Real API call to save project card edits
  const saveProjectCard = async () => {
    try {
      setIsSavingCard(true);
      const res = await fetch(`${API_BASE}/projects/${id}/card`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cardTitle,
          summary: cardSummary,
          tech_stack: cardTechStack,
          role: cardRole,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update project card');
      }
      const updated = await res.json();
      setProject((prev) => (prev ? { ...prev, ...updated } : null));
      alert('Project card saved successfully!');
    } catch (err: any) {
      alert(`Error saving card: ${err.message}`);
    } finally {
      setIsSavingCard(false);
    }
  };

  const facts = project?.facts || [];
  const verifiedCount = facts.filter((f) => f.status === 'verified').length;
  const pendingCount = facts.filter((f) => f.status === 'pending').length;
  const staleCount = facts.filter((f) => f.status === 'stale').length;

  const filteredFacts = facts.filter((f) => {
    if (statusFilter === 'all') return true;
    return f.status === statusFilter;
  });

  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'metric':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'tech':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'role':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'outcome':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href={`/projects/${id}/sources`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5"
            >
              ← Add More Sources
            </Link>
            <span className="text-slate-300">|</span>
            <Link 
              href="/"
              className="text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              SkillOra Home
            </Link>
          </div>

          <button
            onClick={loadProject}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>🔄</span> Refresh Live DB
          </button>
        </div>

        {/* Header */}
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Verified Career Fact Ledger
            </div>
            {project?.title && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF4EB] text-[#1E6B38] border border-[#DCF2E0] shadow-xs">
                📁 {project.title}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Audit & Verify Extracted Facts
          </h1>
          <p className="text-slate-600 text-base max-w-3xl">
            Every claim extracted from <strong className="text-slate-900 font-semibold">{project?.title || 'your project sources'}</strong> is auditable with exact source quotes before entering downstream resume tailoring.
          </p>
        </header>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <span className="text-red-500 text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Backend Connection Warning</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Summary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Facts</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{facts.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Verified</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{verifiedCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-orange-100 bg-orange-50/20 shadow-sm">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Stale / Changed</p>
            <p className="text-2xl font-black text-orange-600 mt-1">{staleCount}</p>
          </div>
        </div>

        {/* Pre-filled Project Card */}
        {project && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pre-filled Project Card</h2>
                <p className="text-xs text-slate-500">Automatically generated by the Source Extractor from ingested sources</p>
              </div>
              <button
                onClick={saveProjectCard}
                disabled={isSavingCard}
                className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg transition-all"
              >
                {isSavingCard ? 'Saving...' : 'Save Card Changes'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Project Title</label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role / Responsibility</label>
                <input
                  type="text"
                  value={cardRole}
                  onChange={(e) => setCardRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Summary</label>
                <textarea
                  rows={2}
                  value={cardSummary}
                  onChange={(e) => setCardSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={cardTechStack}
                  onChange={(e) => setCardTechStack(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                />
              </div>
            </div>
          </section>
        )}

        {/* Fact Ledger Table with Filter Controls */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
          
          <div className="p-4 md:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Fact Ledger</span>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                {filteredFacts.length} claims
              </span>
            </h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              {['all', 'pending', 'verified', 'stale'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    statusFilter === status
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="font-medium text-sm">Loading facts from SQLite database...</p>
            </div>
          ) : filteredFacts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <span className="text-3xl">📭</span>
              <p className="font-semibold text-slate-700">No facts found matching filter "{statusFilter}"</p>
              <Link
                href={`/projects/${id}/sources`}
                className="inline-block text-xs font-semibold text-blue-600 hover:underline"
              >
                + Add sources to extract real facts
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 w-28">Type</th>
                    <th className="py-3.5 px-4">Extracted Claim</th>
                    <th className="py-3.5 px-4">Source Verbatim Quote</th>
                    <th className="py-3.5 px-4 text-center w-28">Status</th>
                    <th className="py-3.5 px-4 text-right w-44">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredFacts.map((fact) => (
                    <tr key={fact.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Type Badge */}
                      <td className="py-4 px-4 align-top">
                        <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase rounded-md border ${getBadgeColor(fact.fact_type)}`}>
                          {fact.fact_type}
                        </span>
                      </td>

                      {/* Claim (View or Edit) */}
                      <td className="py-4 px-4 align-top font-medium text-slate-900">
                        {editingFactId === fact.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={editedClaim}
                              onChange={(e) => setEditedClaim(e.target.value)}
                              className="w-full p-2 text-xs border border-blue-500 rounded-lg outline-none font-sans"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveFactEdit(fact.id)}
                                className="px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingFactId(null)}
                                className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p>{fact.claim}</p>
                            <button
                              onClick={() => {
                                setEditingFactId(fact.id);
                                setEditedClaim(fact.claim);
                              }}
                              className="text-[11px] text-slate-400 hover:text-blue-600 mt-1 inline-block"
                            >
                              ✎ edit claim
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Source Quote */}
                      <td className="py-4 px-4 align-top">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed">
                          "{fact.source_span}"
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-sans">
                          <span>📁</span>
                          <span>{fact.source_file}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            fact.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fact.status === 'stale'
                              ? 'bg-orange-100 text-orange-800'
                              : fact.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {fact.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right space-x-2 whitespace-nowrap">
                        {fact.status !== 'verified' && (
                          <button
                            onClick={() => updateFactStatus(fact.id, 'verified')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-all shadow-sm"
                          >
                            Accept
                          </button>
                        )}

                        {fact.status !== 'pending' && (
                          <button
                            onClick={() => updateFactStatus(fact.id, 'pending')}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold transition-all"
                          >
                            Revert
                          </button>
                        )}

                        {fact.status !== 'rejected' && (
                          <button
                            onClick={() => updateFactStatus(fact.id, 'rejected')}
                            className="px-2 py-1 text-red-600 hover:text-red-800 text-xs font-medium"
                          >
                            Reject
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
