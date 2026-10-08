import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileText,
  Building2,
  Layers,
  GraduationCap,
  BookOpen,
  Calendar,
  User,
  Crown,
  Loader2,
} from 'lucide-react';
import { AcademicMaterialRecord } from '../../types';
import { studentMaterialsService } from '../../services/studentMaterialsService';
import { analyticsTracker } from '../../services/analyticsTrackerService';
import { PremiumDownloadModal } from './PremiumDownloadModal';

interface StudentMaterialDetailModalProps {
  material: AcademicMaterialRecord | null;
  onClose: () => void;
  onSelectCourse?: (courseCode: string) => void;
  onOpenViewer?: (material: AcademicMaterialRecord) => void;
  userId?: string;
}

export const StudentMaterialDetailModal: React.FC<StudentMaterialDetailModalProps> = ({
  material,
  onClose,
  onSelectCourse,
  onOpenViewer,
  userId,
}) => {
  const [checkingDownload, setCheckingDownload] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Stage 8B: Track material view upon opening detail view
  useEffect(() => {
    if (material) {
      analyticsTracker.trackMaterialView(
        material.id,
        material.title,
        material.courseCode,
        material.materialType
      );
    }
  }, [material]);

  if (!material) return null;

  const typeBadge = studentMaterialsService.getMaterialTypeBadge(material.materialType);
  const fileBadge = studentMaterialsService.getFileTypeBadge(material.fileName, material.mimeType);
  const uploaderName =
    typeof material.uploadedBy === 'object'
      ? material.uploadedBy.name || material.uploadedBy.email || 'University Faculty'
      : material.uploaderRole === 'lecturer'
      ? 'Course Lecturer'
      : 'University Repository';

  const handleDownloadClick = async () => {
    if (checkingDownload) return;
    setCheckingDownload(true);
    try {
      const res = await studentMaterialsService.requestMaterialDownload(material, userId);
      if (res.requiresPremium) {
        setShowPremiumModal(true);
      } else if (res.success) {
        analyticsTracker.trackMaterialDownload(
          material.id,
          material.title,
          material.courseCode,
          material.materialType
        );
      }
    } finally {
      setCheckingDownload(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-start justify-between gap-4 bg-slate-950/40">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {material.courseCode && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectCourse && material.courseCode) {
                        onSelectCourse(material.courseCode);
                      }
                    }}
                    className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-blue-500/15 text-sky-400 border border-blue-500/30 cursor-pointer"
                  >
                    {material.courseCode}
                  </button>
                )}
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${typeBadge.bgColor} ${typeBadge.textColor} ${typeBadge.borderColor}`}
                >
                  {material.materialType}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${fileBadge.bgColor} ${fileBadge.textColor} ${fileBadge.borderColor}`}
                >
                  {fileBadge.label}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug break-words">
                {material.title}
              </h3>
              {material.courseTitle && (
                <p className="text-xs text-slate-400">{material.courseTitle}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
            {/* Description */}
            {material.description ? (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description & Overview
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300 leading-relaxed whitespace-pre-line">
                  {material.description}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 italic text-xs">
                No additional description provided for this academic resource.
              </div>
            )}

            {/* Academic Context Placement Chain */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Curriculum Placement
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-slate-400">University:</span>
                  <span className="font-medium text-white truncate">
                    {material.universityName ||
                      material.universityId?.toUpperCase() ||
                      'University of Dar es Salaam'}
                  </span>
                </div>

                {(material.academicUnitName || material.academicUnitId) && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-slate-400">Unit:</span>
                    <span className="font-medium text-white truncate">
                      {material.academicUnitName || material.academicUnitId}
                    </span>
                  </div>
                )}

                {(material.programmeName || material.programmeId) && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-slate-400">Programme:</span>
                    <span className="font-medium text-white truncate">
                      {material.programmeName || material.programmeId}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400">Uploaded By:</span>
                  <span className="font-medium text-white truncate">{uploaderName}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-400">Term:</span>
                  <span className="font-medium text-white">
                    Year {material.yearId || 'All'} • Semester {material.semesterId || 'All'}
                  </span>
                </div>
              </div>
            </div>

            {/* File Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Original File
                </span>
                <p
                  className="font-medium text-white truncate text-xs font-mono"
                  title={studentMaterialsService.getCleanOriginalFileName(material)}
                >
                  {studentMaterialsService.getCleanOriginalFileName(material)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  File Size
                </span>
                <p className="font-bold text-sky-400 text-xs">
                  {material.fileSize || 'Standard'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Published
                </span>
                <p className="font-medium text-slate-300 text-xs">
                  {studentMaterialsService.formatDate(material.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleDownloadClick}
                disabled={checkingDownload}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-colors cursor-pointer"
                title="Download original file (VENUE Premium)"
              >
                {checkingDownload ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Download</span>
              </button>

              {onOpenViewer && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenViewer(material);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open / Read in VENUE</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <PremiumDownloadModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        material={material}
        onReadInsideVenue={
          onOpenViewer
            ? (mat) => {
                setShowPremiumModal(false);
                onClose();
                onOpenViewer(mat);
              }
            : undefined
        }
      />
    </>
  );
};
