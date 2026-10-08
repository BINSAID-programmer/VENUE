import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Archive,
  AlertTriangle,
  X,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Users,
  FileText,
  Briefcase,
} from 'lucide-react';
import { ProgrammeRecord, DepartmentRecord } from '../../../types';
import { adminCatalogueService, ProgrammeDependencyCheckResult } from '../../../services/adminCatalogueService';

interface DeleteProgrammeModalProps {
  isOpen: boolean;
  onClose: () => void;
  programme: ProgrammeRecord;
  department?: DepartmentRecord | null;
  onProgrammeDeleted: (deletedId: string) => void;
  onProgrammeUpdated?: (updated: ProgrammeRecord) => void;
}

export const DeleteProgrammeModal: React.FC<DeleteProgrammeModalProps> = ({
  isOpen,
  onClose,
  programme,
  department,
  onProgrammeDeleted,
  onProgrammeUpdated,
}) => {
  const [checking, setChecking] = useState(true);
  const [depResult, setDepResult] = useState<ProgrammeDependencyCheckResult | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setConfirmInput('');
      setError(null);
      return;
    }

    const checkDeps = async () => {
      setChecking(true);
      setError(null);
      try {
        const res = await adminCatalogueService.checkProgrammeDependencies(programme.id);
        setDepResult(res);
      } catch (err: any) {
        console.warn('Dependency check error:', err);
        setError('Could not complete dependency audit. Proceeding with caution.');
      } finally {
        setChecking(false);
      }
    };

    checkDeps();
  }, [isOpen, programme.id]);

  if (!isOpen) return null;

  const targetCode = (programme.code || programme.shortName || programme.id).toUpperCase();
  const isCodeConfirmed = confirmInput.trim().toUpperCase() === targetCode;
  const hasBlocker = Boolean(depResult?.hasDependencies);
  const isArchived = Boolean(programme.archived || programme.status === 'archived');

  const handleArchive = async () => {
    setArchiving(true);
    setError(null);
    try {
      const res = await adminCatalogueService.archiveProgramme(programme.id, !isArchived);
      if (!res.success || !res.programme) {
        setError(res.error || 'Failed to archive programme.');
        setArchiving(false);
        return;
      }
      if (onProgrammeUpdated) {
        onProgrammeUpdated(res.programme);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to archive programme.');
    } finally {
      setArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (hasBlocker) {
      setError('Deletion blocked: Dependent courses, students, or materials exist. Please Archive this programme instead.');
      return;
    }
    if (!isCodeConfirmed) {
      setError(`Please type "${targetCode}" to confirm deletion.`);
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      const res = await adminCatalogueService.deleteProgramme(
        programme.id,
        programme.departmentId
      );

      if (!res.success) {
        setError(res.error || 'Failed to delete programme from Firestore.');
        setDeleting(false);
        return;
      }

      onProgrammeDeleted(programme.id);
      onClose();
    } catch (err: any) {
      console.error('Delete programme error:', err);
      setError(err?.message || 'Failed to delete programme.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                hasBlocker
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {hasBlocker ? <Archive className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {hasBlocker ? 'Archive or Manage Programme' : 'Delete Academic Programme'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Dependency & Curriculum Integrity Check
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-xs">
          {/* Programme Summary Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>Programme Name:</span>
              <span className="font-bold text-white text-right max-w-[240px] truncate">
                {programme.name}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Programme Code:</span>
              <span className="font-mono font-bold text-indigo-400">
                {programme.code || programme.shortName || programme.id}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Department:</span>
              <span className="text-slate-300 font-medium truncate max-w-[220px]">
                {department?.name || programme.departmentId}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Duration:</span>
              <span className="text-slate-300 font-medium">
                {programme.durationYears || 3} Academic Years
              </span>
            </div>
          </div>

          {/* Dependency Audit State */}
          {checking ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center gap-3 text-slate-400">
              <div className="h-4 w-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin shrink-0" />
              <span>Auditing academic dependencies (courses, students, materials, career mappings)...</span>
            </div>
          ) : hasBlocker ? (
            /* Dangerous Cascading Delete Prevention -> Offer Archive */
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
              <div className="flex items-start gap-2 text-amber-300 font-bold">
                <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p>Hard Deletion Blocked: Dependent Records Exist</p>
                  <p className="text-[11px] font-normal text-amber-200/90 mt-0.5 leading-relaxed">
                    This programme has active dependencies in VENUE. Instead of destructive deletion, you can <strong>Archive</strong> this programme so it no longer appears for new student placement or material assignment while preserving all historical records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">{depResult?.totalCourses || 0}</div>
                    <div className="text-[10px] text-slate-400">Courses</div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">{depResult?.studentCount || 0}</div>
                    <div className="text-[10px] text-slate-400">Students</div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">{depResult?.materialCount || 0}</div>
                    <div className="text-[10px] text-slate-400">Materials</div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">{depResult?.careerCount || 0}</div>
                    <div className="text-[10px] text-slate-400">Careers</div>
                  </div>
                </div>
              </div>

              {depResult?.sampleCourses && depResult.sampleCourses.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-slate-950/60 p-2.5 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">
                    Sample Linked Courses ({depResult.totalCourses}):
                  </p>
                  {depResult.sampleCourses.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="font-mono font-medium text-white">{c.code}</span>
                      <span className="truncate max-w-[180px] text-slate-400">{c.title}</span>
                      <span className="text-[10px] text-slate-500">Y{c.year}S{c.semester}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Safe to delete notice */
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex items-start gap-2.5 text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">0 Dependent Records Found</p>
                <p className="text-[11px] text-emerald-300/90 mt-0.5">
                  This programme has no attached courses, students, or materials. It can be safely deleted or archived.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Confirmation Input Guard */}
          {!hasBlocker && !checking && (
            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-300 leading-normal block">
                To confirm permanent deletion, type the programme code{' '}
                <strong className="text-rose-400 font-mono">{targetCode}</strong> below:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={`Type "${targetCode}" to confirm`}
                className="w-full font-mono uppercase rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting || archiving}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleArchive}
            disabled={checking || deleting || archiving}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 transition disabled:opacity-50"
          >
            <Archive className="h-4 w-4" />
            <span>
              {archiving
                ? 'Updating...'
                : isArchived
                ? 'Restore Programme'
                : 'Archive Programme'}
            </span>
          </button>

          {!hasBlocker && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || archiving || hasBlocker || !isCodeConfirmed || checking}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              <span>{deleting ? 'Deleting...' : 'Delete Permanently'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
