import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  FileText,
  Layers,
  AlertCircle,
  Loader2,
  Save,
  Lock,
  BookOpen,
} from 'lucide-react';
import {
  AcademicMaterialRecord,
  AcademicMaterialType,
} from '../../types';
import { MATERIAL_TYPES, formatMaterialUploadError } from '../../services/adminMaterialsService';
import { lecturerMaterialsService } from '../../services/lecturerMaterialsService';
import { auth } from '../../services/firebase';

interface EditLecturerMaterialModalProps {
  material: AcademicMaterialRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: AcademicMaterialRecord) => void;
}

export const EditLecturerMaterialModal: React.FC<EditLecturerMaterialModalProps> = ({
  material,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState<AcademicMaterialType>('Lecture Notes');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSubmittingRef = React.useRef(false);

  useEffect(() => {
    if (material) {
      setTitle(material.title || '');
      setDescription(material.description || '');
      setMaterialType(material.materialType || 'Lecture Notes');
      setError(null);
    }
  }, [material]);

  if (!isOpen || !material) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || isSubmittingRef.current) return;

    if (!title.trim()) {
      setError('Missing required information: Material title cannot be empty.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('Authentication required: You must be signed in to edit this material.');
      return;
    }

    isSubmittingRef.current = true;
    setSaving(true);
    setError(null);

    try {
      const updated = await lecturerMaterialsService.updateMaterialMetadata({
        materialId: material.id,
        title: title.trim(),
        description: description.trim(),
        materialType,
        lecturerUid: user.uid,
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error('Error updating material metadata:', err);
      setError(formatMaterialUploadError(err));
    } finally {
      setSaving(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Edit Material Details
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update document metadata & classification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Locked Course & File Info Banner (Requirement 9) */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                Associated Course:
              </span>
              <span className="font-mono text-white font-bold">
                {material.courseCode || material.courseId}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                File Attachment:
              </span>
              <span className="font-mono text-slate-300 truncate max-w-[220px]">
                {material.fileName} ({material.fileSize})
              </span>
            </div>

            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
              * The associated course, department, and file binary cannot be modified. If reassignment is needed, contact an administrator.
            </p>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              Material Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Material Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Material Classification <span className="text-rose-400">*</span>
            </label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value as AcademicMaterialType)}
              disabled={saving}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
            >
              {MATERIAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Description / Notes (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Metadata</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
