import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Archive,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Layers,
  GraduationCap,
  BookOpen,
  Users,
  FileText,
} from 'lucide-react';
import { AcademicUnitRecord } from '../../../types';
import {
  adminCatalogueService,
  AcademicUnitDependencyCheckResult,
} from '../../../services/adminCatalogueService';

interface DeleteAcademicUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: AcademicUnitRecord;
  onUnitArchived: (updated: AcademicUnitRecord) => void;
  onUnitDeleted: (deletedId: string) => void;
}

export const DeleteAcademicUnitModal: React.FC<DeleteAcademicUnitModalProps> = ({
  isOpen,
  onClose,
  unit,
  onUnitArchived,
  onUnitDeleted,
}) => {
  const [checkingDeps, setCheckingDeps] = useState(true);
  const [deps, setDeps] = useState<AcademicUnitDependencyCheckResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !unit) return;
    let isMounted = true;
    setCheckingDeps(true);
    setErrorMessage(null);

    adminCatalogueService
      .checkAcademicUnitDependencies(unit.id)
      .then((res) => {
        if (isMounted) {
          setDeps(res);
          setCheckingDeps(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err?.message || 'Error checking dependencies.');
          setCheckingDeps(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, unit]);

  if (!isOpen) return null;

  const handleArchive = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const isCurrentlyArchived = Boolean(unit.archived || unit.status === 'archived');
      const res = await adminCatalogueService.archiveAcademicUnit(unit.id, !isCurrentlyArchived);
      if (!res.success || !res.unit) {
        setErrorMessage(res.error || 'Failed to update archive status.');
        setSubmitting(false);
        return;
      }
      onUnitArchived(res.unit);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to archive academic unit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHardDelete = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await adminCatalogueService.deleteAcademicUnit(unit.id);
      if (!res.success) {
        setErrorMessage(res.error || 'Cannot delete academic unit.');
        if (res.dependencies) {
          setDeps(res.dependencies);
        }
        setSubmitting(false);
        return;
      }
      onUnitDeleted(unit.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error deleting academic unit.');
    } finally {
      setSubmitting(false);
    }
  };

  const isArchived = Boolean(unit.archived || unit.status === 'archived');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                deps?.hasDependencies
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {deps?.hasDependencies ? <Archive className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {deps?.hasDependencies ? 'Archive or Manage Academic Unit' : 'Delete Academic Unit'}
              </h3>
              <p className="text-xs text-slate-400">
                {unit.name} ({unit.shortName || unit.id})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {checkingDeps ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">
              Auditing dependent departments, programmes, courses, students, lecturers, and materials...
            </p>
          </div>
        ) : deps?.hasDependencies ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Hard Deletion Blocked — Active Dependencies Found</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                <strong>{unit.name}</strong> has dependent records in the VENUE catalogue. Hard-deleting this unit would orphan downstream academic records. You can safely <strong>Archive</strong> this unit instead.
              </p>
            </div>

            {/* Dependency Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">{deps.departmentCount}</div>
                  <div className="text-[10px] text-slate-400">Departments</div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center gap-2.5">
                <GraduationCap className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">{deps.programmeCount}</div>
                  <div className="text-[10px] text-slate-400">Programmes</div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-sky-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">{deps.courseCount}</div>
                  <div className="text-[10px] text-slate-400">Course Links</div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center gap-2.5">
                <Users className="h-4 w-4 text-purple-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">{deps.studentCount + deps.lecturerCount}</div>
                  <div className="text-[10px] text-slate-400">Students & Staff</div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">{deps.materialCount}</div>
                  <div className="text-[10px] text-slate-400">Materials</div>
                </div>
              </div>
            </div>

            {deps.sampleDepartments.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Dependent Departments ({deps.departmentCount}):
                </span>
                <p className="text-xs text-slate-300">
                  {deps.sampleDepartments.join(', ')}
                  {deps.departmentCount > deps.sampleDepartments.length ? '...' : ''}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchive}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 disabled:opacity-50 transition"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>
                  {submitting
                    ? 'Updating...'
                    : isArchived
                    ? 'Restore Academic Unit'
                    : 'Archive Academic Unit'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3.5 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                No dependent departments, programmes, courses, students, lecturers, or materials were found. This Academic Unit can be safely deleted or archived.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchive}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 transition"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>{isArchived ? 'Restore' : 'Archive Instead'}</span>
              </button>
              <button
                type="button"
                onClick={handleHardDelete}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 disabled:opacity-50 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{submitting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
