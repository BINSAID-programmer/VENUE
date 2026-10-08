import React, { useState, useEffect, useId } from 'react';
import {
  X,
  Plus,
  BookOpen,
  Award,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Building,
  GraduationCap,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  CourseRecord,
  ProgrammeRecord,
  DepartmentRecord,
  AcademicUnitRecord,
  CanonicalCourseRecord,
} from '../../../types';
import { adminCatalogueService } from '../../../services/adminCatalogueService';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  programme?: ProgrammeRecord | null;
  department?: DepartmentRecord | null;
  unit?: AcademicUnitRecord | null;
  year?: number | null;
  semester?: number | null;
  onCourseCreated: (course: CourseRecord, assigned: boolean) => void;
  onCourseAssigned?: (course: CourseRecord) => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  onClose,
  programme,
  department,
  unit,
  year,
  semester,
  onCourseCreated,
  onCourseAssigned,
}) => {
  const formId = useId();
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [credits, setCredits] = useState<number>(12);
  const [status, setStatus] = useState<'Core' | 'Elective'>('Core');
  const [selectedYear, setSelectedYear] = useState<number>(year || 1);
  const [selectedSemester, setSelectedSemester] = useState<number>(semester || 1);
  const [assignImmediately, setAssignImmediately] = useState<boolean>(Boolean(programme));
  
  // Existing canonical duplicate check state
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [existingCourse, setExistingCourse] = useState<CanonicalCourseRecord | null>(null);
  const [duplicateChecked, setDuplicateChecked] = useState(false);

  // Departments for offering department selection
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(department?.id || '');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setTitle('');
      setCredits(12);
      setStatus('Core');
      setSelectedYear(year || 1);
      setSelectedSemester(semester || 1);
      setAssignImmediately(Boolean(programme));
      setExistingCourse(null);
      setDuplicateChecked(false);
      setErrorMessage(null);
      setSuccessMessage(null);
      setSelectedDeptId(department?.id || '');

      // Load all departments for offering dept selection
      adminCatalogueService.getAllDepartments().then((depts) => {
        setDepartments(depts);
      });
    }
  }, [isOpen, programme, department, year, semester]);

  // Debounced duplicate code check
  useEffect(() => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      setExistingCourse(null);
      setDuplicateChecked(false);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingDuplicate(true);
      try {
        const found = await adminCatalogueService.getCanonicalCourseByCode(cleanCode);
        setExistingCourse(found);
        setDuplicateChecked(true);
        if (found && !title) {
          setTitle(found.title);
          if (found.defaultCredits) {
            setCredits(found.defaultCredits);
          }
        }
      } catch (err) {
        console.warn('Error checking duplicate course code:', err);
      } finally {
        setCheckingDuplicate(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [code, title]);

  if (!isOpen) return null;

  const handleUseExistingAndAssign = async () => {
    if (!existingCourse) return;
    if (!programme) {
      setErrorMessage('Please select a programme to assign this course.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await adminCatalogueService.assignCourseToProgramme({
        canonicalCourseId: existingCourse.id,
        code: existingCourse.code,
        title: existingCourse.title,
        credits: credits || existingCourse.defaultCredits || 12,
        status,
        programmeId: programme.id,
        academicUnitId: programme.academicUnitId,
        departmentId: programme.departmentId,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to assign course to programme.');
        setSubmitting(false);
        return;
      }

      setSuccessMessage(`Course ${existingCourse.code} assigned to Year ${selectedYear} Semester ${selectedSemester}.`);
      setTimeout(() => {
        const assignedRecord: CourseRecord = {
          id: `udsm_${programme.id}_${existingCourse.code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          code: existingCourse.code,
          title: existingCourse.title,
          credits: credits || existingCourse.defaultCredits || 12,
          status,
          yearOfStudy: selectedYear,
          semester: selectedSemester,
          programmeId: programme.id,
          academicUnitId: programme.academicUnitId,
          departmentId: programme.departmentId,
          universityId: 'udsm',
          verified: true,
          source: 'Official Academic Catalogue',
        };
        if (onCourseAssigned) {
          onCourseAssigned(assignedRecord);
        } else {
          onCourseCreated(assignedRecord, true);
        }
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error assigning course.');
      setSubmitting(false);
    }
  };

  const handleCreateNewCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanTitle = title.trim();

    if (!cleanCode) {
      setErrorMessage('Course code is required (e.g. "MT 101").');
      return;
    }
    if (!cleanTitle) {
      setErrorMessage('Course title/name is required (e.g. "Calculus I").');
      return;
    }
    if (!credits || credits <= 0) {
      setErrorMessage('Credits must be a positive number.');
      return;
    }

    // Canonical Duplicate Check enforcement: DO NOT create a second course document!
    if (existingCourse) {
      setErrorMessage(
        `Course ${cleanCode} already exists in the catalogue. Courses are canonical records and must not be duplicated. You can assign this existing course instead.`
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Create canonical course record
      const createRes = await adminCatalogueService.createCanonicalCourse({
        code: cleanCode,
        title: cleanTitle,
        defaultCredits: credits,
        universityId: 'udsm',
        academicUnitId: unit?.id || programme?.academicUnitId,
        departmentId: selectedDeptId || department?.id || programme?.departmentId,
      });

      if (!createRes.success || !createRes.course) {
        if (createRes.existing) {
          setExistingCourse(createRes.existing);
        }
        setErrorMessage(createRes.error || 'Failed to create canonical course.');
        setSubmitting(false);
        return;
      }

      const newCanonical = createRes.course;

      // 2. If assignImmediately is checked and programme is present, assign it
      let wasAssigned = false;
      if (assignImmediately && programme) {
        const assignRes = await adminCatalogueService.assignCourseToProgramme({
          canonicalCourseId: newCanonical.id,
          code: newCanonical.code,
          title: newCanonical.title,
          credits,
          status,
          programmeId: programme.id,
          academicUnitId: programme.academicUnitId,
          departmentId: programme.departmentId,
          yearOfStudy: selectedYear,
          semester: selectedSemester,
        });

        if (!assignRes.success) {
          console.warn('Notice assigning course after canonical creation:', assignRes.error);
        } else {
          wasAssigned = true;
        }
      }

      setSuccessMessage(`Course ${cleanCode} created successfully as a canonical record!`);

      setTimeout(() => {
        const courseRecord: CourseRecord = {
          id: `udsm_${programme?.id || 'gen'}_${cleanCode.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          code: cleanCode,
          title: cleanTitle,
          credits,
          status,
          yearOfStudy: selectedYear,
          semester: selectedSemester,
          programmeId: programme?.id || '',
          academicUnitId: programme?.academicUnitId || unit?.id,
          departmentId: selectedDeptId || programme?.departmentId || department?.id,
          universityId: 'udsm',
          verified: true,
          source: 'Official Academic Catalogue',
        };
        onCourseCreated(courseRecord, wasAssigned);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Error creating course:', err);
      setErrorMessage(err?.message || 'Failed to create course.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400">
                Stage 3C Course Management
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Canonical Architecture
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Add New Academic Course
            </h3>
            <p className="text-xs text-slate-400">
              {programme ? (
                <span>
                  Adding to <strong className="text-white">{programme.shortName || programme.name}</strong> • Year {selectedYear}, Semester {selectedSemester === 1 ? 'I' : 'II'}
                </span>
              ) : (
                <span>Add a verified course to the canonical institution repository</span>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerts & Notifications */}
        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-rose-300 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-rose-200">Action Required</p>
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

        {/* Existing Canonical Course Detected Banner */}
        {existingCourse && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4 text-xs text-amber-200 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-bold text-amber-300">
                  Course {existingCourse.code} Already Exists in Catalogue
                </p>
                <p className="text-amber-200/90 leading-relaxed text-[11px]">
                  &ldquo;<strong className="text-white">{existingCourse.title}</strong>&rdquo; is already registered as a canonical course with {existingCourse.defaultCredits || 12} credits.
                </p>
                <p className="text-amber-300/80 text-[11px] leading-relaxed">
                  Under the Canonical Course Model, courses are never duplicated across programmes. You should assign this existing record instead of creating a second copy.
                </p>
              </div>
            </div>

            {programme && (
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between gap-3">
                <span className="text-[11px] text-amber-300/70">
                  Assign to {programme.shortName || programme.name} (Year {selectedYear}, Sem {selectedSemester})?
                </span>
                <button
                  type="button"
                  onClick={handleUseExistingAndAssign}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow-md disabled:opacity-50"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Assign Existing Course</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Add Course Form */}
        <form onSubmit={handleCreateNewCourse} className="space-y-4">
          {/* Row 1: Course Code & Credits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor={`${formId}-code`} className="block text-xs font-semibold text-slate-300">
                Course Code <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id={`${formId}-code`}
                  type="text"
                  required
                  placeholder="e.g. MT 101, CS 174, SC 121"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs font-mono font-bold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                />
                {checkingDuplicate && (
                  <div className="absolute right-3 top-3 h-3.5 w-3.5 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
                )}
                {duplicateChecked && !existingCourse && code.trim().length >= 3 && (
                  <span className="absolute right-3 top-3 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>New Code</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Primary canonical identifier. Checked in real-time across the catalogue.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`${formId}-credits`} className="block text-xs font-semibold text-slate-300">
                Credits <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id={`${formId}-credits`}
                  type="number"
                  required
                  min={1}
                  max={60}
                  value={credits}
                  onChange={(e) => setCredits(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Award className="absolute right-3 top-3 h-3.5 w-3.5 text-amber-400" />
              </div>
              <p className="text-[10px] text-slate-500">UDSM standard (e.g. 8, 12, 16)</p>
            </div>
          </div>

          {/* Row 2: Course Title */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-title`} className="block text-xs font-semibold text-slate-300">
              Course Title / Name <span className="text-rose-400">*</span>
            </label>
            <input
              id={`${formId}-title`}
              type="text"
              required
              placeholder="e.g. Calculus I, Discrete Structures, Statics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Row 3: Course Status / Classification & Offering Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor={`${formId}-status`} className="block text-xs font-semibold text-slate-300">
                Classification / Status
              </label>
              <select
                id={`${formId}-status`}
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Core' | 'Elective')}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Core">Core Course (Compulsory)</option>
                <option value="Elective">Elective Course (Optional)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`${formId}-dept`} className="block text-xs font-semibold text-slate-300">
                Offering Department (Home)
              </label>
              <select
                id={`${formId}-dept`}
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">
                  {department ? `${department.name} (Current)` : '-- Select Department --'}
                </option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Programme Placement (when in programme context) */}
          {programme && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Curriculum Placement</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignImmediately}
                    onChange={(e) => setAssignImmediately(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>Assign to this Programme</span>
                </label>
              </div>

              {assignImmediately && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label htmlFor={`${formId}-year`} className="text-[11px] text-slate-400">Year of Study</label>
                    <select
                      id={`${formId}-year`}
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-indigo-500"
                    >
                      {Array.from({ length: programme.durationYears || 4 }, (_, i) => i + 1).map((y) => (
                        <option key={y} value={y}>
                          Year {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={`${formId}-semester`} className="text-[11px] text-slate-400">Semester</label>
                    <select
                      id={`${formId}-semester`}
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-indigo-500"
                    >
                      <option value={1}>Semester I</option>
                      <option value={2}>Semester II</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

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
              disabled={submitting || Boolean(existingCourse)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>
                    {assignImmediately && programme
                      ? 'Create & Assign Course'
                      : 'Create Canonical Course'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
