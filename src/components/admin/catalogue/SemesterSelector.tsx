import React from 'react';
import { BookOpen } from 'lucide-react';

interface SemesterSelectorProps {
  selectedSemester: number | null;
  onSelectSemester: (semester: number) => void;
}

export const SemesterSelector: React.FC<SemesterSelectorProps> = ({
  selectedSemester,
  onSelectSemester,
}) => {
  const semesters = [
    { num: 1, label: 'Semester I' },
    { num: 2, label: 'Semester II' },
  ];

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
        <span>Academic Semester</span>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {semesters.map((s) => {
          const isSelected = selectedSemester === s.num;
          return (
            <button
              key={s.num}
              onClick={() => onSelectSemester(s.num)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-500'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
