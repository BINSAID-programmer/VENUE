import React from 'react';
import {
  FileText,
  Eye,
  Download,
  BookOpen,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { MaterialEngagementSummary } from '../../../types';

interface MaterialEngagementSectionProps {
  materialEngagement: MaterialEngagementSummary;
}

export const MaterialEngagementSection: React.FC<MaterialEngagementSectionProps> = ({
  materialEngagement,
}) => {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 backdrop-blur-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight uppercase">
              Academic Material Engagement
            </h3>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
              Views & Downloads
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Telemetry measuring student interactions with repository lecture handouts, slide decks, and exam papers.
          </p>
        </div>

        {/* Global Interaction Counters */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-1.5 text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-end gap-1">
              <Eye className="h-3 w-3 text-sky-400" />
              <span>Total Views</span>
            </div>
            <div className="text-base font-bold text-white font-mono">
              {materialEngagement.totalViews}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-1.5 text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-end gap-1">
              <Download className="h-3 w-3 text-emerald-400" />
              <span>Total Downloads</span>
            </div>
            <div className="text-base font-bold text-emerald-400 font-mono">
              {materialEngagement.totalDownloads}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most-Viewed Materials */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-sky-400" />
              <span>Most-Viewed Materials</span>
            </h4>
            <span className="text-[11px] text-slate-500">Top 5 by views</span>
          </div>

          {materialEngagement.mostViewed.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-center text-xs text-slate-500">
              No material view interactions recorded yet
            </div>
          ) : (
            <div className="space-y-2">
              {materialEngagement.mostViewed.map((item, idx) => (
                <div
                  key={item.materialId || idx}
                  className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-xs font-mono font-bold text-sky-400">
                      #{idx + 1}
                    </span>
                    <div className="truncate">
                      <h5 className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        {item.courseCode && (
                          <span className="font-semibold text-sky-400">{item.courseCode}</span>
                        )}
                        <span>•</span>
                        <span>{item.materialType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-white font-mono block">
                      {item.viewsCount} views
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {item.downloadsCount} downloads
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most-Downloaded Materials */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Most-Downloaded Materials</span>
            </h4>
            <span className="text-[11px] text-slate-500">Top 5 by downloads</span>
          </div>

          {materialEngagement.mostDownloaded.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-center text-xs text-slate-500">
              No material download interactions recorded yet
            </div>
          ) : (
            <div className="space-y-2">
              {materialEngagement.mostDownloaded.map((item, idx) => (
                <div
                  key={item.materialId || idx}
                  className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-mono font-bold text-emerald-400">
                      #{idx + 1}
                    </span>
                    <div className="truncate">
                      <h5 className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        {item.courseCode && (
                          <span className="font-semibold text-sky-400">{item.courseCode}</span>
                        )}
                        <span>•</span>
                        <span>{item.materialType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-400 font-mono block">
                      {item.downloadsCount} dls
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {item.viewsCount} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Usage by Course */}
      {materialEngagement.byCourse.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              <span>Material Engagement by Course</span>
            </h4>
            <span className="text-[11px] text-slate-500">Curricular demand analysis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {materialEngagement.byCourse.map((c) => (
              <div
                key={c.courseCode}
                className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-sky-400 font-mono">{c.courseCode}</span>
                  <span className="text-[10px] rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 font-medium">
                    {c.materialsCount} item{c.materialsCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>{c.totalViews} views</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">{c.totalDownloads} downloads</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
