import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AcademicMaterialRecord } from '../../../types';
import { adminMaterialsService } from '../../../services/adminMaterialsService';

interface DeleteMaterialModalProps {
  isOpen: boolean;
  material: AcademicMaterialRecord | null;
  onClose: () => void;
  onMaterialDeleted: (materialId: string) => void;
}

export const DeleteMaterialModal: React.FC<DeleteMaterialModalProps> = ({
  isOpen,
  material,
  onClose,
  onMaterialDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !material) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await adminMaterialsService.deleteMaterial(material.id);
      onMaterialDeleted(material.id);
      onClose();
    } catch (err: any) {
      console.error('Error deleting material:', err);
      setErrorMessage(err?.message || 'Failed to delete material record and storage file.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-rose-500/20 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Delete Academic Material</h3>
              <p className="text-xs text-rose-400 font-medium">Permanent Removal Confirmation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete this academic material? This will remove the
            document metadata from Firestore and delete the stored file from Cloud Storage.
          </p>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white truncate max-w-[280px]">
                {material.title}
              </span>
              <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[11px] font-mono text-indigo-300">
                {material.materialType}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Course: <span className="text-indigo-300 font-bold">{material.courseCode || material.courseId}</span>
              {material.courseTitle && <span className="text-slate-300"> — {material.courseTitle}</span>}
            </div>
            <div className="text-[11px] text-slate-400">
              File: <span className="font-mono text-slate-200">{material.fileName}</span> ({material.fileSize})
            </div>
            {material.storagePath && (
              <div className="text-[10px] text-slate-500 font-mono break-all pt-1 border-t border-slate-800/80">
                Storage: {material.storagePath}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              The linked course catalogue, programme curriculum, and academic structure records will
              remain completely intact and unmodified.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Deleting from Cloud Storage...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Confirm Permanent Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
