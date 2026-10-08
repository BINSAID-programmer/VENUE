import React, { useState, useEffect, useId } from 'react';
import {
  X,
  Building,
  Save,
  AlertCircle,
  CheckCircle2,
  Eye,
  Edit2,
  Archive,
  ShieldCheck,
} from 'lucide-react';
import { AcademicUnitRecord, AcademicUnitType } from '../../../types';
import { adminCatalogueService } from '../../../services/adminCatalogueService';

interface EditAcademicUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: AcademicUnitRecord;
  mode?: 'view' | 'edit';
  onUnitUpdated: (updated: AcademicUnitRecord) => void;
}

export const EditAcademicUnitModal: React.FC<EditAcademicUnitModalProps> = ({
  isOpen,
  onClose,
  unit,
  mode = 'edit',
  onUnitUpdated,
}) => {
  const formId = useId();
  const [currentMode, setCurrentMode] = useState<'view' | 'edit'>(mode);
  const [name, setName] = useState(unit.name || '');
  const [type, setType] = useState<AcademicUnitType>(unit.type || 'College');
  const [shortName, setShortName] = useState(unit.shortName || unit.abbreviation || '');
  const [description, setDescription] = useState(unit.description || '');
  const [status, setStatus] = useState<'active' | 'archived' | 'inactive'>(
    unit.archived ? 'archived' : unit.status || (unit.active === false ? 'inactive' : 'active')
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && unit) {
      setCurrentMode(mode);
      setName(unit.name || '');
      setType(unit.type || 'College');
      setShortName(unit.shortName || unit.abbreviation || '');
      setDescription(unit.description || '');
      setStatus(unit.archived ? 'archived' : unit.status || (unit.active === false ? 'inactive' : 'active'));
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, unit, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Academic Unit name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await adminCatalogueService.updateAcademicUnit(unit.id, {
        name: name.trim(),
        type,
        shortName: shortName.trim() || undefined,
        description: description.trim(),
        status,
        active: status === 'active',
        archived: status === 'archived',
      });

      if (!res.success || !res.unit) {
        setErrorMessage(res.error || 'Failed to update academic unit.');
        setSubmitting(false);
        return;
      }

      setSuccessMessage('Academic Unit updated successfully.');
      onUnitUpdated(res.unit);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while updating the academic unit.');
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
              {currentMode === 'view' ? <Eye className="h-5 w-5" /> : <Building className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {currentMode === 'view' ? 'Academic Unit Details' : 'Edit Academic Unit'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">ID: {unit.id}</p>
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
                <span className="text-slate-400">Unit Name:</span>
                <span className="font-bold text-white text-right">{unit.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-400">Classification Type:</span>
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300">
                  {unit.type || 'College'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-400">Short Name / Code:</span>
                <span className="font-mono font-bold text-indigo-400">{unit.shortName || unit.abbreviation || unit.id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-400">University ID:</span>
                <span className="font-mono text-slate-300 uppercase">{unit.universityId || 'udsm'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    unit.archived || unit.status === 'archived'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                      : unit.active === false || unit.status === 'inactive'
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {unit.archived || unit.status === 'archived'
                    ? 'Archived'
                    : unit.active === false || unit.status === 'inactive'
                    ? 'Inactive'
                    : 'Active'}
                </span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-slate-400 block">Description / Notes:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  {unit.description || 'Official accredited academic unit in the university catalogue.'}
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
                Academic Unit Name *
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. College of Natural and Applied Sciences"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor={`${formId}-type`} className="block text-xs font-semibold text-slate-300">
                  Unit Classification *
                </label>
                <select
                  id={`${formId}-type`}
                  value={type}
                  onChange={(e) => setType(e.target.value as AcademicUnitType)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="College">College</option>
                  <option value="School">School</option>
                  <option value="Institute">Institute</option>
                  <option value="Constituent College">Constituent College</option>
                  <option value="Centre">Centre</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`${formId}-short`} className="block text-xs font-semibold text-slate-300">
                  Short Name / Abbreviation
                </label>
                <input
                  id={`${formId}-short`}
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. CoNAS"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
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
                <option value="active">Active (Visible in Student & Material Placement)</option>
                <option value="archived">Archived (Hidden from new placements, preserves history)</option>
                <option value="inactive">Inactive</option>
              </select>
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
                placeholder="Notes or details regarding this Academic Unit..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center gap-2.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Editing updates the existing canonical record (<code className="text-indigo-400">{unit.id}</code>) in place without creating duplicates.
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
