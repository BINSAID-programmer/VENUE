import React from 'react';
import { Calendar } from 'lucide-react';

interface YearSelectorProps {
  durationYears: number;
  selectedYear: number | null;
  onSelectYear: (year: number) => void;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  durationYears,
  selectedYear,
  onSelectYear,
}) => {
  const years = Array.from({ length: durationYears || 3 }, (_, i) => i + 1);

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
        <span>Year of Study</span>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {years.map((y) => {
          const isSelected = selectedYear === y;
          return (
            <button
              key={y}
              onClick={() => onSelectYear(y)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-500'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>Year {y}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
