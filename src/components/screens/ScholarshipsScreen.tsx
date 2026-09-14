import React, { useState } from 'react';
import {
  Award,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Filter,
  Sparkles,
} from 'lucide-react';
import { OpportunityItem } from '../../types';

interface ScholarshipsScreenProps {
  opportunities: OpportunityItem[];
}

export const ScholarshipsScreen: React.FC<ScholarshipsScreenProps> = ({ opportunities }) => {
  const [selectedType, setSelectedType] = useState<'All' | 'Scholarship' | 'Internship' | 'Fellowship'>('All');
  const [appliedModal, setAppliedModal] = useState<OpportunityItem | null>(null);

  const filtered = opportunities.filter(
    (item) => selectedType === 'All' || item.type === selectedType
  );

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Scholarships & Opportunities
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Curated opportunities for undergraduate and postgraduate students in mathematical sciences
        </p>
      </div>

      {/* Prominent Sample Data Notice as required */}
      <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-300">
        <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block">Sample Academic Prototype Data</span>
          <span>
            These opportunities illustrate eligibility criteria and application workflows for mathematics and statistics students. Real integration connects to live donor APIs in future releases.
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['All', 'Scholarship', 'Internship', 'Fellowship'] as const).map((type) => (
          <button
            key={type}
            id={`opp-filter-${type.toLowerCase()}`}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              selectedType === type
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {type === 'All' ? `All Opportunities (${opportunities.length})` : `${type}s`}
          </button>
        ))}
      </div>

      {/* Opportunities List */}
      <div className="space-y-3.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.type === 'Scholarship'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.type === 'Internship'
                        ? 'bg-blue-500/20 text-sky-300 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-[10px] text-slate-500">Sample Prototype</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-sky-400 font-medium mt-0.5">{item.organization}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 block">
                  {item.daysRemaining} Days Left
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Due {item.deadline}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-850 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Coverage: <strong className="text-slate-200">{item.coverage}</strong></span>
              </div>
              <p className="text-[11px] text-slate-400">
                Eligibility: <span className="text-slate-300">{item.eligibility}</span>
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                id={`apply-btn-${item.id}`}
                onClick={() => setAppliedModal(item)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <span>View & Apply</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Opportunity Details / Application Simulation Modal */}
      {appliedModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-sky-400 font-bold">
                  {appliedModal.type} Overview
                </span>
                <h3 className="text-base font-bold text-white mt-1">{appliedModal.title}</h3>
                <p className="text-xs text-sky-300">{appliedModal.organization}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p><strong>Funding / Stipend:</strong> {appliedModal.coverage}</p>
              <p><strong>Location:</strong> {appliedModal.location}</p>
              <p><strong>Application Deadline:</strong> {appliedModal.deadline} ({appliedModal.daysRemaining} days left)</p>
              <p><strong>Target Candidate:</strong> {appliedModal.eligibility}</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Your Academic Profile (GPA 4.25) meets all criteria!</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAppliedModal(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAppliedModal(null);
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
