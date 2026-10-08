import React, { useState } from 'react';
import {
  X,
  FileText,
  Building2,
  Layers,
  Building,
  GraduationCap,
  BookOpen,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  User,
  Download,
  Eye,
  FileCode,
  FileCheck,
} from 'lucide-react';
import { AcademicMaterialRecord } from '../../../types';
import { studentMaterialsService } from '../../../services/studentMaterialsService';

interface MaterialDetailModalProps {
  isOpen: boolean;
  material: AcademicMaterialRecord | null;
  onClose: () => void;
  onEdit: (material: AcademicMaterialRecord) => void;
  onDelete: (material: AcademicMaterialRecord) => void;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  isOpen,
  material,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showEmbeddedPreview, setShowEmbeddedPreview] = useState(false);

  if (!isOpen || !material) return null;

  const resolvedPreviewUrl = studentMaterialsService.resolveStorageFileUrl(material, 'view');

  const uploaderName =
    typeof material.uploadedBy === 'object' && material.uploadedBy !== null
      ? material.uploadedBy.name || material.uploadedBy.email || 'Super Admin'
      : material.uploadedBy || 'Super Admin';

  const uploaderRole =
    typeof material.uploadedBy === 'object' && material.uploadedBy !== null
      ? material.uploadedBy.role || 'super_admin'
      : 'super_admin';

  const isPdf = material.mimeType?.includes('pdf') || material.fileName?.toLowerCase().endsWith('.pdf');
  const isImage =
    material.mimeType?.startsWith('image/') ||
    /\.(jpg|jpeg|png)$/i.test(material.fileName || '');
  const canPreviewInBrowser = isPdf || isImage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-8 transition-all ${showEmbeddedPreview ? 'max-w-5xl' : 'max-w-2xl'}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  {material.materialType}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                    material.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : material.status === 'draft'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {material.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mt-1 truncate max-w-md">
                {material.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Embedded Document Previewer */}
          {showEmbeddedPreview && canPreviewInBrowser && resolvedPreviewUrl && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
                <span className="font-semibold text-white truncate max-w-sm">{material.fileName}</span>
                <button
                  onClick={() => setShowEmbeddedPreview(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Close Preview
                </button>
              </div>
              {isPdf ? (
                <iframe
                  src={resolvedPreviewUrl}
                  title={material.title}
                  className="w-full h-96 border-0 bg-white"
                />
              ) : isImage ? (
                <div className="p-4 flex items-center justify-center bg-black/40 max-h-96 overflow-auto">
                  <img src={resolvedPreviewUrl} alt={material.title} className="max-h-80 object-contain rounded-lg" />
                </div>
              ) : null}
            </div>
          )}

          {/* Description */}
          {material.description && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Description / Coverage
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed rounded-xl bg-slate-950/40 border border-slate-800 p-3.5">
                {material.description}
              </p>
            </div>
          )}

          {/* Academic Catalogue Placement Chain */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Academic Catalogue Placement
            </h4>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-slate-400">University:</span>
                <span className="font-semibold text-white">
                  {material.universityName || material.universityId}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Layers className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="text-slate-400">Academic Unit:</span>
                <span className="text-slate-200">
                  {material.academicUnitName || material.academicUnitId}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Building className="h-4 w-4 text-purple-400 shrink-0" />
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-200">
                  {material.departmentName || material.departmentId}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <GraduationCap className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400">Programme:</span>
                <span className="text-slate-200">
                  {material.programmeName || material.programmeId}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs border-t border-slate-800/80 pt-2.5">
                <BookOpen className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-slate-400">Target Course:</span>
                <span className="font-bold text-amber-300">
                  {material.courseCode || 'Course'}
                </span>
                <span className="text-slate-300">
                  {material.courseTitle ? `— ${material.courseTitle}` : ''}
                </span>
                <span className="ml-auto rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-mono">
                  Year {material.yearId} • Semester {material.semesterId}
                </span>
              </div>
            </div>
          </div>

          {/* Cloud Storage File Information & Actions */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Cloud Storage File
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex items-center gap-3 truncate">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{material.fileName}</p>
                  <p className="text-[11px] text-slate-400">
                    {material.fileSize} • <span className="font-mono">{material.mimeType}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {canPreviewInBrowser && (
                  <button
                    type="button"
                    onClick={() => setShowEmbeddedPreview((p) => !p)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{showEmbeddedPreview ? 'Hide Preview' : 'Preview'}</span>
                  </button>
                )}

                {material.fileUrl && (
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            {material.storagePath && (
              <p className="text-[10px] text-slate-500 font-mono mt-1.5 px-1 truncate">
                Storage Reference: {material.storagePath}
              </p>
            )}
          </div>

          {/* Metadata & Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-400 border-t border-slate-800 pt-3">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>Uploaded By: </span>
              <span className="text-slate-200 font-medium">{uploaderName}</span>
              <span className="font-mono text-[10px] text-indigo-400">({uploaderRole})</span>
            </div>

            <div className="flex items-center gap-2 sm:justify-end">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Added: </span>
              <span className="text-slate-200">
                {new Date(material.createdAt).toLocaleDateString()} at{' '}
                {new Date(material.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                onDelete(material);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Material</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onEdit(material);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Metadata</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
