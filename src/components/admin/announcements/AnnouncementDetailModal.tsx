import React from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Megaphone,
  CheckCircle2,
  Archive,
  Target,
  Users,
  Building2,
  GraduationCap,
  Layers,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { AnnouncementRecord, AnnouncementType, AnnouncementStatus } from '../../../types';

interface AnnouncementDetailModalProps {
  announcement: AnnouncementRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (announcement: AnnouncementRecord) => void;
}

export const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
  announcement,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !announcement) return null;

  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case 'Academic':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          dot: 'bg-blue-400',
        };
      case 'Important':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
        };
      case 'Event':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          dot: 'bg-purple-400',
        };
      case 'Maintenance':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
          dot: 'bg-slate-400',
        };
    }
  };

  const getStatusBadge = (status: AnnouncementStatus) => {
    switch (status) {
      case 'Published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Published</span>
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Draft</span>
          </span>
        );
      case 'Archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Archive className="w-3.5 h-3.5" />
            <span>Archived</span>
          </span>
        );
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Not yet published';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const typeStyle = getTypeBadge(announcement.type);
  const isTargeted = announcement.audienceType === 'targeted';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${typeStyle.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${typeStyle.dot}`} />
                {announcement.type}
              </span>
              {announcement.priority === 'important' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  High Priority Alert
                </span>
              )}
              {getStatusBadge(announcement.status)}
              {isTargeted ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <Target className="w-3 h-3" />
                  Targeted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Users className="w-3 h-3" />
                  Everyone
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {announcement.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Summary Callout (if present) */}
          {announcement.summary && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Executive Summary / Memo Overview
              </span>
              <p>{announcement.summary}</p>
            </div>
          )}

          {/* Full Content */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Official Announcement Body
            </span>
            <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
              {announcement.content}
            </div>
          </div>

          {/* Stage 7B: Audience Targeting Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Target Audience Breakdown
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {isTargeted ? 'Targeted Cohort' : 'Universal (Everyone)'}
              </span>
            </div>

            {isTargeted ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-indigo-400" />
                    University
                  </span>
                  <p className="font-medium text-white truncate">
                    {announcement.targetUniversityName || announcement.targetUniversityId || 'All Universities'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    Academic Unit
                  </span>
                  <p className="font-medium text-white truncate">
                    {announcement.targetAcademicUnitName || announcement.targetAcademicUnitId || 'All Academic Units'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-indigo-400" />
                    Department
                  </span>
                  <p className="font-medium text-white truncate">
                    {announcement.targetDepartmentName || announcement.targetDepartmentId || 'All Departments'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-indigo-400" />
                    Programme
                  </span>
                  <p className="font-medium text-white truncate">
                    {announcement.targetProgrammeName || announcement.targetProgrammeId || 'All Programmes'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    Cohort Level
                  </span>
                  <p className="font-medium text-white">
                    {announcement.targetYearOfStudy || 'All Years'} • {announcement.targetSemester || 'All Semesters'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                This notice is published for <strong>all authenticated students and lecturers</strong> across every university campus, college, and department.
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Created By
              </span>
              <p className="text-xs text-white font-medium truncate">
                {announcement.createdByName || announcement.createdBy}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                UID: {announcement.createdBy}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Published Date & Time
              </span>
              <p className="text-xs text-white font-medium">
                {formatDate(announcement.publishedAt)}
              </p>
              <p className="text-[10px] text-slate-500">
                Created: {formatDate(announcement.createdAt)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Last Modified
              </span>
              <p className="text-xs text-slate-300 font-medium">
                {formatDate(announcement.updatedAt)}
              </p>
              {announcement.updatedBy && (
                <p className="text-[10px] text-slate-500 font-mono truncate">
                  Modified by: {announcement.updatedBy}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-slate-500" />
                System Identifier
              </span>
              <p className="text-xs font-mono text-slate-300 truncate">
                {announcement.announcementId || announcement.id}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
          <div className="text-[11px] text-slate-500">
            VENUE Centralized Announcements System (Stage 7B)
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(announcement);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Announcement</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
