import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Archive,
  X,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  MinusCircle,
} from 'lucide-react';
import { CourseRecord, ProgrammeRecord } from '../../../types';
import {
  adminCatalogueService,
  CourseUsageRecord,
} from '../../../services/adminCatalogueService';

interface DeleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseRecord;
  programme?: ProgrammeRecord | null;
  year?: number | null;
  semester?: number | null;
  onCourseRemovedFromProg: (course: CourseRecord) => void;
  onCanonicalCourseDeleted: (course: CourseRecord) => void;
}

export const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({
  isOpen,
  onClose,
  course,
  programme,
  year,
  semester,
  onCourseRemovedFromProg,
  onCanonicalCourseDeleted,
}) => {
  const [deleteMode, setDeleteMode] = useState<'remove_from_term' | 'archive_canonical' | 'delete_canonical'>(
    programme ? 'remove_from_term' : 'archive_canonical'
  );
  const [usages, setUsages] = useState<CourseUsageRecord[]>([]);
  const [loadingUsages, setLoadingUsages] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const code = course.code || (course as any).courseCode || 'N/A';
  const title = course.title || (course as any).courseName || 'Untitled Course';
  const credits = course.credits || 12;
  const isArchived = Boolean(course.archived || (course as any).status === 'archived');

  useEffect(() => {
    if (isOpen) {
      setDeleteMode(programme ? 'remove_from_term' : 'archive_canonical');
      setErrorMessage(null);
      setLoadingUsages(true);

      adminCatalogueService
        .getCourseUsages(code)
        .then((data) => {
          setUsages(data);
        })
        .catch((err) => {
          console.warn('Error fetching course usages for deletion:', err);
        })
        .finally(() => {
          setLoadingUsages(false);
        });
    }
  }, [isOpen, course, programme, code]);

  if (!isOpen) return null;

  // Handle removing the course from this specific programme/term
  const handleRemoveFromProgramme = async () => {
    if (!programme) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await adminCatalogueService.removeCourseFromProgramme({
        programmeId: programme.id,
        code,
        canonicalCourseId: course.canonicalCourseId,
        yearOfStudy: Number(course.yearOfStudy || year || 1),
        semester: Number(course.semester || semester || 1),
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to remove course from programme.');
        setSubmitting(false);
        return;
      }

      onCourseRemovedFromProg(course);
      onClose();
    } catch (err: any) {
      console.error('Error removing course:', err);
      setErrorMessage(err?.message || 'Error removing course.');
      setSubmitting(false);
    }
  };

  // Handle archiving canonical course
  const handleArchiveCanonical = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await adminCatalogueService.archiveCanonicalCourse(code, !isArchived);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to archive canonical course.');
        setSubmitting(false);
        return;
      }
      onCourseRemovedFromProg({ ...course, archived: !isArchived });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error archiving canonical course.');
      setSubmitting(false);
    }
  };

  // Handle deleting the canonical course entirely
  const handleDeleteCanonical = async () => {
    if (usages.length > 0) {
      setErrorMessage(
        `Cannot delete canonical course: It is still assigned to ${usages.length} programme(s). You must unassign it from all programmes first or Archive it instead.`
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await adminCatalogueService.deleteCanonicalCourse(code);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to delete canonical course.');
        setSubmitting(false);
        return;
      }

      onCanonicalCourseDeleted(course);
      onClose();
    } catch (err: any) {
      console.error('Error deleting canonical course:', err);
      setErrorMessage(err?.message || 'Error deleting course.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-400">
                Safe Course Management
              </span>
              <span className="text-[10px] text-slate-400 font-semibold font-mono">
                {code}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Remove, Archive, or Delete Course
            </h3>
            <p className="text-xs text-slate-400">
              {title} • {credits} Credits
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-rose-300 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <p className="leading-relaxed flex-1">{errorMessage}</p>
          </div>
        )}

        {/* Deletion Mode Selector */}
        <div className={`grid ${programme ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800`}>
          {programme && (
            <button
              type="button"
              onClick={() => setDeleteMode('remove_from_term')}
              className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold transition ${
                deleteMode === 'remove_from_term'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Remove from Term
            </button>
          )}
          <button
            type="button"
            onClick={() => setDeleteMode('archive_canonical')}
            className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold transition ${
              deleteMode === 'archive_canonical'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isArchived ? 'Restore Course' : 'Archive Course'}
          </button>
          <button
            type="button"
            onClick={() => setDeleteMode('delete_canonical')}
            className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold transition ${
              deleteMode === 'delete_canonical'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Delete Canonical
          </button>
        </div>

        {/* Option 1: Remove from this term only */}
        {deleteMode === 'remove_from_term' && programme && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <MinusCircle className="h-4 w-4 shrink-0" />
                <span>Unassign from {programme.shortName || programme.name}</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                This will remove the relationship <strong>{programme.shortName || programme.id} ↔ {code}</strong> from Year {course.yearOfStudy || year || 1}, Semester {course.semester || semester || 1}.
              </p>
              <p className="text-[11px] text-emerald-400/90 leading-relaxed font-semibold">
                ✓ The canonical course record ({code}) and its assignment to other programmes remain untouched.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRemoveFromProgramme}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 transition disabled:opacity-50"
              >
                <MinusCircle className="h-4 w-4" />
                <span>{submitting ? 'Removing...' : 'Remove from Term'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Option 2: Archive Canonical Course */}
        {deleteMode === 'archive_canonical' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 text-xs text-indigo-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-300">
                <Archive className="h-4 w-4 shrink-0" />
                <span>{isArchived ? 'Restore Canonical Course' : 'Archive Canonical Course'}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Archiving marks <strong>{code} ({title})</strong> as inactive for new placements while preserving all existing programme curricula and historical student records.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleArchiveCanonical}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition disabled:opacity-50"
              >
                <Archive className="h-4 w-4" />
                <span>{submitting ? 'Updating...' : isArchived ? 'Restore Course' : 'Archive Canonical Course'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Option 3: Delete canonical record permanently */}
        {deleteMode === 'delete_canonical' && (
          <div className="space-y-4">
            {loadingUsages ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <div className="h-4 w-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                <span>Auditing active programme assignments...</span>
              </div>
            ) : usages.length > 0 ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 text-xs text-rose-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-300">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>Deletion Blocked: Course in Active Use ({usages.length} Programmes)</span>
                  </div>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed">
                    Under the Canonical Architecture, a canonical course cannot be hard-deleted while assigned to degree programmes. You can <strong>Archive</strong> it instead or unassign it from all programmes first.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Currently Assigned To:
                  </span>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/80 max-h-40 overflow-y-auto">
                    {usages.map((u, i) => (
                      <div key={i} className="p-3 text-xs flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-semibold text-white">
                            <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                            <span>{u.programmeName}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Year {u.yearOfStudy} • Semester {u.semester === 1 ? 'I' : 'II'} ({u.status})
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {u.programmeId}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleArchiveCanonical}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 transition"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    <span>Archive Course Instead</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-200 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-300">Safe to Delete Canonical Record</p>
                    <p className="text-[11px] mt-0.5 leading-relaxed">
                      <strong>{code}</strong> is not currently assigned to any degree programme in the catalogue. You may permanently delete it.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteCanonical}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{submitting ? 'Deleting...' : 'Delete Canonical Course'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
