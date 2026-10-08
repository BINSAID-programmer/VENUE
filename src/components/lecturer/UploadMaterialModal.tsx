import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  GraduationCap,
  Layers,
  Building,
  Calendar,
  FileUp,
  FileCheck,
  Info,
} from 'lucide-react';
import {
  LecturerRecord,
  LecturerCourseAssignment,
  AcademicMaterialType,
  AcademicMaterialRecord,
} from '../../types';
import {
  adminMaterialsService,
  MATERIAL_TYPES,
  MAX_MATERIAL_FILE_SIZE_MB,
  SUPPORTED_ACADEMIC_EXTENSIONS,
  formatMaterialUploadError,
} from '../../services/adminMaterialsService';
import { lecturerMaterialsService } from '../../services/lecturerMaterialsService';
import { auth } from '../../services/firebase';

interface UploadMaterialModalProps {
  lecturer: LecturerRecord;
  assignedCourses: LecturerCourseAssignment[];
  initialSelectedCourseId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMaterial: AcademicMaterialRecord) => void;
}

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  lecturer,
  assignedCourses,
  initialSelectedCourseId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const isMountedRef = useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Form State
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(() => {
    if (initialSelectedCourseId) {
      const match = assignedCourses.find(
        (a) => a.courseId === initialSelectedCourseId || a.id === initialSelectedCourseId
      );
      if (match) return match.id;
    }
    return assignedCourses.length > 0 ? assignedCourses[0].id : '';
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState<AcademicMaterialType>('Lecture Notes');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Upload Progress & Errors
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAssignment = assignedCourses.find((a) => a.id === selectedAssignmentId);

  const handleFileChange = (file: File | null) => {
    setError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validation = adminMaterialsService.validateMaterialFile(file);
    if (!validation.valid) {
      setError(formatMaterialUploadError(validation.error || 'Selected file is invalid.'));
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Auto-fill title if empty
    if (!title.trim()) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      // Clean up underscores and dashes for title
      const cleanTitle = baseName.replace(/[_-]+/g, ' ');
      setTitle(cleanTitle);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploading || isSubmittingRef.current) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (uploading || isSubmittingRef.current) return; // Prevent duplicate submissions

    setError(null);

    // 1. Verify Authentication State
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('Authentication required: Please sign in with your lecturer account to upload course materials.');
      return;
    }

    // 2. Validate Assignment Selection
    if (!currentAssignment) {
      setError('Missing required information: Please select an assigned academic course.');
      return;
    }

    // 3. Validate Title
    if (!title.trim()) {
      setError('Missing required information: Please provide a title for this academic material.');
      return;
    }

    // 4. Validate File
    if (!selectedFile) {
      setError('Invalid file: Please choose a document or presentation file to upload.');
      return;
    }

    isSubmittingRef.current = true;
    setUploading(true);
    setUploadProgress(5);
    setUploadStage('Initiating upload...');

    try {
      const newMaterial = await lecturerMaterialsService.uploadMaterial({
        lecturer,
        assignment: currentAssignment,
        title: title.trim(),
        description: description.trim(),
        materialType,
        file: selectedFile,
        onProgress: (percent, stage) => {
          if (!isMountedRef.current) return;
          setUploadProgress(percent);
          if (stage === 'preparing') setUploadStage('Validating file format & size...');
          else if (stage === 'uploading') setUploadStage(`Uploading to Cloud Storage (${percent}%)...`);
          else if (stage === 'saving') setUploadStage('Registering metadata in catalogue...');
          else if (stage === 'completed') setUploadStage('Material uploaded successfully!');
        },
      });

      if (!isMountedRef.current) return;
      setUploadProgress(100);
      setUploadStage('Upload complete!');

      setTimeout(() => {
        if (!isMountedRef.current) return;
        onSuccess(newMaterial);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('[UploadMaterialModal] Error during upload flow:', err);
      if (isMountedRef.current) {
        const friendlyError = formatMaterialUploadError(err);
        setError(friendlyError);
      }
    } finally {
      // Guaranteed loading state cleanup regardless of success or failure
      isSubmittingRef.current = false;
      if (isMountedRef.current) {
        setUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Upload Course Material
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Faculty Instructor: <strong className="text-slate-200">{lecturer.title ? `${lecturer.title} ` : ''}{lecturer.fullName}</strong>
              </p>
            </div>
          </div>

          {!uploading && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <form
          id="lecturer-upload-material-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Upload Failed</span>
                <span className="leading-relaxed">{error}</span>
              </div>
            </div>
          )}

          {/* 1. Course Selection - STRICTLY restricted to assigned courses (Requirements 3 & 4) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                Target Course (Assigned Only)
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                {assignedCourses.length} assigned courses
              </span>
            </label>

            {assignedCourses.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  You have not been assigned any courses yet. Course materials can only be uploaded to official courses assigned to you by administrators.
                </span>
              </div>
            ) : (
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                disabled={uploading}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
              >
                {assignedCourses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.courseCode} — {a.courseTitle} {a.programmeName ? `(${a.programmeName})` : ''} {a.yearOfStudy ? `[Y${a.yearOfStudy}S${a.semester || 1}]` : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Selected Course Context Information */}
            {currentAssignment && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                <span className="text-white font-semibold">
                  {currentAssignment.courseCode} ({currentAssignment.credits} Credits)
                </span>
                {currentAssignment.programmeName && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <GraduationCap className="w-3 h-3 text-emerald-400" />
                    <span>{currentAssignment.programmeName}</span>
                  </span>
                )}
                {currentAssignment.yearOfStudy && (
                  <span className="text-slate-400">
                    Year {currentAssignment.yearOfStudy} • Semester {currentAssignment.semester || 1}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 2. Material Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                Material Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                placeholder="e.g. Chapter 3: Probability Distributions & Hypothesis Testing"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Material Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as AcademicMaterialType)}
                disabled={uploading}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
              >
                {MATERIAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Description / Syllabus Scope (Optional)</span>
              <span className="text-[10px] text-slate-500">Visible to enrolled students</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              rows={2}
              placeholder="Outline what topics this document covers, reading guidelines, or tutorial exercises..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
            />
          </div>

          {/* 4. Drag & Drop File Picker (Requirement 16) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Academic File <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-slate-500 font-mono">Max {MAX_MATERIAL_FILE_SIZE_MB}MB</span>
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!uploading) setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => {
                if (!uploading) fileInputRef.current?.click();
              }}
              className={`p-5 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-rose-500 bg-rose-500/10'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                disabled={uploading}
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="hidden"
                accept={SUPPORTED_ACADEMIC_EXTENSIONS.join(',')}
              />

              {selectedFile ? (
                <div className="flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-white truncate max-w-sm">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Academic document'}
                      </p>
                    </div>
                  </div>

                  {!uploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove selected file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Click to browse or drag and drop your file here
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Bar (Requirement 16) */}
          {uploading && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                  {uploadStage}
                </span>
                <span className="font-mono text-rose-400 font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="lecturer-upload-material-form"
            disabled={uploading || !selectedFile || !title.trim() || assignedCourses.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Material</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
