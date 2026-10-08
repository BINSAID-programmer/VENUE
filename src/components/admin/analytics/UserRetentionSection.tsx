import React from 'react';
import {
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  TrendingUp,
} from 'lucide-react';
import { UserRetentionSummary } from '../../../types';

interface UserRetentionSectionProps {
  retention: UserRetentionSummary;
}

export const UserRetentionSection: React.FC<UserRetentionSectionProps> = ({
  retention,
}) => {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 backdrop-blur-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" />
            <h3 className="text-base font-bold text-white tracking-tight uppercase">
              User Retention & Return Cohorts
            </h3>
            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
              Day 1 • Day 7 • Day 30
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Cohort tracking of newly registered students and faculty who return to VENUE across consecutive time intervals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-1.5 text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Average Day 1 Retention
            </div>
            <div className="text-base font-bold text-white font-mono">
              {retention.overallDay1 !== null ? `${retention.overallDay1}%` : 'Unavailable'}
            </div>
          </div>
        </div>
      </div>

      {/* Insufficient Historical Data Notice or Explanation */}
      {!retention.hasSufficientHistoricalData ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/60 text-slate-400">
            <Clock className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Insufficient Historical Cohort Data
            </h4>
            <p className="mt-1.5 text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              {retention.explanationNote}
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300 border border-slate-700">
              <Info className="h-3.5 w-3.5 text-purple-400" />
              <span>Fabricated or placeholder retention data is prohibited by system design</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Cohort Date</th>
                  <th className="pb-3 font-semibold">Cohort Size</th>
                  <th className="pb-3 font-semibold">Day 1 Return</th>
                  <th className="pb-3 font-semibold">Day 7 Return</th>
                  <th className="pb-3 font-semibold">Day 30 Return</th>
                  <th className="pb-3 font-semibold text-right">Maturity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {retention.cohorts.map((cohort, idx) => (
                  <tr key={cohort.cohortDate || idx} className="hover:bg-slate-900/40">
                    <td className="py-3 font-sans font-semibold text-white">
                      {cohort.cohortDate}
                    </td>
                    <td className="py-3 text-slate-300">
                      {cohort.cohortSize} user{cohort.cohortSize === 1 ? '' : 's'}
                    </td>
                    <td className="py-3">
                      {cohort.day1Percentage !== null ? (
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-bold border border-emerald-500/20">
                          {cohort.day1Percentage}%
                        </span>
                      ) : (
                        <span className="text-slate-500 italic font-sans text-[11px]">Pending window</span>
                      )}
                    </td>
                    <td className="py-3">
                      {cohort.day7Percentage !== null ? (
                        <span className="rounded bg-sky-500/10 px-2 py-0.5 text-sky-400 font-bold border border-sky-500/20">
                          {cohort.day7Percentage}%
                        </span>
                      ) : (
                        <span className="text-slate-500 italic font-sans text-[11px]">Pending window</span>
                      )}
                    </td>
                    <td className="py-3">
                      {cohort.day30Percentage !== null ? (
                        <span className="rounded bg-purple-500/10 px-2 py-0.5 text-purple-400 font-bold border border-purple-500/20">
                          {cohort.day30Percentage}%
                        </span>
                      ) : (
                        <span className="text-slate-500 italic font-sans text-[11px]">Pending window</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {cohort.hasSufficientData ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Active Tracking</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-sans">
                          <Clock className="h-3 w-3" />
                          <span>Early Stage</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
