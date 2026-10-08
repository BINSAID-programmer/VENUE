import React, { useState, useEffect, useId } from 'react';
import {
  X,
  Save,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { CourseRecord, ProgrammeRecord } from '../../../types';
import { adminCatalogueService } from '../../../services/adminCatalogueService';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseRecord;
  programme?: ProgrammeRecord | null;
  onCourseUpdated: (updatedCourse: CourseRecord) => void;
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({
  isOpen,
  onClose,
  course,
  programme,
  onCourseUpdated,
}) => {
  const formId = useId();
  const [code, setCode] = useState(course.code || (course as any).courseCode || '');
  const [title, setTitle] = useState(course.title || (course as any).courseName || '');
  const [description, setDescription] = useState(course.description || '');
  const [credits, setCredits] = useState<number>(Number(course.credits) || 12);
  const [status, setStatus] = useState<'Core' | 'Elective'>(
    course.status === 'Elective' || course.courseType === 'Elective' ? 'Elective' : 'Core'
  );
  const [yearOfStudy, setYearOfStudy] = useState<number>(Number(course.yearOfStudy) || 1);
  const [semester, setSemester] = useState<number>(Number(course.semester) || 1);
  const [canonicalStatus, setCanonicalStatus] = useState<'active' | 'archived' | 'inactive'>(
    course.archived ? 'archived' : 'active'
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const originalCode = course.code || (course as any).courseCode || '';
  const canonicalId =
    course.canonicalCourseId ||
    originalCode.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

  useEffect(() => {
    if (isOpen) {
      setCode(course.code || (course as any).courseCode || '');
      setTitle(course.title || (course as any).courseName || '');
      setDescription(course.description || '');
      setCredits(Number(course.credits) || 12);
      setStatus(course.status === 'Elective' || course.courseType === 'Elective' ? 'Elective' : 'Core');
      setYearOfStudy(Number(course.yearOfStudy) || 1);
      setSemester(Number(course.semester) || 1);
      setCanonicalStatus(course.archived ? 'archived' : 'active');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, course]);

  if (!isOpen) return null;

  const maxYears = programme?.durationYears || 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanTitle = title.trim();
    if (!cleanCode) {
      setErrorMessage('Course code cannot be empty.');
      return;
    }
    if (!cleanTitle) {
      setErrorMessage('Course title cannot be empty.');
      return;
    }
    if (!credits || credits <= 0) {
      setErrorMessage('Credits must be a positive number.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Update canonical course record
      const canonRes = await adminCatalogueService.updateCanonicalCourse(canonicalId, {
        code: cleanCode,
        title: cleanTitle,
        defaultCredits: credits,
        description: description.trim(),
        status: canonicalStatus,
        active: canonicalStatus === 'active',
        archived: canonicalStatus === 'archived',
      });

      if (!canonRes.success) {
        setErrorMessage(canonRes.error || 'Could not update canonical course.');
        setSubmitting(false);
        return;
      }

      // 2. If in programme context, update term placement & relationship (Year, Semester, Credits, Status)
      const targetProgId = programme?.id || course.programmeId;
      if (targetProgId) {
        const relRes = await adminCatalogueService.updateProgrammeCourseRelationship({
          programmeId: targetProgId,
          code: cleanCode,
          canonicalCourseId: canonicalId,
          oldYearOfStudy: Number(course.yearOfStudy) || 1,
          oldSemester: Number(course.semester) || 1,
          newYearOfStudy: yearOfStudy,
          newSemester: semester,
          credits,
          status,
          title: cleanTitle,
          description: description.trim(),
          academicUnitId: programme?.academicUnitId || course.academicUnitId,
          departmentId: programme?.departmentId || course.departmentId,
        });

        if (!relRes.success) {
          setErrorMessage(relRes.error || 'Failed to update programme-course relationship.');
          setSubmitting(false);
          return;
        }
      }

      setSuccessMessage('Course and relationship updated successfully!');

      setTimeout(() => {
        const updatedCourse: CourseRecord = {
          ...course,
          code: cleanCode,
          title: cleanTitle,
          description: description.trim(),
          credits,
          status,
          courseType: status,
          yearOfStudy,
          semester,
          archived: canonicalStatus === 'archived',
        };
        onCourseUpdated(updatedCourse);
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Error updating course:', err);
      setErrorMessage(err?.message || 'Failed to update course.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg">
                {originalCode}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-semibold">
                Edit Course & Relationship
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Edit Course & Term Placement
            </h3>
            <p className="text-xs text-slate-400">
              Update canonical course details or modify Year, Semester, Credits & Core/Elective status
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-rose-300 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <p className="leading-relaxed flex-1">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Course Code */}
            <div className="sm:col-span-1 space-y-1.5">
              <label htmlFor={`${formId}-code`} className="block text-xs font-semibold text-slate-300">
                Course Code *
              </label>
              <input
                id={`${formId}-code`}
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono font-bold text-white uppercase focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Course Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor={`${formId}-title`} className="block text-xs font-semibold text-slate-300">
                Course Title / Name *
              </label>
              <input
                id={`${formId}-title`}
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Programme-Course Relationship Placement */}
          {(programme || course.programmeId) && (
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/15 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>
                  Programme-Course Relationship ({programme?.shortName || programme?.name || course.programmeId})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <label htmlFor={`${formId}-year`} className="block text-[11px] font-semibold text-slate-300">
                    Year of Study
                  </label>
                  <select
                    id={`${formId}-year`}
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-indigo-500"
                  >
                    {Array.from({ length: maxYears }, (_, i) => i + 1).map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formId}-sem`} className="block text-[11px] font-semibold text-slate-300">
                    Semester
                  </label>
                  <select
                    id={`${formId}-sem`}
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-indigo-500"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formId}-credits`} className="block text-[11px] font-semibold text-slate-300">
                    Credits
                  </label>
                  <input
                    id={`${formId}-credits`}
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={credits}
                    onChange={(e) => setCredits(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs font-bold text-white focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formId}-status`} className="block text-[11px] font-semibold text-slate-300">
                    Classification
                  </label>
                  <select
                    id={`${formId}-status`}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Core' | 'Elective')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs font-bold text-white focus:border-indigo-500"
                  >
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Description & Canonical Status */}
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-desc`} className="block text-xs font-semibold text-slate-300">
              Course Description (Optional)
            </label>
            <textarea
              id={`${formId}-desc`}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Syllabus summary or canonical course notes..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor={`${formId}-canon-status`} className="block text-xs font-semibold text-slate-300">
              Canonical Course Status
            </label>
            <select
              id={`${formId}-canon-status`}
              value={canonicalStatus}
              onChange={(e) => setCanonicalStatus(e.target.value as 'active' | 'archived' | 'inactive')}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Footer Actions */}
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
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
