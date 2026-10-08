import React, { useState, useEffect, useId, useRef } from 'react';
import {
  X,
  Save,
  FileText,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  UploadCloud,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  AcademicMaterialRecord,
  AcademicMaterialType,
  MaterialStatus,
} from '../../../types';
import {
  adminMaterialsService,
  MATERIAL_TYPES,
  MAX_MATERIAL_FILE_SIZE_MB,
  FileValidationResult,
  formatMaterialUploadError,
} from '../../../services/adminMaterialsService';

interface EditMaterialModalProps {
  isOpen: boolean;
  material: AcademicMaterialRecord | null;
  onClose: () => void;
  onMaterialUpdated: (updated: AcademicMaterialRecord) => void;
}

export const EditMaterialModal: React.FC<EditMaterialModalProps> = ({
  isOpen,
  material,
  onClose,
  onMaterialUpdated,
}) => {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isSubmittingRef = useRef(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState<AcademicMaterialType>('Lecture Notes');
  const [status, setStatus] = useState<MaterialStatus>('active');

  // File Replacement States
  const [isReplacingFile, setIsReplacingFile] = useState(false);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [fileValidation, setFileValidation] = useState<FileValidationResult | null>(null);

  // Submission & Progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (material) {
      setTitle(material.title || '');
      setDescription(material.description || '');
      setMaterialType(material.materialType || 'Lecture Notes');
      setStatus(material.status || 'active');
      setIsReplacingFile(false);
      setReplacementFile(null);
      setFileValidation(null);
      setErrorMessage(null);
      setUploadProgress(0);
    }
  }, [material]);

  if (!isOpen || !material) return null;

  const handleReplacementFileSelected = (file: File | null) => {
    if (!file) {
      setReplacementFile(null);
      setFileValidation(null);
      return;
    }
    const validation = adminMaterialsService.validateMaterialFile(file);
    setReplacementFile(file);
    setFileValidation(validation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;

    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Missing required information: Please provide a material title.');
      return;
    }

    if (isReplacingFile && replacementFile) {
      const validation = adminMaterialsService.validateMaterialFile(replacementFile);
      if (!validation.valid) {
        setErrorMessage(formatMaterialUploadError(validation.error || 'The replacement file is invalid.'));
        return;
      }
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setUploadStep(isReplacingFile && replacementFile ? 'Uploading replacement file...' : 'Saving changes...');

    try {
      const updates: Partial<Omit<AcademicMaterialRecord, 'id' | 'createdAt'>> = {
        title: title.trim(),
        description: description.trim(),
        materialType,
        status,
      };

      const updatedRecord = await adminMaterialsService.updateMaterial(
        material.id,
        updates,
        isReplacingFile ? replacementFile : null,
        (progress, state) => {
          setUploadProgress(progress);
          if (state === 'uploading') setUploadStep(`Uploading new file (${progress}%)...`);
          if (state === 'saving') setUploadStep('Updating metadata & cleaning old file...');
        }
      );

      onMaterialUpdated(updatedRecord);
      onClose();
    } catch (err: any) {
      console.error('Error updating material:', err);
      setErrorMessage(formatMaterialUploadError(err));
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Edit Academic Material</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {material.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Academic Placement Reference (Read-only summary for safety) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Bound Academic Catalogue Record
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 font-semibold text-indigo-300">
                {material.courseCode || 'Course'}: {material.courseTitle || material.courseId}
              </span>
              <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-slate-300">
                {material.programmeName || material.programmeId}
              </span>
              <span className="rounded-lg bg-slate-800 px-2 py-1 text-slate-400">
                Year {material.yearId} • Sem {material.semesterId}
              </span>
            </div>
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${formId}-type`} className="block text-xs font-semibold text-slate-300 mb-1.5">
                Material Type
              </label>
              <select
                id={`${formId}-type`}
                disabled={isSubmitting}
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as AcademicMaterialType)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              >
                {MATERIAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${formId}-status`} className="block text-xs font-semibold text-slate-300 mb-1.5">
                Publication Status
              </label>
              <select
                id={`${formId}-status`}
                disabled={isSubmitting}
                value={status}
                onChange={(e) => setStatus(e.target.value as MaterialStatus)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              >
                <option value="active">Active (Visible)</option>
                <option value="draft">Draft (Staging)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor={`${formId}-title`} className="block text-xs font-semibold text-slate-300 mb-1.5">
              Material Title <span className="text-rose-400">*</span>
            </label>
            <input
              id={`${formId}-title`}
              type="text"
              required
              disabled={isSubmitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor={`${formId}-desc`} className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Topics Covered
            </label>
            <textarea
              id={`${formId}-desc`}
              rows={2}
              disabled={isSubmitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none disabled:opacity-50"
            />
          </div>

          {/* Current File & Optional Replacement */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Attached Cloud Storage File
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsReplacingFile((prev) => !prev);
                  setReplacementFile(null);
                  setFileValidation(null);
                }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
              >
                {isReplacingFile ? 'Keep Current File' : 'Replace File with New Upload'}
              </button>
            </div>

            {!isReplacingFile ? (
              <div className="flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs">
                <div className="flex items-center gap-3 truncate">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-indigo-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{material.fileName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {material.fileSize} • {material.mimeType}
                    </p>
                  </div>
                </div>
                {material.fileUrl && (
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-400 hover:underline px-2 py-1 shrink-0"
                  >
                    Preview Current
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={(e) => handleReplacementFileSelected(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center rounded-xl border border-dashed border-indigo-500/50 bg-indigo-950/20 p-4 text-center hover:bg-indigo-950/30 transition"
                >
                  <UploadCloud className="h-6 w-6 text-indigo-400 mb-1" />
                  <span className="text-xs font-semibold text-white">Select replacement file</span>
                  <span className="text-[10px] text-slate-400">Max {MAX_MATERIAL_FILE_SIZE_MB}MB</span>
                </button>

                {replacementFile && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs">
                    <div>
                      <p className="font-semibold text-white truncate max-w-xs">{replacementFile.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {fileValidation?.formattedSize}
                      </p>
                    </div>
                    {fileValidation?.valid ? (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                      </span>
                    ) : (
                      <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> {fileValidation?.error}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload Progress Indicator during save */}
          {isSubmitting && (
            <div className="rounded-xl bg-indigo-950/30 border border-indigo-500/30 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-indigo-300 font-semibold">
                <span>{uploadStep}</span>
                {uploadProgress > 0 && <span>{uploadProgress}%</span>}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-200"
                  style={{ width: `${Math.max(10, uploadProgress)}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (isReplacingFile && !replacementFile)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
