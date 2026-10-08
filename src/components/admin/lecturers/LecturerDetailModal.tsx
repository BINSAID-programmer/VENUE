import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Building2,
  Layers,
  Building,
  Mail,
  Phone,
  Briefcase,
  BadgeCheck,
  Clock,
  User,
  ShieldCheck,
  Edit2,
  Power,
  Calendar,
  AlertCircle,
  Link as LinkIcon,
  Unlink,
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import { LecturerRecord, LecturerStatus, LecturerCourseAssignment } from '../../../types';
import { adminLecturersService } from '../../../services/adminLecturersService';
import { lecturerCourseService } from '../../../services/lecturerCourseService';
import { AssignCourseModal } from './AssignCourseModal';

interface LecturerDetailModalProps {
  lecturer: LecturerRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (lecturer: LecturerRecord) => void;
  onStatusToggled: (lecturerId: string, newStatus: LecturerStatus) => void;
  onOpenLinkAccount?: (lecturer: LecturerRecord) => void;
}

export const LecturerDetailModal: React.FC<LecturerDetailModalProps> = ({
  lecturer,
  isOpen,
  onClose,
  onEdit,
  onStatusToggled,
  onOpenLinkAccount,
}) => {
  const [toggling, setToggling] = useState(false);

  // Assigned Courses state (Requirement 2 & 8)
  const [assignedCourses, setAssignedCourses] = useState<LecturerCourseAssignment[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Load assigned courses whenever modal opens
  useEffect(() => {
    if (!isOpen || !lecturer) {
      setAssignedCourses([]);
      return;
    }

    let isMounted = true;
    const fetchCourses = async () => {
      setLoadingCourses(true);
      setRemoveError(null);
      try {
        const list = await lecturerCourseService.getAssignmentsByLecturer(lecturer.id, true);
        if (isMounted) setAssignedCourses(list);
      } catch (err) {
        console.warn('Error loading lecturer courses:', err);
      } finally {
        if (isMounted) setLoadingCourses(false);
      }
    };

    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, [isOpen, lecturer?.id]);

  if (!isOpen || !lecturer) return null;

  const handleToggleStatus = async () => {
    setToggling(true);
    try {
      const newStatus = await adminLecturersService.toggleLecturerStatus(
        lecturer.id,
        lecturer.status
      );
      onStatusToggled(lecturer.id, newStatus);
    } catch (err) {
      console.error('Error toggling lecturer status:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleRemoveAssignment = async (assignment: LecturerCourseAssignment) => {
    const confirmMsg = `Are you sure you want to remove the assignment for "${assignment.courseCode} — ${assignment.courseTitle}" from this lecturer?

This action will ONLY remove the lecturer's teaching assignment relationship. It will NOT delete the course, programme, or any materials.`;

    if (!window.confirm(confirmMsg)) return;

    setRemovingId(assignment.id);
    setRemoveError(null);

    try {
      await lecturerCourseService.removeCourseAssignment(assignment.id, lecturer.id);
      setAssignedCourses((prev) => prev.filter((a) => a.id !== assignment.id));
    } catch (err: any) {
      console.error('Error removing course assignment:', err);
      setRemoveError(err?.message || 'Failed to remove course assignment.');
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Not available';
    try {
      return new Date(isoString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Not available';
    }
  };

  const getVerificationBadge = () => {
    switch (lecturer.verificationStatus) {
      case 'verified':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified Faculty
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Verification Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-start justify-between bg-slate-950/40">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-lg shrink-0">
              {lecturer.fullName ? lecturer.fullName.charAt(0).toUpperCase() : 'L'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {lecturer.status === 'active' ? (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    Inactive
                  </span>
                )}
                {getVerificationBadge()}
                {lecturer.position && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-sky-400 border border-blue-500/20">
                    {lecturer.position}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                {lecturer.title ? `${lecturer.title} ` : ''}
                {lecturer.fullName}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {lecturer.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Institutional Department Placement */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Catalogue Academic Placement
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-slate-400 w-24 shrink-0">University:</span>
                <span className="font-semibold text-white">
                  {lecturer.universityName || lecturer.universityId.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-slate-400 w-24 shrink-0">Academic Unit:</span>
                <span className="font-semibold text-white">
                  {lecturer.academicUnitName || lecturer.academicUnitId || 'Not specified'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-400 w-24 shrink-0">Department:</span>
                <span className="font-semibold text-white">
                  {lecturer.departmentName || lecturer.departmentId || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Identification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Staff ID */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Staff / Employee ID</span>
              <p className="font-mono font-bold text-white text-xs">
                {lecturer.staffId || <span className="text-slate-500 italic font-sans">Not assigned</span>}
              </p>
            </div>

            {/* Phone */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Phone Contact</span>
              <p className="font-medium text-white text-xs">
                {lecturer.phone || <span className="text-slate-500 italic">Not provided</span>}
              </p>
            </div>

            {/* Position / Rank */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Faculty Rank</span>
              <p className="font-semibold text-sky-400 text-xs">
                {lecturer.position || <span className="text-slate-500 italic font-normal">Not designated</span>}
              </p>
            </div>

            {/* Unique Record ID */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400">System Document ID</span>
              <p className="font-mono text-[11px] text-slate-400 truncate" title={lecturer.id}>
                {lecturer.id}
              </p>
            </div>
          </div>

          {/* Account Authentication & Linking Section */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" />
                VENUE Account Identity
              </span>

              {lecturer.accountLinked || lecturer.userId ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/25">
                  <LinkIcon className="w-3 h-3" /> Account linked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  <Unlink className="w-3 h-3 text-slate-500" /> No VENUE account linked
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              {lecturer.accountLinked || lecturer.userId ? (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Firebase Auth UID:</span>
                    <span className="font-mono text-[11px] text-sky-400 truncate max-w-[200px]" title={lecturer.userId}>
                      {lecturer.userId}
                    </span>
                  </div>
                  {lecturer.linkedAt && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400">Linked On:</span>
                      <span className="text-slate-300 font-medium">{formatDate(lecturer.linkedAt)}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-400 text-xs leading-relaxed">
                  This lecturer has not yet connected a verified Firebase Authentication account. Generate an invitation code or link a Firebase UID manually.
                </p>
              )}
            </div>

            {onOpenLinkAccount && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onOpenLinkAccount(lecturer);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{lecturer.accountLinked || lecturer.userId ? 'Manage Account Link' : 'Link VENUE Account'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Assigned Courses Section (Stage 5C - Requirement 2) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  Assigned Courses
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {assignedCourses.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign Course</span>
              </button>
            </div>

            {removeError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{removeError}</span>
              </div>
            )}

            {/* Courses List */}
            {loadingCourses ? (
              <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                <span>Loading assigned courses...</span>
              </div>
            ) : assignedCourses.length === 0 ? (
              <div className="py-6 px-4 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800 space-y-2">
                <p className="text-xs text-slate-400">
                  No courses currently assigned to this faculty member.
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Assign existing accredited courses from the academic catalogue to designate teaching responsibilities.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign First Course</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {assignedCourses.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 group hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
                          {item.courseCode}
                        </span>
                        <span className="font-semibold text-xs text-white truncate max-w-[260px]">
                          {item.courseTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                          {item.credits} Credits
                        </span>
                      </div>

                      {/* Teaching context placement details (Requirement 5) */}
                      <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400">
                        {item.programmeName && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <GraduationCap className="w-3 h-3 text-emerald-400" />
                            <span className="truncate max-w-[200px]">{item.programmeName}</span>
                          </span>
                        )}
                        {item.yearOfStudy && item.semester && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300">
                              Year {item.yearOfStudy}, Semester {item.semester}
                            </span>
                          </>
                        )}
                        {item.departmentName && item.departmentName !== lecturer.departmentName && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded">
                              Cross-Dept: {item.departmentName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        Active
                      </span>

                      {/* Remove Assignment button (Requirement 8) */}
                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(item)}
                        disabled={removingId === item.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove Course Assignment (does not delete course)"
                      >
                        {removingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timestamps & Governance Audit */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-2 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Created / Registered:
              </span>
              <span className="text-slate-300 font-medium">{formatDate(lecturer.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Last Modified:
              </span>
              <span className="text-slate-300 font-medium">{formatDate(lecturer.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
          {/* Status Toggle Action */}
          <button
            onClick={handleToggleStatus}
            disabled={toggling}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              lecturer.status === 'active'
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{lecturer.status === 'active' ? 'Deactivate Lecturer' : 'Activate Lecturer'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(lecturer);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assign Course Modal (Stage 5C - Requirement 3) */}
      <AssignCourseModal
        lecturer={lecturer}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={(newAssignment) => {
          setAssignedCourses((prev) => [newAssignment, ...prev]);
        }}
      />
    </div>
  );
};
