import React from 'react';
import {
  Users,
  Activity,
  Sparkles,
  Layers,
  Clock,
  TrendingUp,
  Info,
  ChevronUp,
} from 'lucide-react';
import { UserEngagementMetrics, AnalyticsDateRange } from '../../../types';

interface UserEngagementSectionProps {
  engagement: UserEngagementMetrics;
  dateRange: AnalyticsDateRange;
}

export const UserEngagementSection: React.FC<UserEngagementSectionProps> = ({
  engagement,
  dateRange,
}) => {
  const maxTrendVal = Math.max(
    ...engagement.activeUsersTrend.map((t) => t.activeUsers),
    ...engagement.activeUsersTrend.map((t) => t.eventsCount),
    4
  );

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight uppercase">
              User Engagement & Activity Ratios
            </h3>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
              Verified Interaction Based
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Active-user telemetry measured exclusively from actual platform interactions (AI queries, downloads, task logs, quiz attempts).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 text-slate-300">
            Window: <strong className="text-white">{dateRange === '7d' ? '7 Days' : dateRange === '30d' ? '30 Days' : dateRange === '90d' ? '90 Days' : 'All Time'}</strong>
          </span>
        </div>
      </div>

      {/* Strict Activity Definition Note */}
      <div className="flex items-start gap-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-indigo-200/90 leading-relaxed">
        <Info className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-indigo-300">Active User Standard: </span>
          {engagement.activityDefinition}
        </div>
      </div>

      {/* 4 Primary Active User Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* DAU */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">DAU (Daily Active)</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-white font-mono">
            {engagement.dau}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400">Past 24 hours</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/40" />
        </div>

        {/* WAU */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">WAU (Weekly Active)</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-white font-mono">
            {engagement.wau}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-sky-400">Past 7 days</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500/40" />
        </div>

        {/* MAU */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">MAU (Monthly Active)</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-white font-mono">
            {engagement.mau}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-indigo-400">Past 30 days</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500/40" />
        </div>

        {/* Stickiness / Ratio */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Stickiness Ratio</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-300 font-mono">
            {engagement.stickinessRatio}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            DAU / MAU engagement ratio
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/40" />
        </div>
      </div>

      {/* Cohort Composition: New vs Returning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              New User Registrations in Period
            </span>
            <p className="text-xs text-slate-500">
              Users whose initial profile onboarding occurred during this filter
            </p>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            +{engagement.newRegistrationsInPeriod}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Returning Users in Period
            </span>
            <p className="text-xs text-slate-500">
              Pre-existing accounts that logged repeat interactions in this filter
            </p>
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {engagement.returningUsersInPeriod}
          </div>
        </div>
      </div>

      {/* Daily Active Users Trend Bar Chart */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Daily Active Users & Interaction Frequency</span>
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Unique Active Users</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <span>Total Events</span>
            </span>
          </div>
        </div>

        {engagement.activeUsersTrend.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-center text-xs text-slate-500">
            No daily activity logs recorded in this period
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-31 gap-1.5 items-end h-32 pt-4 px-2 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              {engagement.activeUsersTrend.map((day, idx) => {
                const userBarHeight = Math.max(
                  4,
                  Math.round((day.activeUsers / maxTrendVal) * 90)
                );
                const eventBarHeight = Math.max(
                  2,
                  Math.round((day.eventsCount / (maxTrendVal * 2)) * 90)
                );

                return (
                  <div
                    key={day.date || idx}
                    className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-[10px] text-white shadow-xl whitespace-nowrap font-mono">
                        <strong>{day.label}</strong>
                        <div>{day.activeUsers} active user{day.activeUsers === 1 ? '' : 's'}</div>
                        <div>{day.eventsCount} total event{day.eventsCount === 1 ? '' : 's'}</div>
                      </div>
                    </div>

                    <div className="w-full flex items-end justify-center gap-0.5">
                      {/* Active users bar */}
                      <div
                        style={{ height: `${userBarHeight}%` }}
                        className="w-2.5 rounded-t bg-emerald-500/80 group-hover:bg-emerald-400 transition-all"
                      />
                      {/* Event count mini bar */}
                      <div
                        style={{ height: `${eventBarHeight}%` }}
                        className="w-1.5 rounded-t bg-indigo-500/50 group-hover:bg-indigo-400 transition-all"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 truncate w-full text-center font-mono">
                      {idx % (engagement.activeUsersTrend.length > 14 ? 3 : 1) === 0 ? day.label.split(' ')[1] : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
