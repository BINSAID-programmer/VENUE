import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  User,
  Mail,
  Building2,
  GraduationCap,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Hash,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Save,
  Loader2,
  Info,
  ExternalLink,
  ChevronDown,
  Check,
  AlertCircle,
  Phone,
} from 'lucide-react';
import {
  StudentProfile,
  UniversityRecord,
  AcademicUnitRecord,
  DepartmentRecord,
  ProgrammeRecord,
  AcademicYearRecord,
} from '../../../types';
import {
  adminStudentsService,
  AcademicPlacementPayload,
} from '../../../services/adminStudentsService';
import { firestoreCatalogueService } from '../../../services/firestoreCatalogueService';

interface StudentDetailModalProps {
  student: StudentProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusToggle?: (student: StudentProfile, newStatus: 'active' | 'inactive') => Promise<void>;
  isUpdatingStatus?: boolean;
  onAcademicPlacementSaved?: (updatedStudent: StudentProfile) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onStatusToggle,
  isUpdatingStatus = false,
  onAcademicPlacementSaved,
}) => {
  // Current active student state (updated on save)
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(student);

  // Status toggle confirmation state
  const [showStatusConfirm, setShowStatusConfirm] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  // Academic Placement Editing Mode State
  const [isEditingAcademic, setIsEditingAcademic] = useState<boolean>(false);

  // Catalogue Selections
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>('');
  const [selectedAcademicUnitId, setSelectedAcademicUnitId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2025/2026');
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState<string>('Year 1');
  const [selectedSemester, setSelectedSemester] = useState<string>('Semester 1');
  const [registrationNumberInput, setRegistrationNumberInput] = useState<string>('');

  // Dependent Options Lists
  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [academicUnits, setAcademicUnits] = useState<AcademicUnitRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeRecord[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearRecord[]>([]);

  // Loading & Async Validation States
  const [isLoadingCatalogue, setIsLoadingCatalogue] = useState<boolean>(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState<boolean>(false);
  const [isLoadingDepts, setIsLoadingDepts] = useState<boolean>(false);
  const [isLoadingProgs, setIsLoadingProgs] = useState<boolean>(false);
  const [isSavingAcademic, setIsSavingAcademic] = useState<boolean>(false);
  const [academicError, setAcademicError] = useState<string | null>(null);
  const [academicSuccess, setAcademicSuccess] = useState<string | null>(null);
  const [duplicateRegError, setDuplicateRegError] = useState<string | null>(null);
  const [isCheckingReg, setIsCheckingReg] = useState<boolean>(false);

  // Synchronize internal student when prop changes
  useEffect(() => {
    setCurrentStudent(student);
    setIsEditingAcademic(false);
    setShowStatusConfirm(false);
    setAcademicError(null);
    setAcademicSuccess(null);
    setDuplicateRegError(null);
  }, [student, isOpen]);

  // Load universities when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadUniversities = async () => {
      try {
        setIsLoadingCatalogue(true);
        const res = await firestoreCatalogueService.getUniversities({ pageSize: 50 });
        if (isMounted && res.items && res.items.length > 0) {
          setUniversities(res.items);
        }
      } catch (err) {
        console.warn('Failed to load universities for student modal:', err);
      } finally {
        if (isMounted) setIsLoadingCatalogue(false);
      }
    };

    loadUniversities();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Initialize form fields when entering edit mode or when currentStudent changes
  const initFormFromStudent = useCallback(
    async (targetStudent: StudentProfile) => {
      setAcademicError(null);
      setAcademicSuccess(null);
      setDuplicateRegError(null);

      // 1. Resolve university ID (match by universityId or name)
      let uniId = targetStudent.universityId || '';
      if (!uniId && targetStudent.university) {
        const found = universities.find(
          (u) =>
            u.id.toLowerCase() === targetStudent.university.toLowerCase() ||
            u.name.toLowerCase() === targetStudent.university.toLowerCase() ||
            (u.shortName && u.shortName.toLowerCase() === (targetStudent.universityShort || '').toLowerCase())
        );
        uniId = found ? found.id : 'udsm';
      }
      if (!uniId) uniId = 'udsm';
      setSelectedUniversityId(uniId);

      // Load academic years for university
      try {
        const years = await firestoreCatalogueService.getAcademicYears(uniId);
        setAcademicYears(years);
      } catch {
        // fallback
      }

      // 2. Load academic units for university
      setIsLoadingUnits(true);
      let unitsList: AcademicUnitRecord[] = [];
      try {
        const unitsRes = await firestoreCatalogueService.getAcademicUnits(uniId);
        unitsList = unitsRes.items || [];
        setAcademicUnits(unitsList);
      } catch {
        unitsList = [];
      } finally {
        setIsLoadingUnits(false);
      }

      // Match Academic Unit
      let unitId = targetStudent.academicUnitId || targetStudent.collegeId || '';
      if (!unitId && (targetStudent.college || targetStudent.academicUnitName)) {
        const rawUnit = (targetStudent.college || targetStudent.academicUnitName || '').toLowerCase();
        const found = unitsList.find(
          (u) =>
            u.id.toLowerCase() === rawUnit ||
            u.name.toLowerCase().includes(rawUnit) ||
            rawUnit.includes(u.name.toLowerCase()) ||
            (u.abbreviation && rawUnit.includes(u.abbreviation.toLowerCase())) ||
            (u.shortName && rawUnit.includes(u.shortName.toLowerCase()))
        );
        if (found) unitId = found.id;
      }
      if (!unitId && unitsList.length > 0) {
        unitId = unitsList[0].id;
      }
      setSelectedAcademicUnitId(unitId);

      // 3. Load departments for Academic Unit
      let deptsList: DepartmentRecord[] = [];
      if (unitId) {
        setIsLoadingDepts(true);
        try {
          const deptsRes = await firestoreCatalogueService.getDepartments(unitId);
          deptsList = deptsRes.items || [];
          setDepartments(deptsList);
        } catch {
          deptsList = [];
        } finally {
          setIsLoadingDepts(false);
        }
      } else {
        setDepartments([]);
      }

      // Match Department
      let deptId = targetStudent.departmentId || '';
      if (!deptId && (targetStudent.department || targetStudent.departmentName)) {
        const rawDept = (targetStudent.department || targetStudent.departmentName || '').toLowerCase();
        const found = deptsList.find(
          (d) =>
            d.id.toLowerCase() === rawDept ||
            d.name.toLowerCase().includes(rawDept) ||
            rawDept.includes(d.name.toLowerCase())
        );
        if (found) deptId = found.id;
      }
      if (!deptId && deptsList.length > 0) {
        deptId = deptsList[0].id;
      }
      setSelectedDepartmentId(deptId);

      // 4. Load programmes for Department
      let progsList: ProgrammeRecord[] = [];
      if (deptId) {
        setIsLoadingProgs(true);
        try {
          const progsRes = await firestoreCatalogueService.getProgrammes(deptId);
          progsList = progsRes.items || [];
          setProgrammes(progsList);
        } catch {
          progsList = [];
        } finally {
          setIsLoadingProgs(false);
        }
      } else {
        setProgrammes([]);
      }

      // Match Programme
      let progId = targetStudent.programmeId || '';
      if (!progId && (targetStudent.programme || targetStudent.programmeName)) {
        const rawProg = (targetStudent.programme || targetStudent.programmeName || '').toLowerCase();
        const found = progsList.find(
          (p) =>
            p.id.toLowerCase() === rawProg ||
            p.name.toLowerCase().includes(rawProg) ||
            rawProg.includes(p.name.toLowerCase()) ||
            (p.shortName && rawProg.includes(p.shortName.toLowerCase())) ||
            (p.code && rawProg.includes(p.code.toLowerCase()))
        );
        if (found) progId = found.id;
      }
      if (!progId && progsList.length > 0) {
        progId = progsList[0].id;
      }
      setSelectedProgrammeId(progId);

      // 5. Populate metadata fields
      setSelectedAcademicYear(targetStudent.academicYear || '2025/2026');
      setSelectedYearOfStudy(targetStudent.yearOfStudy || 'Year 1');
      setSelectedSemester(targetStudent.semester || 'Semester 1');
      setRegistrationNumberInput(targetStudent.registrationNumber || '');
    },
    [universities]
  );

  // When admin clicks "Edit Academic Placement"
  const handleStartEditAcademic = () => {
    if (!currentStudent) return;
    setIsEditingAcademic(true);
    initFormFromStudent(currentStudent);
  };

  // Dependent Change Handlers:
  // 1. University Change
  const handleUniversityChange = async (newUniId: string) => {
    setSelectedUniversityId(newUniId);
    setSelectedAcademicUnitId('');
    setSelectedDepartmentId('');
    setSelectedProgrammeId('');
    setSelectedYearOfStudy('Year 1');
    setDepartments([]);
    setProgrammes([]);
    setAcademicError(null);

    // Load academic years for new university
    try {
      const years = await firestoreCatalogueService.getAcademicYears(newUniId);
      setAcademicYears(years);
      if (years.length > 0 && !years.some((y) => y.year === selectedAcademicYear)) {
        setSelectedAcademicYear(years[0].year);
      }
    } catch {
      // fallback
    }

    // Load academic units for new university
    setIsLoadingUnits(true);
    try {
      const res = await firestoreCatalogueService.getAcademicUnits(newUniId);
      setAcademicUnits(res.items || []);
    } catch {
      setAcademicUnits([]);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  // 2. Academic Unit Change
  const handleAcademicUnitChange = async (newUnitId: string) => {
    setSelectedAcademicUnitId(newUnitId);
    setSelectedDepartmentId('');
    setSelectedProgrammeId('');
    setSelectedYearOfStudy('Year 1');
    setProgrammes([]);
    setAcademicError(null);

    if (!newUnitId) {
      setDepartments([]);
      return;
    }

    setIsLoadingDepts(true);
    try {
      const res = await firestoreCatalogueService.getDepartments(newUnitId);
      setDepartments(res.items || []);
    } catch {
      setDepartments([]);
    } finally {
      setIsLoadingDepts(false);
    }
  };

  // 3. Department Change
  const handleDepartmentChange = async (newDeptId: string) => {
    setSelectedDepartmentId(newDeptId);
    setSelectedProgrammeId('');
    setSelectedYearOfStudy('Year 1');
    setAcademicError(null);

    if (!newDeptId) {
      setProgrammes([]);
      return;
    }

    setIsLoadingProgs(true);
    try {
      const res = await firestoreCatalogueService.getProgrammes(newDeptId);
      setProgrammes(res.items || []);
    } catch {
      setProgrammes([]);
    } finally {
      setIsLoadingProgs(false);
    }
  };

  // 4. Programme Change
  const handleProgrammeChange = (newProgId: string) => {
    setSelectedProgrammeId(newProgId);
    setSelectedYearOfStudy('Year 1');
    setAcademicError(null);
  };

  // Determine allowed years of study based on chosen programme duration
  const activeProgramme = useMemo(() => {
    return programmes.find((p) => p.id === selectedProgrammeId);
  }, [programmes, selectedProgrammeId]);

  const yearOfStudyOptions = useMemo(() => {
    const duration = activeProgramme?.durationYears || 3;
    const maxYears = Math.min(Math.max(duration, 1), 6);
    return Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`);
  }, [activeProgramme]);

  // Handle Registration Number Blur / Duplicate Check
  const handleRegistrationNumberBlur = async () => {
    const val = registrationNumberInput.trim();
    if (!val || !currentStudent) {
      setDuplicateRegError(null);
      return;
    }

    // If unchanged from existing value, no duplicate conflict with self
    if (val === (currentStudent.registrationNumber || '').trim()) {
      setDuplicateRegError(null);
      return;
    }

    try {
      setIsCheckingReg(true);
      const res = await adminStudentsService.checkRegistrationNumber(val, currentStudent.uid);
      if (!res.isUnique) {
        setDuplicateRegError(
          `Registration number "${val}" is already assigned to student ${res.conflictingStudentName || 'another student'}. Duplicate registration numbers are strictly forbidden.`
        );
      } else {
        setDuplicateRegError(null);
      }
    } catch (err: any) {
      console.warn('Registration number uniqueness check warning:', err);
    } finally {
      setIsCheckingReg(false);
    }
  };

  // Save Academic Placement
  const handleSaveAcademicPlacement = async () => {
    if (!currentStudent?.uid) return;

    setAcademicError(null);
    setAcademicSuccess(null);

    // 1. Validation checks
    if (!selectedUniversityId) {
      setAcademicError('Please select a University from the Academic Catalogue.');
      return;
    }
    if (!selectedAcademicUnitId) {
      setAcademicError('Please select an Academic Unit (College, School, or Institute).');
      return;
    }
    if (!selectedDepartmentId) {
      setAcademicError('Please select an Academic Department.');
      return;
    }
    if (!selectedProgrammeId) {
      setAcademicError('Please select an Enrolled Degree Programme.');
      return;
    }
    if (!selectedAcademicYear) {
      setAcademicError('Please select an Academic Year session.');
      return;
    }
    if (!selectedYearOfStudy) {
      setAcademicError('Please select the student Year of Study.');
      return;
    }
    if (!selectedSemester) {
      setAcademicError('Please select the current active Semester.');
      return;
    }

    // Check duplicate error if present
    if (duplicateRegError) {
      setAcademicError(duplicateRegError);
      return;
    }

    // 2. Resolve catalogue records for canonical names and codes
    const uniRecord = universities.find((u) => u.id === selectedUniversityId);
    const unitRecord = academicUnits.find((u) => u.id === selectedAcademicUnitId);
    const deptRecord = departments.find((d) => d.id === selectedDepartmentId);
    const progRecord = programmes.find((p) => p.id === selectedProgrammeId);

    const payload: AcademicPlacementPayload = {
      university: uniRecord?.name || 'University of Dar es Salaam',
      universityName: uniRecord?.name || 'University of Dar es Salaam',
      universityShort: uniRecord?.shortName || (selectedUniversityId === 'udsm' ? 'UDSM' : 'UNI'),
      universityId: selectedUniversityId,
      college: unitRecord?.name || '',
      academicUnitName: unitRecord?.name || '',
      academicUnitId: selectedAcademicUnitId,
      academicUnitType: unitRecord?.type || 'College',
      department: deptRecord?.name || '',
      departmentName: deptRecord?.name || '',
      departmentId: selectedDepartmentId,
      programme: progRecord?.name || '',
      programmeName: progRecord?.name || '',
      programmeShort: progRecord?.shortName || progRecord?.name || '',
      programmeId: selectedProgrammeId,
      programmeCode: progRecord?.code || '',
      degreeLevel: progRecord?.degreeLevel || progRecord?.awardLevel || "Bachelor's Degree",
      programmeDurationYears: progRecord?.durationYears || 3,
      academicYear: selectedAcademicYear,
      yearOfStudy: selectedYearOfStudy,
      semester: selectedSemester,
      registrationNumber: registrationNumberInput.trim(),
    };

    setIsSavingAcademic(true);
    try {
      const res = await adminStudentsService.updateAcademicPlacement(currentStudent.uid, payload);
      if (res.success && res.profile) {
        setCurrentStudent(res.profile);
        setAcademicSuccess('Student academic placement and enrollment successfully updated in Firestore.');
        if (onAcademicPlacementSaved) {
          onAcademicPlacementSaved(res.profile);
        }
        // Gracefully exit edit mode after confirmation
        setTimeout(() => {
          setIsEditingAcademic(false);
          setAcademicSuccess(null);
        }, 1500);
      } else {
        setAcademicError(res.error || 'Failed to save academic placement. Please check catalogue dependencies.');
      }
    } catch (err: any) {
      setAcademicError(err?.message || 'An unexpected error occurred while saving academic placement.');
    } finally {
      setIsSavingAcademic(false);
    }
  };

  if (!isOpen || !student) return null;

  const activeStudent = currentStudent || student;
  const currentStatus = activeStudent.status || activeStudent.accountStatus || 'active';
  const targetStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const displayName = activeStudent.name || activeStudent.fullName || 'Student User';
  const displayEmail = activeStudent.email || 'No email provided';
  const avatarUrl = activeStudent.profilePhoto || activeStudent.photoURL || activeStudent.avatar;

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return null;
    try {
      return new Date(isoStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const handleConfirmToggle = async () => {
    if (!onStatusToggle) return;
    setStatusFeedback(null);
    try {
      await onStatusToggle(activeStudent, targetStatus);
      setShowStatusConfirm(false);
      setCurrentStudent((prev) =>
        prev
          ? {
              ...prev,
              status: targetStatus,
              accountStatus: targetStatus,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
      setStatusFeedback({
        message:
          targetStatus === 'inactive'
            ? 'Student account was successfully deactivated. Protected features are now paused for this user.'
            : 'Student account was successfully activated. Full platform access has been restored.',
      });
      setTimeout(() => setStatusFeedback(null), 4000);
    } catch (err: any) {
      setStatusFeedback({
        message: err?.message || 'Failed to update student account status.',
        isError: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header with background accent */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-2xl border-2 border-indigo-400/30 shadow-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                  currentStatus === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={`Account is ${currentStatus}`}
              />
            </div>

            {/* Title & Email */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {displayName}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    currentStatus === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {currentStatus === 'active' ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  )}
                  {currentStatus === 'active' ? 'Active Account' : 'Inactive Account'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>{displayEmail}</span>
              </div>

              {activeStudent.creatorTag && (
                <span className="inline-block text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md mt-1">
                  {activeStudent.creatorTag}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Status Feedback Banner */}
          {statusFeedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                statusFeedback.isError
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusFeedback.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span>{statusFeedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusFeedback(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Status Confirmation Prompt if active */}
          {showStatusConfirm && (
            <div
              className={`p-4 rounded-2xl border ${
                targetStatus === 'inactive'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-sm">
                    {targetStatus === 'inactive'
                      ? 'Are you sure you want to deactivate this student account?'
                      : 'Are you sure you want to activate this student account?'}
                  </h4>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {targetStatus === 'inactive'
                      ? 'Deactivating this account marks it as inactive. Protected learning features will be suspended, while academic profile data, course enrollments, and grades remain strictly preserved.'
                      : 'Reactivating this account restores active standing and full access to learning tools for this student profile.'}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleConfirmToggle}
                      disabled={isUpdatingStatus}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition ${
                        targetStatus === 'inactive'
                          ? 'bg-rose-600 hover:bg-rose-500'
                          : 'bg-emerald-600 hover:bg-emerald-500'
                      } disabled:opacity-50 cursor-pointer`}
                    >
                      {isUpdatingStatus
                        ? 'Updating...'
                        : `Confirm ${targetStatus === 'inactive' ? 'Deactivation' : 'Activation'}`}
                    </button>
                    <button
                      onClick={() => setShowStatusConfirm(false)}
                      disabled={isUpdatingStatus}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Information Section (Stage 6C) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                Academic Information
              </h3>

              {!isEditingAcademic ? (
                <button
                  type="button"
                  onClick={handleStartEditAcademic}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Academic Placement</span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Placement Mode
                </span>
              )}
            </div>

            {/* EDIT MODE: Guided Dependent-Selection Workflow */}
            {isEditingAcademic ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-4">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">
                      Guided Dependent Academic Placement:
                    </span>{' '}
                    Selections follow the hierarchy: University → Academic Unit → Department →
                    Programme → Academic Year → Year of Study → Semester. All records are sourced
                    exclusively from the verified Academic Catalogue.
                  </div>
                </div>

                {/* Error Banner */}
                {academicError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <span>{academicError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAcademicError(null)}
                      className="text-rose-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Success Banner */}
                {academicSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{academicSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Step 1: University */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      1. University <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={selectedUniversityId}
                      onChange={(e) => handleUniversityChange(e.target.value)}
                      disabled={isLoadingCatalogue || isSavingAcademic}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      <option value="" disabled>
                        Select University...
                      </option>
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} {u.shortName ? `(${u.shortName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Academic Unit */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      2. Academic Unit (College / School) <span className="text-rose-400">*</span>
                      {isLoadingUnits && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
                    </label>
                    <select
                      value={selectedAcademicUnitId}
                      onChange={(e) => handleAcademicUnitChange(e.target.value)}
                      disabled={!selectedUniversityId || isLoadingUnits || isSavingAcademic}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition cursor-pointer disabled:opacity-50"
                    >
                      <option value="">
                        {!selectedUniversityId
                          ? 'Select University first'
                          : academicUnits.length === 0
                          ? 'No Academic Units Found'
                          : 'Select Academic Unit...'}
                      </option>
                      {academicUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} {unit.shortName || unit.abbreviation ? `(${unit.shortName || unit.abbreviation})` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedUniversityId && academicUnits.length === 0 && !isLoadingUnits && (
                      <p className="text-[11px] text-amber-400 italic">
                        No academic units found. It must first be created through Academic Catalogue Management.
                      </p>
                    )}
                  </div>

                  {/* Step 3: Department */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      3. Academic Department <span className="text-rose-400">*</span>
                      {isLoadingDepts && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
                    </label>
                    <select
                      value={selectedDepartmentId}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      disabled={!selectedAcademicUnitId || isLoadingDepts || isSavingAcademic}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition cursor-pointer disabled:opacity-50"
                    >
                      <option value="">
                        {!selectedAcademicUnitId
                          ? 'Select Academic Unit first'
                          : departments.length === 0
                          ? 'No Departments Found'
                          : 'Select Academic Department...'}
                      </option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {selectedAcademicUnitId && departments.length === 0 && !isLoadingDepts && (
                      <p className="text-[11px] text-amber-400 italic">
                        No departments found. It must first be created through Academic Catalogue Management.
                      </p>
                    )}
                  </div>

                  {/* Step 4: Degree Programme */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      4. Degree Programme <span className="text-rose-400">*</span>
                      {isLoadingProgs && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
                    </label>
                    <select
                      value={selectedProgrammeId}
                      onChange={(e) => handleProgrammeChange(e.target.value)}
                      disabled={!selectedDepartmentId || isLoadingProgs || isSavingAcademic}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition cursor-pointer disabled:opacity-50"
                    >
                      <option value="">
                        {!selectedDepartmentId
                          ? 'Select Department first'
                          : programmes.length === 0
                          ? 'No Programmes Found'
                          : 'Select Degree Programme...'}
                      </option>
                      {programmes.map((prog) => (
                        <option key={prog.id} value={prog.id}>
                          {prog.name} {prog.code ? `(${prog.code})` : ''} - {prog.durationYears || 3} Yrs
                        </option>
                      ))}
                    </select>
                    {selectedDepartmentId && programmes.length === 0 && !isLoadingProgs && (
                      <p className="text-[11px] text-amber-400 italic">
                        No degree programmes found. It must first be created through Academic Catalogue Management.
                      </p>
                    )}
                  </div>

                  {/* Step 5: Academic Year */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      5. Academic Year Session <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={selectedAcademicYear}
                      onChange={(e) => setSelectedAcademicYear(e.target.value)}
                      disabled={isSavingAcademic}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      {academicYears.length > 0 ? (
                        academicYears.map((ay) => (
                          <option key={ay.id} value={ay.year}>
                            {ay.year} {ay.isCurrent ? '(Current Session)' : ''}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="2025/2026">2025/2026 (Current Session)</option>
                          <option value="2024/2025">2024/2025</option>
                          <option value="2023/2024">2023/2024</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Step 6: Year of Study (Dependent on Programme Duration) */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      6. Year of Study <span className="text-rose-400">*</span>
                      {activeProgramme?.durationYears && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          (Max {activeProgramme.durationYears} Years)
                        </span>
                      )}
                    </label>
                    <select
                      value={selectedYearOfStudy}
                      onChange={(e) => setSelectedYearOfStudy(e.target.value)}
                      disabled={!selectedProgrammeId || isSavingAcademic}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition cursor-pointer disabled:opacity-50"
                    >
                      {yearOfStudyOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 7: Semester */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      7. Semester <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      disabled={isSavingAcademic}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>

                  {/* Step 8: Registration Number with duplicate check */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-indigo-400" />
                        8. Registration Number
                      </span>
                      {isCheckingReg && (
                        <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          Checking uniqueness...
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={registrationNumberInput}
                      onChange={(e) => {
                        setRegistrationNumberInput(e.target.value);
                        setDuplicateRegError(null);
                      }}
                      onBlur={handleRegistrationNumberBlur}
                      placeholder="e.g. 2025-04-04444"
                      disabled={isSavingAcademic}
                      className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-white text-xs font-mono focus:outline-none transition ${
                        duplicateRegError
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                    {duplicateRegError && (
                      <p className="text-[11px] text-rose-400 leading-snug">
                        {duplicateRegError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit Form Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAcademic(false);
                      setAcademicError(null);
                      setAcademicSuccess(null);
                    }}
                    disabled={isSavingAcademic}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAcademicPlacement}
                    disabled={isSavingAcademic || Boolean(duplicateRegError)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSavingAcademic ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Placement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Academic Placement</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW MODE: Clean catalogue display of current academic placement */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Registration Number */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-400" />
                    Registration Number
                  </span>
                  <p className="text-sm font-semibold text-white mt-1 font-mono">
                    {activeStudent.registrationNumber || (
                      <span className="text-xs text-amber-400/80 font-sans italic font-normal">
                        Not Assigned
                      </span>
                    )}
                  </p>
                </div>

                {/* University */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    University
                  </span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {activeStudent.university || activeStudent.universityName || (
                      <span className="text-xs text-amber-400/80 italic font-normal">
                        Not Assigned
                      </span>
                    )}
                    {activeStudent.universityShort &&
                      activeStudent.universityShort !== activeStudent.university && (
                        <span className="text-xs text-indigo-400 ml-1.5 font-normal">
                          ({activeStudent.universityShort})
                        </span>
                      )}
                  </p>
                </div>

                {/* Academic Unit (College / School / Institute) */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Academic Unit (College/School)
                  </span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {activeStudent.college || activeStudent.academicUnitName || (
                      <span className="text-xs text-amber-400/80 italic font-normal">
                        Not Assigned
                      </span>
                    )}
                  </p>
                </div>

                {/* Department */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    Department
                  </span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {activeStudent.department || activeStudent.departmentName || (
                      <span className="text-xs text-amber-400/80 italic font-normal">
                        Not Assigned
                      </span>
                    )}
                  </p>
                </div>

                {/* Degree Programme */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      Enrolled Degree Programme
                    </span>
                    {activeStudent.degreeLevel && (
                      <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="w-2.5 h-2.5" />
                        {activeStudent.degreeLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">
                    {activeStudent.programme || activeStudent.programmeName || (
                      <span className="text-xs text-amber-400/80 italic font-normal">
                        Not Assigned
                      </span>
                    )}
                    {activeStudent.programmeCode && (
                      <span className="text-xs text-indigo-300 ml-2 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                        {activeStudent.programmeCode}
                      </span>
                    )}
                  </p>
                </div>

                {/* Academic Year */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Academic Year Session
                  </span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {activeStudent.academicYear || (
                      <span className="text-xs text-amber-400/80 italic font-normal">
                        Not Assigned
                      </span>
                    )}
                  </p>
                </div>

                {/* Year of Study & Semester */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Year of Study & Semester
                  </span>
                  <p className="text-sm font-semibold text-white mt-1">
                    {[activeStudent.yearOfStudy, activeStudent.semester].filter(Boolean).length > 0 ? (
                      [activeStudent.yearOfStudy, activeStudent.semester].filter(Boolean).join(' • ')
                    ) : (
                      <span className="text-xs text-amber-400/80 italic font-normal">
                        Not Assigned
                      </span>
                    )}
                  </p>
                </div>

                {/* Country */}
                {activeStudent.country ? (
                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <span className="text-xs text-slate-400">Country</span>
                    <p className="text-sm font-semibold text-white mt-1">
                      {activeStudent.country}
                    </p>
                  </div>
                ) : null}

                {/* Phone number */}
                {activeStudent.phoneNumber ? (
                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <span className="text-xs text-slate-400">Phone Number</span>
                    <p className="text-sm font-semibold text-white mt-1">
                      {activeStudent.phoneNumber}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Account Metadata Timestamps */}
          <div className="pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Account Metadata & Timestamps
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-800/60">
                <span className="text-slate-400">Firebase User UID:</span>
                <p className="font-mono text-slate-300 mt-1 break-all">
                  {activeStudent.uid || 'Anonymous / Unlinked'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-800/60">
                <span className="text-slate-400">Account Operational Status:</span>
                <p className="font-semibold text-white mt-1 capitalize">
                  {currentStatus}
                </p>
              </div>

              {activeStudent.createdAt && (
                <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-800/60">
                  <span className="text-slate-400">Account Registration Date:</span>
                  <p className="text-slate-200 mt-1 font-medium">
                    {formatDate(activeStudent.createdAt)}
                  </p>
                </div>
              )}

              {activeStudent.updatedAt && (
                <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-800/60">
                  <span className="text-slate-400">Last Profile Update:</span>
                  <p className="text-slate-200 mt-1 font-medium">
                    {formatDate(activeStudent.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            {!showStatusConfirm && onStatusToggle && (
              <button
                type="button"
                onClick={() => setShowStatusConfirm(true)}
                disabled={isUpdatingStatus}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition ${
                  currentStatus === 'active'
                    ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
                } disabled:opacity-50 cursor-pointer`}
              >
                {currentStatus === 'active' ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Deactivate Student Account</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Activate Student Account</span>
                  </>
                )}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
