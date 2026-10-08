import React from 'react';
import {
  Sparkles,
  FileText,
  Calendar,
  CheckCircle2,
  BookOpen,
  Megaphone,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { FeatureUsageMetric, AnalyticsFeatureType } from '../../../types';

interface FeatureUsageSectionProps {
  features: FeatureUsageMetric[];
  totalFeatureInteractions: number;
  activeFeatureFilter: AnalyticsFeatureType;
  onSelectFeatureFilter?: (feat: AnalyticsFeatureType) => void;
}

const FEATURE_ICONS: Record<string, any> = {
  ai_tutor: Sparkles,
  materials: FileText,
  study_planner: Calendar,
  quizzes: CheckCircle2,
  courses: BookOpen,
  announcements: Megaphone,
};

const FEATURE_COLORS: Record<string, { text: string; bg: string; border: string; gradient: string }> = {
  ai_tutor: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', gradient: 'from-purple-600 to-indigo-500' },
  materials: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', gradient: 'from-emerald-600 to-teal-500' },
  study_planner: { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', gradient: 'from-sky-600 to-cyan-500' },
  quizzes: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', gradient: 'from-amber-600 to-orange-500' },
  courses: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', gradient: 'from-indigo-600 to-blue-500' },
  announcements: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', gradient: 'from-rose-600 to-pink-500' },
};

export const FeatureUsageSection: React.FC<FeatureUsageSectionProps> = ({
  features,
  totalFeatureInteractions,
  activeFeatureFilter,
  onSelectFeatureFilter,
}) => {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 backdrop-blur-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-sky-400" />
            <h3 className="text-base font-bold text-white tracking-tight uppercase">
              Feature Adoption & Functional Usage
            </h3>
            <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300 border border-sky-500/30">
              6 Core Modules Tracked
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real action-driven telemetry spanning AI requests, material opens/downloads, quiz attempts, study planner tasks, course navigations, and notices.
          </p>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Total Feature Interactions
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {totalFeatureInteractions.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Grid of 6 Major Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feat) => {
          const Icon = FEATURE_ICONS[feat.feature] || Layers;
          const colors = FEATURE_COLORS[feat.feature] || {
            text: 'text-slate-400',
            bg: 'bg-slate-800',
            border: 'border-slate-700',
            gradient: 'from-slate-600 to-slate-500',
          };
          const isSelected = activeFeatureFilter === feat.feature;

          return (
            <div
              key={feat.feature}
              onClick={() => onSelectFeatureFilter?.(isSelected ? 'all' : feat.feature)}
              className={`rounded-2xl border p-4.5 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-500/10'
                  : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${colors.bg} ${colors.text} border ${colors.border}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {feat.displayName}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {feat.primaryActionName}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-mono font-bold ${colors.text}`}>
                    {feat.percentageOfTotal}%
                  </span>
                </div>

                {/* Event Counts */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                      All-Time Actions
                    </span>
                    <span className="text-base font-bold text-white font-mono">
                      {feat.totalEvents}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                      In Date Range
                    </span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      +{feat.periodEvents}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar and unique users */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Unique Users</span>
                  <span className="font-semibold text-slate-200 font-mono">{feat.uniqueUsers}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                    style={{ width: `${Math.max(feat.percentageOfTotal, feat.totalEvents > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
