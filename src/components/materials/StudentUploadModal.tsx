import React, { useEffect, useState } from 'react';
import { X, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { Course, StudentProfile } from '../../types';
import { studentSubmissionService, SubmissionItem, STATUS_LABEL, STUDENT_MAX_FILE_MB } from '../../services/studentSubmissionService';

const TYPES = ['Lecture Notes', 'Handouts', 'Slides', 'Past Papers', 'Assignments', 'Solutions'];
const inputCls =
  'w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400';

interface Props {
  course: Course;
  profile?: StudentProfile;
  onClose: () => void;
}

/** A student shares a file for a course. It is reviewed by VENUE before other students can see it. */
export const StudentUploadModal: React.FC<Props> = ({ course, profile, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState(TYPES[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [mine, setMine] = useState<SubmissionItem[]>([]);

  useEffect(() => {
    void studentSubmissionService.mine().then((l) => setMine(l.filter((m) => m.courseCode === course.code).slice(0, 5)));
  }, [course.code, done]);

  const pick = (f: File | null) => {
    setError('');
    if (!f) return setFile(null);
    const bad = studentSubmissionService.validate(f);
    if (bad) {
      setError(bad);
      return setFile(null);
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 100));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError('Choose a file first.');
    if (title.trim().length < 3) return setError('Enter a title.');
    setBusy(true);
    setError('');
    try {
      const p: any = profile || {};
      await studentSubmissionService.submit({
        file,
        title: title.trim(),
        description: description.trim(),
        materialType,
        course: {
          id: course.id,
          code: course.code,
          name: course.title,
          universityId: course.universityId || p.universityId,
          academicUnitId: course.academicUnitId || p.academicUnitId,
          departmentId: p.departmentId,
          programmeId: course.programmeId || p.programmeId,
          year: course.year ?? course.yearOfStudy,
          semester: course.semester,
        },
      });
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto overscroll-contain">
      <div className="w-full max-w-lg my-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Upload className="w-5 h-5 text-blue-400 shrink-0" />
            <h3 className="text-base font-bold truncate">Share material · {course.code}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {done ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200 flex gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                Thank you! Your file was sent for review. It will appear for other students once VENUE approves it.
                <button
                  type="button"
                  onClick={() => {
                    setDone(false);
                    setFile(null);
                    setTitle('');
                    setDescription('');
                  }}
                  className="block mt-2 underline cursor-pointer"
                >
                  Share another file
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <p className="text-xs text-slate-400">
                Share notes, slides or past papers that help others. Please upload only material you have the right to share. Every
                file is checked before it is published.
              </p>
              <label className="block rounded-xl border border-dashed border-slate-600 p-4 text-center text-sm text-slate-300 cursor-pointer">
                {file ? file.name : `Tap to choose a file (max ${STUDENT_MAX_FILE_MB}MB)`}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={(e) => pick(e.target.files?.[0] || null)}
                />
              </label>
              <input className={inputCls} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} />
              <select className={inputCls} value={materialType} onChange={(e) => setMaterialType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <textarea
                className={inputCls}
                rows={2}
                placeholder="Short description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
              {error && <p className="text-xs text-rose-300">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {busy ? 'Uploading…' : 'Send for review'}
              </button>
            </form>
          )}

          {mine.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <p className="text-[11px] text-slate-400 font-semibold">Your recent files for this course</p>
              {mine.map((m) => (
                <div key={m.id} className="text-xs text-slate-300">
                  <span className="font-medium">{m.title}</span> — <span className="text-slate-400">{STATUS_LABEL[m.status] || m.status}</span>
                  {m.reviewNote && <span className="block text-[11px] text-amber-300">Note: {m.reviewNote}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
