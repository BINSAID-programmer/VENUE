import React from 'react';
import {
  BookOpen,
  Award,
  CheckCircle,
  Tag,
  Info,
  AlertCircle,
  Edit2,
  Trash2,
  Layers,
  Eye,
} from 'lucide-react';
import { CourseRecord } from '../../../types';

interface CourseCardProps {
  course: CourseRecord;
  onViewDetails?: (course: CourseRecord) => void;
  onEdit?: (course: CourseRecord) => void;
  onDelete?: (course: CourseRecord) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const code = course.code || (course as any).courseCode || 'N/A';
  const title = course.title || (course as any).courseName || 'Untitled Course';
  const credits = course.credits !== undefined ? course.credits : null;
  const status = course.status || (course as any).courseType || 'Core';
  const isCore = status.toLowerCase() === 'core';
  const isElective = status.toLowerCase() === 'elective';
  const year = course.yearOfStudy || (course as any).year || null;
  const semester = course.semester !== undefined ? course.semester : null;

  // Metadata notes from authoritative imports
  const anyCourse = course as any;
  const electiveRule = anyCourse.electiveRule;
  const isFieldTraining = anyCourse.isFieldTraining;
  const isDissertation = anyCourse.isDissertation;
  const byInvitation = anyCourse.byInvitationOnly;
  const note = anyCourse.note;

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-sm transition hover:border-slate-700/80 hover:bg-slate-900/80 space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Header: Code, Badges, Credits */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                {code}
              </span>

              {/* Core vs Elective status */}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                  isCore
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : isElective
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {status}
              </span>

              {/* Field training / dissertation badges */}
              {isFieldTraining && (
                <span className="rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 text-[9px] font-semibold">
                  Field Training
                </span>
              )}
              {isDissertation && (
                <span className="rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 text-[9px] font-semibold">
                  Dissertation
                </span>
              )}
              {byInvitation && (
                <span className="rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 text-[9px] font-semibold">
                  By Invitation
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-white tracking-tight pt-1">
              {title}
            </h4>
          </div>

          {/* Credits pill */}
          <div className="shrink-0 text-right">
            {credits !== null ? (
              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-xl">
                <Award className="h-3 w-3 text-amber-400" />
                <span className="text-xs font-bold text-white">{credits}</span>
                <span className="text-[10px] text-slate-400">Credits</span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-500 italic">Credits N/A</span>
            )}
          </div>
        </div>

        {/* Elective rule / notes if present */}
        {(electiveRule || note) && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-2.5 text-[11px] text-slate-300 flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{electiveRule || note}</span>
          </div>
        )}
      </div>

      {/* Meta Footer & Action Buttons */}
      <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          {year !== null && <span>Year {year}</span>}
          {semester !== null && (
            <span>• Semester {semester === 1 ? 'I' : semester === 2 ? 'II' : semester}</span>
          )}
          {course.departmentId && (
            <span className="text-slate-500 hidden sm:inline">• {course.departmentId}</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(course)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/60 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="View canonical course details and where it is used"
            >
              <Eye className="h-3 w-3 text-indigo-400" />
              <span>Details</span>
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(course)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/60 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Edit course metadata and classification"
            >
              <Edit2 className="h-3 w-3 text-amber-400" />
              <span>Edit</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(course)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/60 px-2 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/30 transition"
              title="Remove from term or delete canonical course"
            >
              <Trash2 className="h-3 w-3" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
