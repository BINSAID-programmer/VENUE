import React from 'react';
import { FolderSearch, ArrowLeft } from 'lucide-react';

interface CatalogueEmptyStateProps {
  title?: string;
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export const CatalogueEmptyState: React.FC<CatalogueEmptyStateProps> = ({
  title = 'No catalogue data found',
  message = 'There are no active records in this section of the catalogue.',
  onAction,
  actionLabel = 'Go Back',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-950/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mb-3">
        <FolderSearch className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
      <p className="mt-1 text-xs text-slate-400 max-w-sm">{message}</p>

      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
