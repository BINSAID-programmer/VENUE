import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  AlertCircle,
  AlertTriangle,
  Building,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { ProgrammeRecord, DepartmentRecord, AcademicUnitRecord } from '../../../types';
import { adminCatalogueService } from '../../../services/adminCatalogueService';

interface EditProgrammeModalProps {
  isOpen: boolean;
  onClose: () => void;
  programme: ProgrammeRecord;
  department?: DepartmentRecord | null;
  unit?: AcademicUnitRecord | null;
  onProgrammeUpdated: (updated: ProgrammeRecord) => void;
}

export const EditProgrammeModal: React.FC<EditProgrammeModalProps> = ({
  isOpen,
  onClose,
  programme,
  department,
  unit,
  onProgrammeUpdated,
}) => {
  const [name, setName] = useState(programme.name);
  const [code, setCode] = useState(programme.code || programme.shortName || '');
  const [awardLevel, setAwardLevel] = useState(programme.awardLevel || 'Bachelor Degree');
  const [durationYears, setDurationYears] = useState<number>(programme.durationYears || 3);
  const [studyMode, setStudyMode] = useState(programme.studyMode || 'Full-Time');
  const [status, setStatus] = useState<'active' | 'inactive'>(
    programme.active !== false ? 'active' : 'inactive'
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeWarning, setCodeWarning] = useState<string | null>(null);
  const [showConfirmNotice, setShowConfirmNotice] = useState(false);

  // Sync state if programme prop changes
  useEffect(() => {
    setName(programme.name);
    setCode(programme.code || programme.shortName || '');
    setAwardLevel(programme.awardLevel || 'Bachelor Degree');
    setDurationYears(programme.durationYears || 3);
    setStudyMode(programme.studyMode || 'Full-Time');
    setStatus(programme.active !== false ? 'active' : 'inactive');
    setError(null);
    setCodeWarning(null);
    setShowConfirmNotice(false);
  }, [programme, isOpen]);

  // Debounced code uniqueness check (excluding current programme ID)
  useEffect(() => {
    if (!code.trim() || code.trim().toUpperCase() === (programme.code || programme.shortName || '').toUpperCase()) {
      setCodeWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await adminCatalogueService.checkProgrammeCodeExists(code, programme.id);
      if (res.exists) {
        setCodeWarning(
          `Programme with code "${code.trim().toUpperCase()}" already exists (${res.conflictingProgramme?.name || res.conflictingProgramme?.id}).`
        );
      } else {
        setCodeWarning(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [code, programme.id, programme.code, programme.shortName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Programme name cannot be empty.');
      return;
    }
    if (!code.trim()) {
      setError('Programme code cannot be empty.');
      return;
    }
    if (codeWarning) {
      setError('Please resolve code uniqueness conflict before saving.');
      return;
    }

    // Check if significant changes were made (e.g. duration change) and prompt confirmation
    const durationChanged = durationYears !== (programme.durationYears || 3);
    if (durationChanged && !showConfirmNotice) {
      setShowConfirmNotice(true);
      return;
    }

    setSaving(true);
    try {
      const res = await adminCatalogueService.updateProgramme(programme.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        shortName: code.trim(),
        awardLevel,
        durationYears: Number(durationYears),
        studyMode,
        active: status === 'active',
        status,
      });

      if (!res.success || !res.programme) {
        setError(res.error || 'Failed to update programme.');
        setSaving(false);
        return;
      }

      onProgrammeUpdated(res.programme);
      onClose();
    } catch (err: any) {
      console.error('Error in updateProgramme:', err);
      setError(err?.message || 'Failed to update programme in Firestore.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Save className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Edit Academic Programme
                </h3>
                <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-400 border border-slate-700">
                  {programme.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Update programme attributes while preserving document integrity and relationships.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Read-only Document ID & Relationship Badge */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span>Stable ID:</span>
              <code className="text-indigo-400 font-mono font-semibold">{programme.id}</code>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Department:</span>
              <span className="text-white font-medium">{department?.name || programme.departmentId}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Unit:</span>
              <span className="text-white font-medium">{unit?.shortName || programme.academicUnitId}</span>
            </div>
          </div>

          {/* Error & Warning Banners */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {codeWarning && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{codeWarning}</span>
            </div>
          )}

          {showConfirmNotice && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Notice: Programme Duration Modified</span>
              </div>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                You changed the duration from <strong>{programme.durationYears || 3} Years</strong> to{' '}
                <strong>{durationYears} Years</strong>. This adjusts the Year and Semester structure
                available for this programme. Click <strong>Confirm & Save Changes</strong> below to proceed.
              </p>
            </div>
          )}

          {/* Programme Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Programme Name *</span>
              <span className="text-[10px] text-slate-500">Official Degree Title</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Programme Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Programme Code / Short Name *</span>
              <span className="text-[10px] text-slate-500">Unique Code</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full font-mono uppercase rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Award Level, Duration, Study Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Award / Qualification
              </label>
              <select
                value={awardLevel}
                onChange={(e) => setAwardLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              >
                <option value="Bachelor Degree">Bachelor Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctor of Philosophy (PhD)">PhD / Doctorate</option>
                <option value="Postgraduate Diploma">Postgraduate Diploma</option>
                <option value="Ordinary Diploma">Ordinary Diploma</option>
                <option value="Certificate">Certificate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Duration (Years)
              </label>
              <select
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              >
                <option value={1}>1 Year (2 Semesters)</option>
                <option value={2}>2 Years (4 Semesters)</option>
                <option value={3}>3 Years (6 Semesters)</option>
                <option value={4}>4 Years (8 Semesters)</option>
                <option value={5}>5 Years (10 Semesters)</option>
                <option value={6}>6 Years (12 Semesters)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Study Mode
              </label>
              <select
                value={studyMode}
                onChange={(e) => setStudyMode(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Evening">Evening</option>
                <option value="Online">Online / Distance</option>
              </select>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div>
              <p className="text-xs font-semibold text-white">Programme Status</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Active programmes appear in student degree selection and academic planners.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  status === 'active' ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    status === 'active' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-slate-300 capitalize min-w-[50px]">
                {status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || Boolean(codeWarning)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : showConfirmNotice ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm & Save Changes</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
