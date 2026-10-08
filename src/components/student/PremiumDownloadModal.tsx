import React, { useState } from 'react';
import {
  Crown,
  X,
  BookOpen,
  Download,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { AcademicMaterialRecord } from '../../types';
import { studentMaterialsService } from '../../services/studentMaterialsService';

interface PremiumDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  material?: AcademicMaterialRecord | null;
  onReadInsideVenue?: (material: AcademicMaterialRecord) => void;
}

export const PremiumDownloadModal: React.FC<PremiumDownloadModalProps> = ({
  isOpen,
  onClose,
  material,
  onReadInsideVenue,
}) => {
  const [showBillingNotice, setShowBillingNotice] = useState(false);

  if (!isOpen) return null;

  const cleanFileName = material
    ? studentMaterialsService.getCleanOriginalFileName(material)
    : 'Course_Material.pdf';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner */}
        <div className="p-5 bg-gradient-to-br from-amber-500/15 via-slate-900 to-blue-950/60 border-b border-slate-800/80 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                VENUE Premium Feature
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Premium Download
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          <p className="text-slate-200 leading-relaxed font-medium">
            Reading this material is <span className="text-emerald-400 font-bold">free</span> inside VENUE. Downloading course materials is available with <span className="text-amber-300 font-bold">VENUE Premium</span>.
          </p>

          {material && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] text-sky-400 font-bold uppercase">
                  <span>{material.courseCode || 'Course Material'}</span>
                  <span>•</span>
                  <span>{material.materialType}</span>
                </div>
                <p className="text-xs font-bold text-white truncate mt-0.5">
                  {material.title}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                  {cleanFileName} ({material.fileSize || 'Original File'})
                </p>
              </div>
            </div>
          )}

          {/* Free vs Premium breakdown */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Free In-App Reading:</span> Open and read lecture notes, PDFs, slides, and past papers directly inside the VENUE Reader at any time.
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-slate-300">
              <Download className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">VENUE Premium Downloads:</span> Save original files (<span className="font-mono text-[11px]">{cleanFileName}</span>) directly to your device for offline access.
              </div>
            </div>
          </div>

          {showBillingNotice && (
            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-sky-200 flex items-start gap-2.5 animate-fade-in">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <p className="font-bold text-white">
                  VENUE Premium Subscriptions Coming Soon
                </p>
                <p className="text-slate-300 text-[11px]">
                  Google Play Billing and VENUE Premium plans are not yet active in this release. You can continue reading all authorized course materials inside VENUE for free.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          {material && onReadInsideVenue && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onReadInsideVenue(material);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Free in VENUE</span>
            </button>
          )}

          {!showBillingNotice ? (
            <button
              type="button"
              id="btn-upgrade-to-premium"
              onClick={() => setShowBillingNotice(true)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade to Premium</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Got It
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
