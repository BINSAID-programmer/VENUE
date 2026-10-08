import React from 'react';
import { ChevronRight, Home, Layers, Building, GraduationCap, Calendar, BookOpen } from 'lucide-react';
import { AcademicUnitRecord, DepartmentRecord, ProgrammeRecord } from '../../../types';

interface CatalogueBreadcrumbProps {
  selectedUnit: AcademicUnitRecord | null;
  selectedDept: DepartmentRecord | null;
  selectedProg: ProgrammeRecord | null;
  selectedYear: number | null;
  selectedSemester: number | null;
  onSelectUnit: (unit: AcademicUnitRecord | null) => void;
  onSelectDept: (dept: DepartmentRecord | null) => void;
  onSelectProg: (prog: ProgrammeRecord | null) => void;
  onSelectYear: (year: number | null) => void;
  onSelectSemester: (semester: number | null) => void;
  onResetToRoot: () => void;
}

export const CatalogueBreadcrumb: React.FC<CatalogueBreadcrumbProps> = ({
  selectedUnit,
  selectedDept,
  selectedProg,
  selectedYear,
  selectedSemester,
  onSelectUnit,
  onSelectDept,
  onSelectProg,
  onSelectYear,
  onSelectSemester,
  onResetToRoot,
}) => {
  return (
    <nav
      aria-label="Catalogue Breadcrumb"
      className="flex items-center flex-wrap gap-1.5 text-xs text-slate-400 bg-slate-900/40 border border-slate-800/80 px-3.5 py-2.5 rounded-2xl backdrop-blur-sm overflow-x-auto"
    >
      {/* Root / All Units */}
      <button
        onClick={onResetToRoot}
        className={`flex items-center gap-1.5 font-medium transition hover:text-white px-2 py-1 rounded-lg ${
          !selectedUnit ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-400 hover:bg-slate-800'
        }`}
      >
        <Layers className="h-3.5 w-3.5" />
        <span>Academic Units</span>
      </button>

      {/* Selected Unit */}
      {selectedUnit && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <button
            onClick={() => {
              onSelectDept(null);
              onSelectProg(null);
              onSelectYear(null);
              onSelectSemester(null);
            }}
            className={`flex items-center gap-1.5 font-medium transition hover:text-white px-2 py-1 rounded-lg max-w-[200px] truncate ${
              !selectedDept ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title={selectedUnit.name}
          >
            <Building className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{selectedUnit.shortName || selectedUnit.name}</span>
          </button>
        </>
      )}

      {/* Selected Department */}
      {selectedDept && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <button
            onClick={() => {
              onSelectProg(null);
              onSelectYear(null);
              onSelectSemester(null);
            }}
            className={`flex items-center gap-1.5 font-medium transition hover:text-white px-2 py-1 rounded-lg max-w-[220px] truncate ${
              !selectedProg ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title={selectedDept.name}
          >
            <Building className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{selectedDept.name.replace(/^Department of\s+/i, 'Dept. of ')}</span>
          </button>
        </>
      )}

      {/* Selected Programme */}
      {selectedProg && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <button
            onClick={() => {
              onSelectYear(null);
              onSelectSemester(null);
            }}
            className={`flex items-center gap-1.5 font-medium transition hover:text-white px-2 py-1 rounded-lg max-w-[220px] truncate ${
              selectedYear === null ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title={selectedProg.name}
          >
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{selectedProg.shortName || selectedProg.name}</span>
          </button>
        </>
      )}

      {/* Selected Year */}
      {selectedYear !== null && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <button
            onClick={() => onSelectSemester(null)}
            className={`flex items-center gap-1.5 font-medium transition hover:text-white px-2 py-1 rounded-lg ${
              selectedSemester === null ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Year {selectedYear}</span>
          </button>
        </>
      )}

      {/* Selected Semester */}
      {selectedSemester !== null && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <span className="flex items-center gap-1.5 font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span>Semester {selectedSemester === 1 ? 'I' : 'II'}</span>
          </span>
        </>
      )}
    </nav>
  );
};
