import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Award,
  Layers,
  GraduationCap,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  MinusCircle,
  ExternalLink,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { CourseRecord, ProgrammeRecord, CanonicalCourseRecord } from '../../../types';
import {
  adminCatalogueService,
  CourseUsageRecord,
} from '../../../services/adminCatalogueService';

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseRecord;
  currentProgramme?: ProgrammeRecord | null;
  currentYear?: number | null;
  currentSemester?: number | null;
  onAssignToAnotherProg: (course: CourseRecord) => void;
  onEditCourse: (course: CourseRecord) => void;
  onDeleteCanonicalCourse: (course: CourseRecord) => void;
  onRemoveFromThisProg?: (course: CourseRecord) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  isOpen,
  onClose,
  course,
  currentProgramme,
  currentYear,
  currentSemester,
  onAssignToAnotherProg,
  onEditCourse,
  onDeleteCanonicalCourse,
  onRemoveFromThisProg,
}) => {
  const [usages, setUsages] = useState<CourseUsageRecord[]>([]);
  const [loadingUsages, setLoadingUsages] = useState(true);

  const code = course.code || course.courseCode || 'N/A';
  const title = course.title || course.courseName || 'Untitled Course';
  const credits = course.credits !== undefined ? course.credits : null;
  const status = course.status || course.courseType || 'Core';
  const canonicalId =
    course.canonicalCourseId ||
    code.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchUsages = async () => {
      setLoadingUsages(true);
      try {
        const data = await adminCatalogueService.getCourseUsages(code);
        if (isMounted) {
          setUsages(data);
        }
      } catch (err) {
        console.warn('Error fetching course usages:', err);
      } finally {
        if (isMounted) setLoadingUsages(false);
      }
    };

    fetchUsages();
    return () => {
      isMounted = false;
    };
  }, [isOpen, code]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg">
                {code}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-semibold">
                Canonical Course
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ID: {canonicalId}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight pt-1">
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Specifications Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Course Code</span>
            <p className="font-mono font-bold text-white text-sm mt-0.5">{code}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Credits</span>
            <p className="font-bold text-amber-400 text-sm mt-0.5">
              {credits !== null ? `${credits} Credits` : 'N/A'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Classification</span>
            <p className="font-semibold text-emerald-400 text-sm mt-0.5">{status}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Accreditation</span>
            <p className="font-semibold text-indigo-400 text-sm mt-0.5 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Accredited</span>
            </p>
          </div>
        </div>

        {/* Canonical Architecture Notice */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-4 text-xs text-indigo-200">
          <div className="flex items-center gap-2 font-bold text-indigo-400">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span>Canonical Course Model</span>
          </div>
          <p className="text-[11px] text-indigo-300/80 mt-1 leading-relaxed">
            This course is defined once as a canonical entity (<code>{canonicalId}</code>) and shared
            across all degree programmes that require it. Editing its title or credits updates all
            programmes consistently without redundant duplicate documents.
          </p>
        </div>

        {/* Where is this course used? (Programme assignments) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Curriculum Placements ({usages.length} Programmes)
              </h4>
            </div>

            <button
              onClick={() => onAssignToAnotherProg(course)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Assign to another Programme</span>
            </button>
          </div>

          {loadingUsages ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <div className="h-4 w-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <span>Auditing programme assignments...</span>
            </div>
          ) : usages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/30 p-4 text-center text-xs text-slate-400">
              <p>This canonical course is not currently assigned to any active programme.</p>
              <button
                onClick={() => onAssignToAnotherProg(course)}
                className="mt-2 text-indigo-400 hover:underline font-semibold"
              >
                Assign to a Programme now
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/80 max-h-52 overflow-y-auto">
              {usages.map((u, i) => {
                const isCurrent =
                  currentProgramme &&
                  u.programmeId === currentProgramme.id &&
                  u.yearOfStudy === currentYear &&
                  u.semester === currentSemester;

                return (
                  <div
                    key={`${u.programmeId}_y${u.yearOfStudy}_s${u.semester}_${i}`}
                    className={`p-3.5 flex items-center justify-between gap-3 text-xs transition ${
                      isCurrent ? 'bg-indigo-950/30 border-l-2 border-indigo-500' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span className="font-semibold text-white">{u.programmeName}</span>
                        {isCurrent && (
                          <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 text-[9px] font-bold">
                            Current Term
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Year {u.yearOfStudy} • Semester {u.semester === 1 ? 'I' : u.semester === 2 ? 'II' : u.semester}
                        {' • '}
                        <span className="text-slate-300 font-medium">{u.credits} Credits</span>
                        {' • '}
                        <span className="text-emerald-400 font-medium">{u.status}</span>
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      {u.programmeId}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onEditCourse(course)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Course Info</span>
            </button>

            {currentProgramme && onRemoveFromThisProg && (
              <button
                onClick={() => onRemoveFromThisProg(course)}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/40 transition"
                title="Remove course from this programme and term only"
              >
                <MinusCircle className="h-3.5 w-3.5" />
                <span>Remove from this Term</span>
              </button>
            )}

            <button
              onClick={() => onDeleteCanonicalCourse(course)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-900/40 transition"
              title="Delete canonical course permanently (safely checked)"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Canonical Course</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
