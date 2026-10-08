import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Layers,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  Edit2,
  Trash2,
  Save,
  X,
  Lock,
} from 'lucide-react';
import { ProgrammeRecord, ProgrammeYearConfig, ProgrammeSemesterConfig } from '../../../types';
import { adminCatalogueService } from '../../../services/adminCatalogueService';

interface ProgrammeStructureManagerProps {
  programme: ProgrammeRecord;
  onSelectTerm: (year: number, semester: number) => void;
  onDurationUpdated: (newDuration: number) => void;
}

export const ProgrammeStructureManager: React.FC<ProgrammeStructureManagerProps> = ({
  programme,
  onSelectTerm,
  onDurationUpdated,
}) => {
  const [structure, setStructure] = useState<ProgrammeYearConfig[]>(() =>
    adminCatalogueService.getProgrammeYearStructure(programme)
  );
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Term course counts state
  const [termStats, setTermStats] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  // Modal / Inline Edit States
  const [addingYearOpen, setAddingYearOpen] = useState(false);
  const [newYearNum, setNewYearNum] = useState<number>(structure.length + 1);
  const [newYearLabel, setNewYearLabel] = useState<string>(`Year ${structure.length + 1}`);

  const [editingYearNum, setEditingYearNum] = useState<number | null>(null);
  const [editingYearLabel, setEditingYearLabel] = useState<string>('');

  const [addingSemYearNum, setAddingSemYearNum] = useState<number | null>(null);
  const [newSemNum, setNewSemNum] = useState<number>(3);
  const [newSemLabel, setNewSemLabel] = useState<string>('Semester 3');

  const [editingSemKey, setEditingSemKey] = useState<string | null>(null); // "y1_s1"
  const [editingSemLabel, setEditingSemLabel] = useState<string>('');

  useEffect(() => {
    setStructure(adminCatalogueService.getProgrammeYearStructure(programme));
  }, [programme]);

  useEffect(() => {
    let isMounted = true;
    const loadAllTermStats = async () => {
      setLoadingStats(true);
      const counts: Record<string, number> = {};

      try {
        for (const y of structure) {
          for (const s of y.semesters) {
            const courses = await adminCatalogueService.getCoursesByTerm(
              programme.id,
              y.yearNumber,
              s.semesterNumber
            );
            if (isMounted) {
              counts[`y${y.yearNumber}_s${s.semesterNumber}`] = courses.length;
            }
          }
        }
        if (isMounted) {
          setTermStats(counts);
        }
      } catch (err) {
        console.warn('Could not load term course counts:', err);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };

    loadAllTermStats();
    return () => {
      isMounted = false;
    };
  }, [programme.id, structure]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // 1. ADD YEAR HANDLER
  const handleAddYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate duplicate year
    if (structure.some((y) => y.yearNumber === Number(newYearNum))) {
      setError(`Year ${newYearNum} already exists in this programme.`);
      return;
    }

    setUpdating(true);
    try {
      const res = await adminCatalogueService.addProgrammeYear(
        programme.id,
        Number(newYearNum),
        newYearLabel.trim()
      );
      if (!res.success || !res.updatedProgramme) {
        setError(res.error || 'Failed to add academic year.');
        return;
      }

      setStructure(adminCatalogueService.getProgrammeYearStructure(res.updatedProgramme));
      onDurationUpdated(res.updatedProgramme.durationYears);
      setAddingYearOpen(false);
      showNotification(`Added ${newYearLabel} to programme.`);
    } catch (err: any) {
      setError(err?.message || 'Error adding year.');
    } finally {
      setUpdating(false);
    }
  };

  // 2. EDIT YEAR HANDLER
  const handleSaveYearLabel = async (yearNumber: number) => {
    if (!editingYearLabel.trim()) return;
    setError(null);
    setUpdating(true);

    try {
      const res = await adminCatalogueService.editProgrammeYear(
        programme.id,
        yearNumber,
        editingYearLabel.trim()
      );
      if (!res.success || !res.updatedProgramme) {
        setError(res.error || 'Failed to edit year label.');
        return;
      }

      setStructure(adminCatalogueService.getProgrammeYearStructure(res.updatedProgramme));
      setEditingYearNum(null);
      showNotification(`Updated Year ${yearNumber} label.`);
    } catch (err: any) {
      setError(err?.message || 'Error updating year label.');
    } finally {
      setUpdating(false);
    }
  };

  // 3. DELETE YEAR HANDLER
  const handleDeleteYear = async (yearNumber: number) => {
    setError(null);
    const yr = structure.find((y) => y.yearNumber === yearNumber);
    if (!yr) return;

    // Check if courses are attached
    const totalYearCourses = yr.semesters.reduce((sum, s) => {
      return sum + (termStats[`y${yearNumber}_s${s.semesterNumber}`] || 0);
    }, 0);

    if (totalYearCourses > 0) {
      setError(
        `Cannot delete ${yr.label || `Year ${yearNumber}`}: It currently contains ${totalYearCourses} registered courses. Please reassign or delete these courses first to safeguard academic records.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete ${yr.label || `Year ${yearNumber}`} from this programme?`)) {
      return;
    }

    setUpdating(true);
    try {
      const res = await adminCatalogueService.deleteProgrammeYear(programme.id, yearNumber);
      if (!res.success || !res.updatedProgramme) {
        setError(res.error || 'Failed to delete year.');
        return;
      }

      setStructure(adminCatalogueService.getProgrammeYearStructure(res.updatedProgramme));
      onDurationUpdated(res.updatedProgramme.durationYears);
      showNotification(`Deleted Year ${yearNumber} from programme.`);
    } catch (err: any) {
      setError(err?.message || 'Error deleting year.');
    } finally {
      setUpdating(false);
    }
  };

  // 4. ADD SEMESTER HANDLER
  const handleAddSemesterSubmit = async (e: React.FormEvent, yearNumber: number) => {
    e.preventDefault();
    setError(null);

    const targetYear = structure.find((y) => y.yearNumber === yearNumber);
    if (!targetYear) return;

    if (targetYear.semesters.some((s) => s.semesterNumber === Number(newSemNum))) {
      setError(`Semester ${newSemNum} already exists in Year ${yearNumber}.`);
      return;
    }

    setUpdating(true);
    try {
      const res = await adminCatalogueService.addProgrammeSemester(
        programme.id,
        yearNumber,
        Number(newSemNum),
        newSemLabel.trim()
      );
      if (!res.success || !res.updatedProgramme) {
        setError(res.error || 'Failed to add semester.');
        return;
      }

      setStructure(adminCatalogueService.getProgrammeYearStructure(res.updatedProgramme));
      setAddingSemYearNum(null);
      showNotification(`Added ${newSemLabel} to Year ${yearNumber}.`);
    } catch (err: any) {
      setError(err?.message || 'Error adding semester.');
    } finally {
      setUpdating(false);
    }
  };

  // 5. EDIT SEMESTER HANDLER
  const handleSaveSemesterLabel = async (yearNumber: number, semesterNumber: number) => {
    if (!editingSemLabel.trim()) return;
    setError(null);
    setUpdating(true);

    try {
      const res = await adminCatalogueService.editProgrammeSemester(
        programme.id,
        yearNumber,
        semesterNumber,
        editingSemLabel.trim()
      );
      if (!res.success || !res.updatedProgramme) {
        setError(res.error || 'Failed to edit semester label.');
        return;
      }

      setStructure(adminCatalogueService.getProgrammeYearStructure(res.updatedProgramme));
      setEditingSemKey(null);
      showNotification(`Updated semester label.`);
    } catch (err: any) {
      setError(err?.message || 'Error updating semester label.');
    } finally {
      setUpdating(false);
    }
  };

  // 6. DELETE SEMESTER HANDLER
  const handleDeleteSemester = async (yearNumber: number, semesterNumber: number) => {
    setError(null);
    const count = termStats[`y${yearNumber}_s${semesterNumber}`] || 0;
    if (count > 0) {
      setError(
        `Cannot delete Semester ${semesterNumber} in Year ${yearNumber}: It has ${count} registered courses in the catalogue. Please reassign or delete the courses first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete Semester ${semesterNumber} from Year ${yearNumber}?`)) {
      return;
    }

    setUpdating(true);
    try {
      const res = await adminCatalogueService.deleteProgrammeSemester(
        programme.id,
        yearNumber,
        semesterNumber
      );
      if (!res.success || !res.updatedProgramme) {
        setError(res.error || 'Failed to delete semester.');
        return;
      }

      setStructure(adminCatalogueService.getProgrammeYearStructure(res.updatedProgramme));
      showNotification(`Deleted Semester ${semesterNumber} from Year ${yearNumber}.`);
    } catch (err: any) {
      setError(err?.message || 'Error deleting semester.');
    } finally {
      setUpdating(false);
    }
  };

  const totalSemestersCount = structure.reduce((sum, y) => sum + y.semesters.length, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Year & Semester Structure Management
              </h3>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400">
                {structure.length} Years / {totalSemestersCount} Semesters
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Manage the accredited stages, semesters, and curriculum schedule for {programme.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => {
                const nextNum = structure.length + 1;
                setNewYearNum(nextNum);
                setNewYearLabel(`Year ${nextNum}`);
                setAddingYearOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Year</span>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Summary Info Cards */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
            <p className="text-slate-500 text-[11px]">Academic Years</p>
            <p className="text-white font-bold text-sm mt-0.5">{structure.length} Years</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
            <p className="text-slate-500 text-[11px]">Total Semesters</p>
            <p className="text-indigo-400 font-bold text-sm mt-0.5">{totalSemestersCount} Semesters</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
            <p className="text-slate-500 text-[11px]">Study Mode</p>
            <p className="text-white font-bold text-sm mt-0.5">{programme.studyMode || 'Full-Time'}</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
            <p className="text-slate-500 text-[11px]">Qualification</p>
            <p className="text-emerald-400 font-bold text-sm mt-0.5 truncate">{programme.awardLevel || 'Bachelor Degree'}</p>
          </div>
        </div>
      </div>

      {/* Add Year Modal */}
      {addingYearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Add Academic Year</h4>
              <button
                onClick={() => setAddingYearOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddYearSubmit} className="mt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Year Number *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={7}
                  value={newYearNum}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setNewYearNum(val);
                    setNewYearLabel(`Year ${val}`);
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Year Label</label>
                <input
                  type="text"
                  required
                  value={newYearLabel}
                  onChange={(e) => setNewYearLabel(e.target.value)}
                  placeholder="e.g. Year 4 or Fourth Year (Internship)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Adding this year will initialize Semester 1 and Semester 2 by default. You can customize them afterwards.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddingYearOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-slate-300 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Year</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Year-by-Year Cards */}
      <div className="space-y-5">
        {structure.map((yearConfig) => {
          const isEditingYear = editingYearNum === yearConfig.yearNumber;

          return (
            <div
              key={yearConfig.yearNumber}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4"
            >
              {/* Year Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono font-bold text-indigo-400">
                    Y{yearConfig.yearNumber}
                  </div>

                  {isEditingYear ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingYearLabel}
                        onChange={(e) => setEditingYearLabel(e.target.value)}
                        className="rounded-lg border border-indigo-500 bg-slate-950 px-2.5 py-1 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveYearLabel(yearConfig.yearNumber)}
                        className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
                        title="Save Label"
                      >
                        <Save className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingYearNum(null)}
                        className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {yearConfig.label || `Year ${yearConfig.yearNumber}`}
                        </h4>
                        <button
                          onClick={() => {
                            setEditingYearNum(yearConfig.yearNumber);
                            setEditingYearLabel(yearConfig.label || `Year ${yearConfig.yearNumber}`);
                          }}
                          className="text-slate-500 hover:text-indigo-400 p-0.5"
                          title="Edit Year Label"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Academic stage {yearConfig.yearNumber} with {yearConfig.semesters.length} scheduled terms
                      </p>
                    </div>
                  )}
                </div>

                {/* Year Actions */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      const nextSem = (yearConfig.semesters[yearConfig.semesters.length - 1]?.semesterNumber || 0) + 1;
                      setNewSemNum(nextSem);
                      setNewSemLabel(`Semester ${nextSem}`);
                      setAddingSemYearNum(yearConfig.yearNumber);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                    title="Add a semester to this Year"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Semester</span>
                  </button>

                  <button
                    onClick={() => handleDeleteYear(yearConfig.yearNumber)}
                    className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/30 transition"
                    title="Delete this Academic Year"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Add Semester Form (Inline Drawer) */}
              {addingSemYearNum === yearConfig.yearNumber && (
                <div className="rounded-xl border border-indigo-500/30 bg-slate-950/80 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Add Semester to {yearConfig.label || `Year ${yearConfig.yearNumber}`}</span>
                    <button
                      onClick={() => setAddingSemYearNum(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => handleAddSemesterSubmit(e, yearConfig.yearNumber)}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <label className="text-slate-400">Semester Number *</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        required
                        value={newSemNum}
                        onChange={(e) => {
                          const num = Number(e.target.value);
                          setNewSemNum(num);
                          setNewSemLabel(`Semester ${num}`);
                        }}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-slate-400">Semester Label *</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={newSemLabel}
                          onChange={(e) => setNewSemLabel(e.target.value)}
                          placeholder="e.g. Semester 3 or Practical Training"
                          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white"
                        />
                        <button
                          type="submit"
                          disabled={updating}
                          className="rounded-lg bg-indigo-600 px-3.5 py-1.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Semesters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {yearConfig.semesters.map((sem) => {
                  const semKey = `y${yearConfig.yearNumber}_s${sem.semesterNumber}`;
                  const isEditingSem = editingSemKey === semKey;
                  const courseCount = termStats[semKey];

                  return (
                    <div
                      key={sem.semesterNumber}
                      className="group rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-indigo-500/40 hover:bg-slate-950/90 flex flex-col justify-between"
                    >
                      <div>
                        {/* Semester Header */}
                        <div className="flex items-center justify-between gap-2">
                          {isEditingSem ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="text"
                                value={editingSemLabel}
                                onChange={(e) => setEditingSemLabel(e.target.value)}
                                className="w-full rounded border border-indigo-500 bg-slate-900 px-2 py-0.5 text-xs text-white"
                              />
                              <button
                                onClick={() => handleSaveSemesterLabel(yearConfig.yearNumber, sem.semesterNumber)}
                                className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
                              >
                                <Save className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => setEditingSemKey(null)}
                                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {sem.label || `Semester ${sem.semesterNumber}`}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingSemKey(semKey);
                                  setEditingSemLabel(sem.label || `Semester ${sem.semesterNumber}`);
                                }}
                                className="text-slate-500 hover:text-indigo-400"
                                title="Edit Semester Label"
                              >
                                <Edit2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )}

                          {!isEditingSem && (
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                              {loadingStats ? '...' : `${courseCount ?? 0} Courses`}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-[11px] text-slate-400">
                          Term {sem.semesterNumber} curriculum modules.
                        </p>
                      </div>

                      {/* Semester Actions */}
                      <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <button
                          onClick={() => onSelectTerm(yearConfig.yearNumber, sem.semesterNumber)}
                          className="flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 transition"
                        >
                          <span>Browse Courses</span>
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        <button
                          onClick={() => handleDeleteSemester(yearConfig.yearNumber, sem.semesterNumber)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Delete Semester"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
