import React, { useEffect } from 'react';
import {
  X,
  Clock,
  ShieldCheck,
  AlertCircle,
  Target,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { AnnouncementRecord, AnnouncementType } from '../../types';
import { announcementsService } from '../../services/announcementsService';
import { analyticsTracker } from '../../services/analyticsTrackerService';
import { auth } from '../../services/firebase';

interface UserAnnouncementModalProps {
  announcement: AnnouncementRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (announcementId: string) => void;
}

export const UserAnnouncementModal: React.FC<UserAnnouncementModalProps> = ({
  announcement,
  isOpen,
  onClose,
  onMarkAsRead,
}) => {
  // Mark as read when modal opens (Stage 7B) & track analytics event (Stage 8B)
  useEffect(() => {
    if (isOpen && announcement) {
      const uid = auth.currentUser?.uid;
      if (uid) {
        announcementsService.markAsRead(announcement.id, uid);
        onMarkAsRead?.(announcement.id);
      }
      analyticsTracker.trackAnnouncementRead(announcement.id, announcement.title);
    }
  }, [isOpen, announcement, onMarkAsRead]);

  if (!isOpen || !announcement) return null;

  const getTypeStyle = (type: AnnouncementType) => {
    switch (type) {
      case 'Academic':
        return {
          badge: 'bg-blue-500/10 text-sky-400 border-blue-500/30',
          dot: 'bg-sky-400',
        };
      case 'Important':
        return {
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
        };
      case 'Event':
        return {
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          dot: 'bg-purple-400',
        };
      case 'Maintenance':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      default:
        return {
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return 'Recent Notice';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const typeConfig = getTypeStyle(announcement.type);
  const isTargeted = announcement.audienceType === 'targeted';
  const targetLabel =
    announcement.targetProgrammeName ||
    announcement.targetDepartmentName ||
    announcement.targetAcademicUnitName ||
    announcement.targetUniversityName ||
    'Targeted Cohort';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col">
        {/* Top header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${typeConfig.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${typeConfig.dot}`} />
                {announcement.type} Memo
              </span>

              {announcement.priority === 'important' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  High Priority
                </span>
              )}

              {isTargeted ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Target className="w-3 h-3" />
                  Targeted: {targetLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Users className="w-3 h-3" />
                  Universal Notice
                </span>
              )}

              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {formatDate(announcement.publishedAt || announcement.createdAt)}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {announcement.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Close memo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-slate-300">
          {announcement.summary && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs leading-relaxed text-slate-300 border-l-2 border-l-indigo-500">
              <p className="font-medium">{announcement.summary}</p>
            </div>
          )}

          <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-200">
            {announcement.content}
          </div>
        </div>

        {/* Footer info with Read confirmation */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium text-slate-400">Marked as read</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-slate-500 text-[10px] hidden sm:flex">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Official Notice
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
