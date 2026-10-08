import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Building,
  GraduationCap,
  Clock,
  Layers,
  BookOpen,
} from 'lucide-react';
import { DepartmentRecord, AcademicUnitRecord, ProgrammeRecord } from '../../../types';
import { adminCatalogueService } from '../../../services/adminCatalogueService';

interface AddProgrammeModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: DepartmentRecord;
  unit: AcademicUnitRecord;
  onProgrammeCreated: (programme: ProgrammeRecord) => void;
}

export const AddProgrammeModal: React.FC<AddProgrammeModalProps> = ({
  isOpen,
  onClose,
  department,
  unit,
  onProgrammeCreated,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [customId, setCustomId] = useState('');
  const [awardLevel, setAwardLevel] = useState('Bachelor Degree');
  const [durationYears, setDurationYears] = useState<number>(3);
  const [studyMode, setStudyMode] = useState('Full-Time');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeWarning, setCodeWarning] = useState<string | null>(null);
  const [nameWarning, setNameWarning] = useState<string | null>(null);

  // Auto-generate suggested ID slug from code or name
  useEffect(() => {
    if (code.trim()) {
      const slug = code
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setCustomId(slug);
    } else if (name.trim()) {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 30);
      setCustomId(slug);
    } else {
      setCustomId('');
    }
  }, [code, name]);

  // Debounced code uniqueness check
  useEffect(() => {
    if (!code.trim() || code.trim().length < 2) {
      setCodeWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await adminCatalogueService.checkProgrammeCodeExists(code);
      if (res.exists) {
        setCodeWarning(
          `Programme with code "${code.trim().toUpperCase()}" already exists (${res.conflictingProgramme?.name || res.conflictingProgramme?.id}).`
        );
      } else {
        setCodeWarning(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [code]);

  // Debounced name duplicate check within the department
  useEffect(() => {
    if (!name.trim() || name.trim().length < 3) {
      setNameWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await adminCatalogueService.checkProgrammeNameInDepartment(name, department.id);
      if (res.duplicate) {
        setNameWarning(`A programme named "${res.existingProgName}" already exists under ${department.name}.`);
      } else {
        setNameWarning(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [name, department.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a Programme Name.');
      return;
    }
    if (!code.trim()) {
      setError('Please provide a Programme Code / Short Name (e.g. "BSc CS").');
      return;
    }
    if (codeWarning) {
      setError('Please resolve the duplicate Programme Code issue before saving.');
      return;
    }

    setSaving(true);
    try {
      const res = await adminCatalogueService.createProgramme({
        id: customId || undefined,
        code: code.trim(),
        name: name.trim(),
        shortName: code.trim(),
        departmentId: department.id,
        academicUnitId: unit.id,
        durationYears: Number(durationYears) || 3,
        awardLevel,
        studyMode,
        status,
      });

      if (!res.success || !res.programme) {
        setError(res.error || 'Failed to create programme in Firestore.');
        setSaving(false);
        return;
      }

      onProgrammeCreated(res.programme);
      onClose();
    } catch (err: any) {
      console.error('Error in createProgramme:', err);
      setError(err?.message || 'An unexpected error occurred while saving the programme.');
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
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Add Academic Programme
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Register a new degree or diploma programme under {department.name}.
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
          {/* Department & Unit Context Badges */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Building className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Academic Unit:</span>
              <span className="font-semibold text-white">{unit.name} ({unit.shortName || unit.id})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Layers className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Department:</span>
              <span className="font-semibold text-white">{department.name}</span>
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

          {nameWarning && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3.5 text-xs text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="flex-1">{nameWarning}</span>
            </div>
          )}

          {/* Row 1: Programme Name */}
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
              placeholder="e.g. Bachelor of Science in Computer Science"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Row 2: Programme Code & Document ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="e.g. BSC CS or BARCH"
                className="w-full font-mono uppercase rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Document ID (Slug)</span>
                <span className="text-[10px] text-slate-500">Firestore Doc ID</span>
              </label>
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value.toLowerCase().replace(/[^a-z0-9_\-]+/g, '-'))}
                placeholder="e.g. bsc-cs"
                className="w-full font-mono rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-xs text-indigo-300 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Row 3: Award Level & Duration */}
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
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Duration</span>
                <span className="text-[10px] text-slate-500">1-7 Years</span>
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

          {/* Row 4: Status Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div>
              <p className="text-xs font-semibold text-white">Programme Status</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Active programmes are offered for enrolment in the academic catalogue.
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
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Programme...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Programme</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
