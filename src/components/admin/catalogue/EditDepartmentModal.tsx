import React, { useState, useEffect, useId } from 'react';
import {
  X,
  Layers,
  Save,
  AlertCircle,
  CheckCircle2,
  Eye,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import { DepartmentRecord, AcademicUnitRecord } from '../../../types';
import { adminCatalogueService } from '../../../services/adminCatalogueService';

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: DepartmentRecord;
  unit?: AcademicUnitRecord | null;
  mode?: 'view' | 'edit';
  onDepartmentUpdated: (updated: DepartmentRecord) => void;
}

export const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({
  isOpen,
  onClose,
  department,
  unit,
  mode = 'edit',
  onDepartmentUpdated,
}) => {
  const formId = useId();
  const [currentMode, setCurrentMode] = useState<'view' | 'edit'>(mode);
  const [name, setName] = useState(department.name || '');
  const [code, setCode] = useState(department.code || department.shortName || '');
  const [description, setDescription] = useState(department.description || '');
  const [status, setStatus] = useState<'active' | 'archived' | 'inactive'>(
    department.archived ? 'archived' : department.status || (department.active === false ? 'inactive' : 'active')
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && department) {
      setCurrentMode(mode);
      setName(department.name || '');
      setCode(department.code || department.shortName || '');
      setDescription(department.description || '');
      setStatus(
        department.archived ? 'archived' : department.status || (department.active === false ? 'inactive' : 'active')
      );
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, department, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Department name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await adminCatalogueService.updateDepartment(department.id, {
        name: name.trim(),
        code: code.trim() || undefined,
        shortName: code.trim() || undefined,
        description: description.trim(),
        status,
        active: status === 'active',
        archived: status === 'archived',
      });

      if (!res.success || !res.department) {
        setErrorMessage(res.error || 'Failed to update department.');
        setSubmitting(false);
        return;
      }

      setSuccessMessage('Department updated successfully.');
      onDepartmentUpdated(res.department);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while updating the department.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              {currentMode === 'view' ? <Eye className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {currentMode === 'view' ? 'Department Details' : 'Edit Department'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ID: {department.id} {unit ? `• ${unit.shortName || unit.name}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentMode === 'view' && (
              <button
                type="button"
                onClick={() => setCurrentMode('edit')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {currentMode === 'view' ? (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-400">Department Name:</span>
                <span className="font-bold text-white text-right">{department.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-400">Parent Academic Unit:</span>
                <span className="font-semibold text-indigo-300">
                  {unit?.name || department.academicUnitId}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-400">Code / Short Name:</span>
                <span className="font-mono font-bold text-indigo-400">
                  {department.code || department.shortName || department.id}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    department.archived || department.status === 'archived'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                      : department.active === false || department.status === 'inactive'
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {department.archived || department.status === 'archived'
                    ? 'Archived'
                    : department.active === false || department.status === 'inactive'
                    ? 'Inactive'
                    : 'Active'}
                </span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-slate-400 block">Description / Notes:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  {department.description || 'Official department record in the university academic catalogue.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor={`${formId}-name`} className="block text-xs font-semibold text-slate-300">
                Department Name *
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Department of Mathematics"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor={`${formId}-code`} className="block text-xs font-semibold text-slate-300">
                  Code / Abbreviation
                </label>
                <input
                  id={`${formId}-code`}
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. MATH"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`${formId}-status`} className="block text-xs font-semibold text-slate-300">
                  Catalogue Status
                </label>
                <select
                  id={`${formId}-status`}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'archived' | 'inactive')}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`${formId}-desc`} className="block text-xs font-semibold text-slate-300">
                Description (Optional)
              </label>
              <textarea
                id={`${formId}-desc`}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Department details or notes..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center gap-2.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Preserves parent Academic Unit (<code className="text-indigo-400">{department.academicUnitId}</code>) and canonical ID (<code className="text-indigo-400">{department.id}</code>).
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
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
