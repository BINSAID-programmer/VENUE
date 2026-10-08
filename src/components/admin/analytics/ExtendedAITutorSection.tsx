import React from 'react';
import {
  Sparkles,
  Cpu,
  BarChart3,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { ExtendedAITutorAnalytics } from '../../../types';

interface ExtendedAITutorSectionProps {
  aiTutor: ExtendedAITutorAnalytics;
}

export const ExtendedAITutorSection: React.FC<ExtendedAITutorSectionProps> = ({
  aiTutor,
}) => {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <h3 className="text-base font-bold text-white tracking-tight uppercase">
            AI Tutor Usage & Model Telemetry
          </h3>
          <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
            Stage 8B Insights
          </span>
        </div>
        <span className="text-xs text-slate-400">
          Private student queries, conversations & document uploads excluded from telemetry
        </span>
      </div>

      {/* 6 AI Core Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total AI requests */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Requests</span>
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono">
            {aiTutor.totalRequests}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            {aiTutor.periodRequests} in period
          </div>
        </div>

        {/* Successful requests */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Successful</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-400 font-mono">
            {aiTutor.successCount}
          </div>
          <div className="mt-0.5 text-[10px] text-emerald-500 font-medium">
            {aiTutor.successRate}% success rate
          </div>
        </div>

        {/* Failed requests */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Failed</span>
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-rose-400 font-mono">
            {aiTutor.errorCount}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            Network/quota fails
          </div>
        </div>

        {/* Average tokens per request */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Tokens / Req</span>
            <BarChart3 className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono">
            {aiTutor.averageTokensPerRequest.toLocaleString()}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500 font-mono">
            {aiTutor.averagePromptTokens} in / {aiTutor.averageCompletionTokens} out
          </div>
        </div>

        {/* Total tokens consumed */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Tokens</span>
            <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono">
            {aiTutor.totalTokens.toLocaleString()}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            Prompt & candidate
          </div>
        </div>

        {/* Approx Cost */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimated Cost</span>
            <DollarSign className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-300 font-mono">
            ${aiTutor.approxTotalCostUsd.toFixed(4)}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            Calculated rate quota
          </div>
        </div>
      </div>

      {/* Model Distribution & Daily Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Model breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Usage By AI Model Identifier
          </h4>
          {Object.keys(aiTutor.modelDistribution).length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No AI queries recorded yet
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(aiTutor.modelDistribution).map(([model, rawCount]) => {
                const count = typeof rawCount === 'number' ? rawCount : Number(rawCount) || 0;
                const pct = aiTutor.totalRequests > 0
                  ? Math.round((count / aiTutor.totalRequests) * 100)
                  : 0;

                return (
                  <div key={model} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-purple-300 font-semibold">{model}</span>
                      <span className="text-slate-400 font-mono">
                        {count} req ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                        style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily Request Trends Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Daily AI Request & Token Trends
            </h4>
            <span className="text-[11px] text-slate-500">Selected Window</span>
          </div>

          {aiTutor.dailyTrends.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No daily AI request logs available in this window
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-7 sm:grid-cols-15 gap-1.5 items-end h-28 pt-4 px-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                {aiTutor.dailyTrends.map((d, i) => {
                  const maxDailyReqs = Math.max(...aiTutor.dailyTrends.map((x) => x.requests), 4);
                  const barH = Math.max(4, Math.round((d.requests / maxDailyReqs) * 85));

                  return (
                    <div
                      key={d.date || i}
                      className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                        <div className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-[10px] text-white shadow-xl whitespace-nowrap font-mono">
                          <strong>{d.label}</strong>
                          <div>{d.requests} requests ({d.successes} ok, {d.failures} fail)</div>
                          <div>{d.tokens.toLocaleString()} tokens (${d.costUsd.toFixed(4)})</div>
                        </div>
                      </div>

                      <div
                        style={{ height: `${barH}%` }}
                        className="w-full max-w-[20px] rounded-t bg-purple-500/80 group-hover:bg-purple-400 transition-all"
                      />
                      <span className="text-[9px] text-slate-500 truncate w-full text-center font-mono">
                        {d.label.split(' ')[1]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
