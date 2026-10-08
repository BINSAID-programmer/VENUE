import React, { useState, useEffect, useId } from 'react';
import {
  X,
  Save,
  UserCheck,
  AlertCircle,
  Building2,
  Layers,
  Building,
  Mail,
  Phone,
  Briefcase,
  BadgeCheck,
} from 'lucide-react';
import {
  UniversityRecord,
  AcademicUnitRecord,
  DepartmentRecord,
  LecturerStatus,
  LecturerVerificationStatus,
  LecturerRecord,
} from '../../../types';
import {
  adminLecturersService,
  LECTURER_TITLES,
  LECTURER_POSITIONS,
} from '../../../services/adminLecturersService';
import { adminCatalogueService } from '../../../services/adminCatalogueService';

interface EditLecturerModalProps {
  lecturer: LecturerRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: LecturerRecord) => void;
}

export const EditLecturerModal: React.FC<EditLecturerModalProps> = ({
  lecturer,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const uniSelectId = useId();
  const unitSelectId = useId();
  const deptSelectId = useId();
  const titleSelectId = useId();
  const nameInputId = useId();
  const emailInputId = useId();
  const staffIdInputId = useId();
  const phoneInputId = useId();
  const positionSelectId = useId();
  const statusSelectId = useId();
  const verificationSelectId = useId();

  // Catalogue Hierarchy State
  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [academicUnits, setAcademicUnits] = useState<AcademicUnitRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);

  // Loading States
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [selectedUniId, setSelectedUniId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  const [title, setTitle] = useState<string>('Dr.');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [staffId, setStaffId] = useState<string>('');
  const [position, setPosition] = useState<string>('Lecturer');
  const [status, setStatus] = useState<LecturerStatus>('active');
  const [verificationStatus, setVerificationStatus] = useState<LecturerVerificationStatus>('verified');

  // Populate form with existing lecturer values
  useEffect(() => {
    if (lecturer && isOpen) {
      setSelectedUniId(lecturer.universityId || 'udsm');
      setSelectedUnitId(lecturer.academicUnitId || '');
      setSelectedDeptId(lecturer.departmentId || '');
      setTitle(lecturer.title || 'Dr.');
      setFullName(lecturer.fullName || '');
      setEmail(lecturer.email || '');
      setPhone(lecturer.phone || '');
      setStaffId(lecturer.staffId || '');
      setPosition(lecturer.position || 'Lecturer');
      setStatus(lecturer.status || 'active');
      setVerificationStatus(lecturer.verificationStatus || 'verified');
      setError(null);
    }
  }, [lecturer, isOpen]);

  // Load Universities on Mount
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const loadUnis = async () => {
      setLoadingUnis(true);
      try {
        const unis = await adminCatalogueService.getUniversities();
        if (isMounted) {
          setUniversities(unis);
        }
      } catch (err) {
        console.warn('Error loading universities:', err);
      } finally {
        if (isMounted) setLoadingUnis(false);
      }
    };

    loadUnis();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // When University changes, load Academic Units
  useEffect(() => {
    if (!selectedUniId) {
      setAcademicUnits([]);
      return;
    }

    let isMounted = true;
    const loadUnits = async () => {
      setLoadingUnits(true);
      try {
        const units = await adminCatalogueService.getAcademicUnits(selectedUniId);
        if (isMounted) {
          setAcademicUnits(units);
        }
      } catch (err) {
        console.warn('Error loading units:', err);
      } finally {
        if (isMounted) setLoadingUnits(false);
      }
    };

    loadUnits();
    return () => {
      isMounted = false;
    };
  }, [selectedUniId]);

  // When Academic Unit changes, load Departments
  useEffect(() => {
    if (!selectedUnitId) {
      setDepartments([]);
      return;
    }

    let isMounted = true;
    const loadDepts = async () => {
      setLoadingDepts(true);
      try {
        const depts = await adminCatalogueService.getDepartmentsByUnit(selectedUnitId);
        if (isMounted) {
          setDepartments(depts);
        }
      } catch (err) {
        console.warn('Error loading departments:', err);
      } finally {
        if (isMounted) setLoadingDepts(false);
      }
    };

    loadDepts();
    return () => {
      isMounted = false;
    };
  }, [selectedUnitId]);

  if (!isOpen || !lecturer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Lecturer full name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid institutional email.');
      return;
    }

    if (!selectedDeptId) {
      setError('Please select an academic Department.');
      return;
    }

    setSubmitting(true);

    try {
      const selectedUni = universities.find((u) => u.id === selectedUniId);
      const selectedUnit = academicUnits.find((u) => u.id === selectedUnitId);
      const selectedDept = departments.find((d) => d.id === selectedDeptId);

      const updated = await adminLecturersService.updateLecturer(lecturer.id, {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        staffId: staffId.trim(),
        title: title.trim(),
        position: position.trim(),
        status,
        verificationStatus,
        universityId: selectedUniId,
        academicUnitId: selectedUnitId,
        departmentId: selectedDeptId,
        universityName: selectedUni?.name || lecturer.universityName,
        academicUnitName: selectedUnit?.name || lecturer.academicUnitName,
        departmentName: selectedDept?.name || lecturer.departmentName,
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error('Error updating lecturer:', err);
      setError(err?.message || 'Failed to update lecturer record in Firestore.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Edit Lecturer Details
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update faculty member credentials, status, or departmental assignment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Department Placement */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Department Assignment (Catalogue Reference)
              </span>
              <span className="text-[10px] text-slate-500">Catalogue remains unchanged</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. University */}
              <div className="space-y-1">
                <label htmlFor={uniSelectId} className="text-[11px] font-semibold text-slate-400">University</label>
                <select
                  id={uniSelectId}
                  value={selectedUniId}
                  onChange={(e) => setSelectedUniId(e.target.value)}
                  disabled={loadingUnis || submitting}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.shortName || u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Academic Unit */}
              <div className="space-y-1">
                <label htmlFor={unitSelectId} className="text-[11px] font-semibold text-slate-400">Academic Unit</label>
                <select
                  id={unitSelectId}
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  disabled={loadingUnits || submitting}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {academicUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.shortName || unit.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Department */}
              <div className="space-y-1">
                <label htmlFor={deptSelectId} className="text-[11px] font-semibold text-slate-400">Department *</label>
                <select
                  id={deptSelectId}
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  disabled={loadingDepts || submitting}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Identity & Contact Info */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              Lecturer Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Title */}
              <div className="sm:col-span-3 space-y-1">
                <label htmlFor={titleSelectId} className="text-[11px] font-semibold text-slate-400">Title / Salutation</label>
                <select
                  id={titleSelectId}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {LECTURER_TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name */}
              <div className="sm:col-span-9 space-y-1">
                <label htmlFor={nameInputId} className="text-[11px] font-semibold text-slate-400">Full Name *</label>
                <input
                  id={nameInputId}
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-6 space-y-1">
                <label htmlFor={emailInputId} className="text-[11px] font-semibold text-slate-400">Institutional Email *</label>
                <input
                  id={emailInputId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Staff ID */}
              <div className="sm:col-span-6 space-y-1">
                <label htmlFor={staffIdInputId} className="text-[11px] font-semibold text-slate-400">Staff ID</label>
                <input
                  id={staffIdInputId}
                  type="text"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="e.g. UDSM/ST/2024/042"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Phone */}
              <div className="sm:col-span-6 space-y-1">
                <label htmlFor={phoneInputId} className="text-[11px] font-semibold text-slate-400">Phone</label>
                <input
                  id={phoneInputId}
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Position */}
              <div className="sm:col-span-6 space-y-1">
                <label htmlFor={positionSelectId} className="text-[11px] font-semibold text-slate-400">Rank / Position</label>
                <select
                  id={positionSelectId}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {LECTURER_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Status & Verification */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
              Administrative Governance
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor={statusSelectId} className="text-[11px] font-semibold text-slate-400">Status</label>
                <select
                  id={statusSelectId}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LecturerStatus)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Active (Teaching / Employed)</option>
                  <option value="inactive">Inactive (Sabbatical / Leave)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor={verificationSelectId} className="text-[11px] font-semibold text-slate-400">Verification Status</label>
                <select
                  id={verificationSelectId}
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value as LecturerVerificationStatus)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="verified">Verified</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting || !fullName.trim() || !email.trim() || !selectedDeptId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Lecturer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
