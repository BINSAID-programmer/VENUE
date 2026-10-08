import React, { useState, useEffect, useId } from 'react';
import {
  X,
  Plus,
  BookOpen,
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  GraduationCap,
  Layers,
  ArrowRight,
  Building,
} from 'lucide-react';
import {
  CourseRecord,
  ProgrammeRecord,
  DepartmentRecord,
  CanonicalCourseRecord,
} from '../../../types';
import { adminCatalogueService } from '../../../services/adminCatalogueService';

interface AssignCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  programme: ProgrammeRecord;
  initialCourse?: CourseRecord | CanonicalCourseRecord | null;
  initialYear?: number;
  initialSemester?: number;
  onCourseAssigned: (course: CourseRecord) => void;
}

export const AssignCourseModal: React.FC<AssignCourseModalProps> = ({
  isOpen,
  onClose,
  programme,
  initialCourse,
  initialYear,
  initialSemester,
  onCourseAssigned,
}) => {
  const formId = useId();
  // Search & Selection state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CanonicalCourseRecord[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CanonicalCourseRecord | null>(null);

  // Term parameters
  const [yearOfStudy, setYearOfStudy] = useState<number>(initialYear || 1);
  const [semester, setSemester] = useState<number>(initialSemester || 1);
  const [status, setStatus] = useState<'Core' | 'Elective'>('Core');
  const [credits, setCredits] = useState<number>(12);

  // Validation & status
  const [checkingAssignment, setCheckingAssignment] = useState(false);
  const [alreadyAssigned, setAlreadyAssigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize modal
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSearchResults([]);
      setYearOfStudy(initialYear || 1);
      setSemester(initialSemester || 1);
      setStatus('Core');
      setErrorMessage(null);
      setSuccessMessage(null);
      setAlreadyAssigned(false);

      if (initialCourse) {
        const canonical: CanonicalCourseRecord = {
          id: (initialCourse as any).canonicalCourseId || initialCourse.id,
          code: initialCourse.code || (initialCourse as any).courseCode || '',
          title: initialCourse.title || (initialCourse as any).courseName || '',
          defaultCredits: (initialCourse as any).defaultCredits || initialCourse.credits || 12,
          universityId: initialCourse.universityId || 'udsm',
          departmentId: initialCourse.departmentId,
          academicUnitId: (initialCourse as any).academicUnitId,
          verified: true,
          source: 'Official Academic Catalogue',
        };
        setSelectedCourse(canonical);
        setCredits(canonical.defaultCredits || 12);
      } else {
        setSelectedCourse(null);
        setCredits(12);
        // Load initial popular courses
        adminCatalogueService.searchCanonicalCourses('M', 10).then((res) => {
          setSearchResults(res);
        });
      }
    }
  }, [isOpen, initialCourse, initialYear, initialSemester]);

  // Debounced course search
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) return;

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await adminCatalogueService.searchCanonicalCourses(searchTerm.trim(), 20);
        setSearchResults(res);
      } catch (err) {
        console.warn('Error searching courses:', err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Check if course is already assigned to this programme in selected term
  useEffect(() => {
    if (!selectedCourse || !programme) return;

    let isMounted = true;
    const checkDuplicate = async () => {
      setCheckingAssignment(true);
      try {
        const existingTerms = await adminCatalogueService.getCourseUsages(selectedCourse.code);
        if (!isMounted) return;
        const existsHere = existingTerms.some(
          (u) =>
            u.programmeId.toLowerCase() === programme.id.toLowerCase() &&
            u.yearOfStudy === yearOfStudy &&
            u.semester === semester
        );
        setAlreadyAssigned(existsHere);
        if (existsHere) {
          setErrorMessage(
            `Course ${selectedCourse.code} is already assigned to ${programme.shortName || programme.name} in Year ${yearOfStudy}, Semester ${semester}.`
          );
        } else {
          setErrorMessage(null);
        }
      } catch (err) {
        console.warn('Error checking course usage:', err);
      } finally {
        if (isMounted) setCheckingAssignment(false);
      }
    };

    checkDuplicate();
    return () => {
      isMounted = false;
    };
  }, [selectedCourse, programme, yearOfStudy, semester]);

  if (!isOpen) return null;

  const handleSelectCourse = (c: CanonicalCourseRecord) => {
    setSelectedCourse(c);
    setCredits(c.defaultCredits || 12);
    setErrorMessage(null);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) {
      setErrorMessage('Please select a course to assign.');
      return;
    }
    if (alreadyAssigned) {
      setErrorMessage(`Course ${selectedCourse.code} is already assigned to this term.`);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await adminCatalogueService.assignCourseToProgramme({
        canonicalCourseId: selectedCourse.id,
        code: selectedCourse.code,
        title: selectedCourse.title,
        credits: Number(credits) || selectedCourse.defaultCredits || 12,
        status,
        programmeId: programme.id,
        academicUnitId: programme.academicUnitId,
        departmentId: programme.departmentId,
        yearOfStudy,
        semester,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to assign course to programme.');
        setSubmitting(false);
        return;
      }

      setSuccessMessage(
        `Successfully assigned ${selectedCourse.code} to ${programme.shortName || programme.name} (Year ${yearOfStudy}, Sem ${semester})!`
      );

      setTimeout(() => {
        const assignedCourse: CourseRecord = {
          id: `udsm_${programme.id}_${selectedCourse.code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          code: selectedCourse.code,
          title: selectedCourse.title,
          credits: Number(credits) || selectedCourse.defaultCredits || 12,
          status,
          yearOfStudy,
          semester,
          programmeId: programme.id,
          academicUnitId: programme.academicUnitId,
          departmentId: programme.departmentId,
          universityId: 'udsm',
          verified: true,
          source: 'Official Academic Catalogue',
        };
        onCourseAssigned(assignedCourse);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Error assigning course:', err);
      setErrorMessage(err?.message || 'Failed to assign course.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                Curriculum Assignment
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Canonical Reuse
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Assign Course to Programme
            </h3>
            <p className="text-xs text-slate-400">
              Assign an existing canonical course to <strong className="text-white">{programme.name}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-rose-300 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <p className="font-semibold text-rose-200">Assignment Notice</p>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Selected Course Banner or Search Box */}
        {selectedCourse ? (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                    {selectedCourse.code}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-semibold">
                    Canonical Course
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {selectedCourse.title}
                </h4>
                <p className="text-[11px] text-indigo-300/80">
                  Default credits: <strong>{selectedCourse.defaultCredits || 12}</strong>
                  {selectedCourse.departmentId && ` • Dept: ${selectedCourse.departmentId}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Change Course
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <label htmlFor={`${formId}-search`} className="block text-xs font-semibold text-slate-300">
              Select Canonical Course from Catalogue <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                id={`${formId}-search`}
                type="text"
                placeholder="Search by course code or title (e.g. MT 101, Calculus, Statics)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {searching && (
                <div className="absolute right-3.5 top-3 h-3.5 w-3.5 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
              )}
            </div>

            {/* Search results picker */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/80 max-h-48 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  {searchTerm.length >= 2 ? 'No matching courses found.' : 'Type to search canonical courses...'}
                </div>
              ) : (
                searchResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCourse(c)}
                    className="w-full text-left p-3 hover:bg-slate-900/80 flex items-center justify-between gap-3 text-xs transition group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-400 group-hover:text-indigo-300">
                          {c.code}
                        </span>
                        <span className="text-white font-medium">{c.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {c.defaultCredits || 12} Credits {c.departmentId ? `• ${c.departmentId}` : ''}
                      </p>
                    </div>

                    <span className="text-[11px] text-indigo-400 font-semibold group-hover:underline">
                      Select
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Assignment Settings Form */}
        <form onSubmit={handleAssign} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor={`${formId}-year`} className="block text-xs font-semibold text-slate-300">
                Year of Study <span className="text-rose-400">*</span>
              </label>
              <select
                id={`${formId}-year`}
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                {Array.from({ length: programme.durationYears || 4 }, (_, i) => i + 1).map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`${formId}-sem`} className="block text-xs font-semibold text-slate-300">
                Semester <span className="text-rose-400">*</span>
              </label>
              <select
                id={`${formId}-sem`}
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={1}>Semester I</option>
                <option value={2}>Semester II</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor={`${formId}-status`} className="block text-xs font-semibold text-slate-300">
                Classification
              </label>
              <select
                id={`${formId}-status`}
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Core' | 'Elective')}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Core">Core Course (Compulsory)</option>
                <option value="Elective">Elective Course (Optional)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`${formId}-credits`} className="block text-xs font-semibold text-slate-300">
                Credits for this Term
              </label>
              <input
                id={`${formId}-credits`}
                type="number"
                min={1}
                max={60}
                value={credits}
                onChange={(e) => setCredits(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !selectedCourse || alreadyAssigned}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Assign to Programme</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
