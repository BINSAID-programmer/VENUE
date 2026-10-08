import React from 'react';

interface CatalogueLoadingStateProps {
  label?: string;
  count?: number;
}

export const CatalogueLoadingState: React.FC<CatalogueLoadingStateProps> = ({
  label = 'Loading catalogue hierarchy...',
  count = 6,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-800 rounded-md" />
              <div className="h-4 w-12 bg-slate-800 rounded-full" />
            </div>
            <div className="h-3 w-40 bg-slate-800/60 rounded-md" />
            <div className="h-2.5 w-20 bg-slate-800/40 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
};
