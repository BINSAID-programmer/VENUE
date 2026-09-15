import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  User,
  GraduationCap,
  Building,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trash2,
  School,
  FileCheck,
  Layers,
  Network,
  Loader2,
  BadgeCheck,
  Award,
  Clock,
} from 'lucide-react';
import { StudentProfile } from '../../types';
import { compressAndFormatImage } from '../../services/studentProfileService';
import {
  academicStructureService,
  UniversityRecord,
  AcademicUnitRecord,
  DepartmentRecord,
  ProgrammeRecord,
} from '../../services/academicStructureService';
import { degreeProgrammeService } from '../../services/degreeProgrammeService';

interface EditProfileScreenProps {
  profile: StudentProfile;
  onSave: (updated: StudentProfile) => Promise<void> | void;
  onCancel: () => void;
  isInitialSetup?: boolean;
}

const ACADEMIC_YEARS = ['2025/2026', '2024/2025', '2026/2027', '2023/2024'];
const SEMESTERS = ['Semester 1', 'Semester 2'];

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  profile,
  onSave,
  onCancel,
  isInitialSetup = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [profilePhoto, setProfilePhoto] = useState<string>(profile.profilePhoto || profile.avatar || '');
  const [registrationNumber, setRegistrationNumber] = useState(profile.registrationNumber || '');

  // Academic Hierarchy States
  const [universitiesList, setUniversitiesList] = useState<UniversityRecord[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>('udsm');
  const [universityName, setUniversityName] = useState<string>(profile.university || 'University of Dar es Salaam');
  const [customUniversity, setCustomUniversity] = useState('');

  const [institutionsList, setInstitutionsList] = useState<AcademicUnitRecord[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [collegeName, setCollegeName] = useState<string>(profile.college || '');
  const [customCollege, setCustomCollege] = useState('');

  const [departmentsList, setDepartmentsList] = useState<DepartmentRecord[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(profile.departmentId || '');
  const [departmentName, setDepartmentName] = useState<string>(profile.department || '');
  const [customDepartment, setCustomDepartment] = useState('');

  const [programmesList, setProgrammesList] = useState<ProgrammeRecord[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>(profile.programmeId || '');
  const [programmeName, setProgrammeName] = useState<string>(profile.programme || '');
  const [customProgramme, setCustomProgramme] = useState('');

  const [academicYear, setAcademicYear] = useState(profile.academicYear || '2025/2026');
  const [yearOfStudy, setYearOfStudy] = useState(profile.yearOfStudy || 'Year 1');
  const [semester, setSemester] = useState(profile.semester || 'Semester 1');
  const [yearsOptions, setYearsOptions] = useState<string[]>(['Year 1', 'Year 2', 'Year 3']);

  // Loading & feedback states
  const [isLoadingStructure, setIsLoadingStructure] = useState(false);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingProgrammes, setIsLoadingProgrammes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 1. Initial Load: Load Universities & Resolve Existing Profile Context
  useEffect(() => {
    let isMounted = true;

    async function loadInitialHierarchy() {
      setIsLoadingStructure(true);
      try {
        const unis = await academicStructureService.getUniversities();
        if (!isMounted) return;
        setUniversitiesList(unis);

        // Resolve existing profile values safely
        const ctx = academicStructureService.resolveProfileContext(profile);
        setSelectedUniversityId(ctx.universityId);
        const resolvedUni = unis.find((u) => u.id === ctx.universityId);
        if (resolvedUni) setUniversityName(resolvedUni.name);

        // Load Academic Units for resolved university
        const units = await academicStructureService.getInstitutions(ctx.universityId);
        if (!isMounted) return;
        setInstitutionsList(units);

        const targetUnit = units.find((u) => u.id === ctx.unitId) || (units.length > 0 ? units[0] : null);
        if (targetUnit) {
          setSelectedUnitId(targetUnit.id);
          setCollegeName(targetUnit.name);

          // Load Departments for target unit
          const depts = await academicStructureService.getDepartments(targetUnit.id, ctx.universityId);
          if (!isMounted) return;
          setDepartmentsList(depts);

          const targetDept = depts.find((d) => d.id === ctx.departmentId) || (depts.length > 0 ? depts[0] : null);
          if (targetDept) {
            setSelectedDepartmentId(targetDept.id);
            setDepartmentName(targetDept.name);

            // Load Programmes for target department
            const progs = await academicStructureService.getProgrammes(
              targetDept.id,
              targetUnit.id,
              ctx.universityId
            );
            if (!isMounted) return;
            setProgrammesList(progs);

            const targetProg = progs.find((p) => p.id === ctx.programmeId) || (progs.length > 0 ? progs[0] : null);
            if (targetProg) {
              setSelectedProgrammeId(targetProg.id);
              setProgrammeName(targetProg.name);
              const yrs = academicStructureService.getYearsOfStudy(targetProg.durationYears || 3);
              setYearsOptions(yrs);
              if (profile.yearOfStudy && yrs.includes(profile.yearOfStudy)) {
                setYearOfStudy(profile.yearOfStudy);
              } else {
                setYearOfStudy(yrs[0] || 'Year 1');
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load initial academic structure:', err);
      } finally {
        if (isMounted) setIsLoadingStructure(false);
      }
    }

    loadInitialHierarchy();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handler: Change University
  // Cascading rule: Reset institution, department, programme, year, and semester
  const handleUniversityChange = async (uniId: string) => {
    setSelectedUniversityId(uniId);
    const matchedUni = universitiesList.find((u) => u.id === uniId);
    setUniversityName(matchedUni ? matchedUni.name : uniId);

    // Cascading Reset: Reset all child selections
    setSelectedUnitId('');
    setCollegeName('');
    setCustomCollege('');
    setSelectedDepartmentId('');
    setDepartmentName('');
    setCustomDepartment('');
    setSelectedProgrammeId('');
    setProgrammeName('');
    setCustomProgramme('');
    setDepartmentsList([]);
    setProgrammesList([]);
    setYearOfStudy('Year 1');
    setSemester('Semester 1');
    setYearsOptions(['Year 1', 'Year 2', 'Year 3']);

    if (uniId === 'other') {
      setInstitutionsList([]);
      return;
    }

    setIsLoadingInstitutions(true);
    try {
      const units = await academicStructureService.getInstitutions(uniId);
      setInstitutionsList(units);
    } catch (err) {
      console.error('Error switching university:', err);
    } finally {
      setIsLoadingInstitutions(false);
    }
  };

  // Handler: Change Academic Unit (College, School, Institute, Centre, Campus)
  // Cascading rule: Reset department, programme, and year
  const handleInstitutionChange = async (unitId: string) => {
    setSelectedUnitId(unitId);

    // Cascading Reset: Reset department and programme
    setSelectedDepartmentId('');
    setDepartmentName('');
    setCustomDepartment('');
    setSelectedProgrammeId('');
    setProgrammeName('');
    setCustomProgramme('');
    setProgrammesList([]);
    setYearOfStudy('Year 1');
    setYearsOptions(['Year 1', 'Year 2', 'Year 3']);

    if (unitId === 'other') {
      setCollegeName('Other / Departmental Faculty');
      setDepartmentsList([]);
      return;
    }

    const matchedUnit = institutionsList.find((u) => u.id === unitId);
    setCollegeName(matchedUnit ? matchedUnit.name : unitId);

    setIsLoadingDepartments(true);
    try {
      const depts = await academicStructureService.getDepartments(unitId, selectedUniversityId);
      setDepartmentsList(depts);
    } catch (err) {
      console.error('Error switching institution:', err);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  // Handler: Change Department
  // Cascading rule: Reset programme and year
  const handleDepartmentChange = async (deptId: string) => {
    setSelectedDepartmentId(deptId);

    // Cascading Reset: Reset programme
    setSelectedProgrammeId('');
    setProgrammeName('');
    setCustomProgramme('');
    setYearOfStudy('Year 1');
    setYearsOptions(['Year 1', 'Year 2', 'Year 3']);

    if (deptId === 'other') {
      setDepartmentName('Other Department');
      setProgrammesList([]);
      return;
    }

    const matchedDept = departmentsList.find((d) => d.id === deptId);
    setDepartmentName(matchedDept ? matchedDept.name : deptId);

    setIsLoadingProgrammes(true);
    try {
      const progs = await academicStructureService.getProgrammes(deptId, selectedUnitId, selectedUniversityId);
      setProgrammesList(progs);
    } catch (err) {
      console.error('Error switching department:', err);
    } finally {
      setIsLoadingProgrammes(false);
    }
  };

  // Handler: Change Programme
  // Updates duration years and resets yearOfStudy if out of bounds
  const handleProgrammeChange = (progId: string) => {
    setSelectedProgrammeId(progId);

    if (progId === 'other') {
      setProgrammeName('Other Degree Programme');
      setYearsOptions(['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']);
      return;
    }

    const matchedProg = programmesList.find((p) => p.id === progId);
    if (matchedProg) {
      setProgrammeName(matchedProg.name);
      const yrs = academicStructureService.getYearsOfStudy(matchedProg.durationYears || 3);
      setYearsOptions(yrs);
      if (!yrs.includes(yearOfStudy)) {
        setYearOfStudy(yrs[0] || 'Year 1');
      }
    }
  };

  // Handle Photo Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processPhotoFile(file);
  };

  const processPhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }
    try {
      setErrorMessage('');
      const compressedDataUrl = await compressAndFormatImage(file, 512, 0.88);
      setProfilePhoto(compressedDataUrl);
    } catch (err: any) {
      console.warn('Error processing photo:', err);
      setErrorMessage('Failed to read image file. Please try a different photo.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processPhotoFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!registrationNumber.trim()) {
      setErrorMessage('Please provide your university Registration Number.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    const isCustomUni = selectedUniversityId === 'other';
    const isCustomCollege = selectedUnitId === 'other';
    const isCustomDept = selectedDepartmentId === 'other';
    const isCustomProg = selectedProgrammeId === 'other';

    if (isCustomUni && !customUniversity.trim()) {
      setIsSaving(false);
      setErrorMessage('Please type the name of your university.');
      return;
    }

    if (isCustomCollege && !customCollege.trim()) {
      setIsSaving(false);
      setErrorMessage('Please enter your college, school, or institute name.');
      return;
    }

    if (isCustomDept && !customDepartment.trim()) {
      setIsSaving(false);
      setErrorMessage('Please enter your academic department name.');
      return;
    }

    if (isCustomProg && !customProgramme.trim()) {
      setIsSaving(false);
      setErrorMessage('Please enter your degree programme name.');
      return;
    }

    // Official hierarchy validation if selecting from catalogue
    if (!isCustomUni && !isCustomCollege && !isCustomDept && !isCustomProg) {
      const hierarchyValidation = degreeProgrammeService.validateSelection({
        universityId: selectedUniversityId,
        academicUnitId: selectedUnitId,
        departmentId: selectedDepartmentId,
        programmeId: selectedProgrammeId,
        yearOfStudy,
        departmentsCatalogue: departmentsList,
        academicUnitsCatalogue: institutionsList,
      });

      if (!hierarchyValidation.valid) {
        setIsSaving(false);
        setErrorMessage(
          hierarchyValidation.errors[0] ||
            'Invalid academic combination: The selected degree programme does not belong to the chosen department.'
        );
        return;
      }

      const validation = await academicStructureService.validateAcademicProfile({
        universityId: selectedUniversityId,
        institutionId: selectedUnitId,
        departmentId: selectedDepartmentId,
        programmeId: selectedProgrammeId,
        yearOfStudy,
        semester,
      });

      if (!validation.valid) {
        setIsSaving(false);
        setErrorMessage(validation.error || 'Please ensure all academic hierarchy selections are complete and valid.');
        return;
      }
    }

    const resolvedUniversity = isCustomUni
      ? customUniversity.trim()
      : universityName || 'University of Dar es Salaam';

    const resolvedCollege = isCustomCollege
      ? customCollege.trim()
      : collegeName || 'Faculty';

    const resolvedDepartment = isCustomDept
      ? customDepartment.trim()
      : departmentName || 'Department';

    const resolvedProgramme = isCustomProg
      ? customProgramme.trim()
      : programmeName || 'Degree Programme';

    const matchedUni = universitiesList.find((u) => u.id === selectedUniversityId);
    const universityShort = matchedUni ? matchedUni.shortName : resolvedUniversity.slice(0, 5).toUpperCase();

    const matchedProg = programmesList.find((p) => p.id === selectedProgrammeId);
    const programmeShort = matchedProg?.shortName || resolvedProgramme.split(' ')[0] || resolvedProgramme;

    const matchedUnit = institutionsList.find((u) => u.id === selectedUnitId);
    const academicUnitType = matchedUnit?.type || 'College';

    const updatedProfile: StudentProfile = {
      ...profile,
      fullName: name.trim(),
      name: name.trim(),
      email: email.trim(),
      profilePhoto: profilePhoto || '',
      photoURL: profilePhoto || '',
      avatar: profilePhoto || '',
      registrationNumber: registrationNumber.trim().toUpperCase(),
      university: resolvedUniversity,
      universityName: resolvedUniversity,
      universityShort,
      universityId: selectedUniversityId,
      college: resolvedCollege,
      collegeId: selectedUnitId,
      institutionId: selectedUnitId,
      institutionName: resolvedCollege,
      academicUnitId: selectedUnitId,
      academicUnitType,
      department: resolvedDepartment,
      departmentName: resolvedDepartment,
      departmentId: selectedDepartmentId,
      programme: resolvedProgramme,
      programmeName: resolvedProgramme,
      programmeShort,
      programmeId: selectedProgrammeId,
      programmeCode: matchedProg?.code || '',
      degreeLevel: matchedProg?.degreeLevel || "Bachelor's Degree",
      programmeDurationYears: matchedProg?.durationYears || 3,
      academicYear,
      yearOfStudy,
      semester,
      isProfileComplete: true,
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSave(updatedProfile);
      setSavedSuccess(true);
      setTimeout(() => {
        onCancel();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const initialLetter = (name || profile.name || 'S').trim().charAt(0).toUpperCase() || 'S';

  return (
    <div className="min-h-full flex flex-col p-4 sm:p-6 pb-24 bg-[#070b14]">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-blue-400" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{isInitialSetup ? 'Complete Your Academic Profile' : 'Edit Academic Profile'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-400 border border-blue-500/30 font-semibold uppercase tracking-wider">
                VENUE Student
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configured via official university catalogue hierarchy (University → Institution → Department → Programme)
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Academic profile saved successfully! Restoring student workspace...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: PROFILE PHOTO UPLOAD */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0a1226] to-slate-900 border border-blue-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-400" />
              1. Student Profile Photo
            </h2>
            <span className="text-[11px] text-slate-400">
              {profilePhoto ? 'Photo selected' : 'No photo uploaded'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 transition-all flex items-center justify-center cursor-pointer shadow-lg ${
                isDragging
                  ? 'border-sky-400 bg-sky-500/20 scale-105'
                  : profilePhoto
                  ? 'border-blue-500/50 bg-slate-950'
                  : 'border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/70 hover:bg-slate-900'
              }`}
              title="Click or drag image to upload"
            >
              {profilePhoto ? (
                <>
                  <img
                    src={profilePhoto}
                    alt="Student Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-medium gap-1">
                    <Camera className="w-5 h-5 text-sky-300" />
                    <span>Change Photo</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2 text-slate-400 group-hover:text-slate-200">
                  <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mb-1 text-sky-400 font-extrabold text-base">
                    {initialLetter}
                  </div>
                  <span className="text-[11px] font-semibold text-sky-400">Upload Photo</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">JPG / PNG / WebP</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2.5 text-center sm:text-left">
              <input
                ref={fileInputRef}
                id="profile-photo-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  id="choose-photo-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{profilePhoto ? 'Choose Another Photo' : 'Upload From Device'}</span>
                </button>

                {profilePhoto && (
                  <button
                    type="button"
                    id="remove-photo-btn"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-medium border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Upload your student portrait or ID photo. Your photo will be saved to your profile and displayed in your workspace.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: ACADEMIC IDENTITY & INSTITUTIONAL HIERARCHY */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-400" />
              2. Academic Identity & Institutional Records
            </h2>
            {isLoadingStructure && (
              <span className="text-[10px] text-sky-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Updating catalogue...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                id="edit-fullname-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John K. Mwamburi"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* University Institutional Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Student Email</span>
              </label>
              <input
                id="edit-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@udsm.ac.tz"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Registration Number */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Registration Number</span>
                  <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-sky-400 font-mono">Format: YYYY-XX-XXXXX</span>
              </label>
              <input
                id="edit-reg-number-input"
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 2024-04-09821 or 2023-04-11045"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase transition-colors"
                required
              />
            </div>

            {/* 1. UNIVERSITY */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-slate-400" />
                  <span>University</span>
                  <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-slate-500">Tier 1: Higher Institution</span>
              </label>
              <select
                id="edit-university-select"
                value={selectedUniversityId}
                onChange={(e) => handleUniversityChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {universitiesList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.shortName}) {u.badge ? `• ${u.badge}` : ''}
                  </option>
                ))}
                <option value="other">Other / Custom University</option>
              </select>

              {selectedUniversityId === 'other' && (
                <input
                  type="text"
                  value={customUniversity}
                  onChange={(e) => setCustomUniversity(e.target.value)}
                  placeholder="Type your university name..."
                  className="w-full mt-2 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              )}
            </div>

            {/* 2. ACADEMIC UNIT (COLLEGE / SCHOOL / INSTITUTE / CENTRE / CAMPUS) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Academic Unit (College / School / Institute / Centre / Campus)</span>
                  <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-slate-500">Tier 2: Academic Unit</span>
              </label>
              <select
                id="edit-college-select"
                value={selectedUnitId}
                onChange={(e) => handleInstitutionChange(e.target.value)}
                disabled={!selectedUniversityId || isLoadingInstitutions}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingInstitutions ? (
                  <option value="">Loading academic units...</option>
                ) : !selectedUnitId ? (
                  <option value="">-- Select Academic Unit --</option>
                ) : null}
                {institutionsList.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    [{unit.type}] {unit.name} ({unit.shortName})
                  </option>
                ))}
                {selectedUniversityId && <option value="other">Other / Departmental Faculty</option>}
              </select>

              {selectedUnitId === 'other' && (
                <input
                  type="text"
                  value={customCollege}
                  onChange={(e) => setCustomCollege(e.target.value)}
                  placeholder="Type your college, school, or institute..."
                  className="w-full mt-2 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              )}
            </div>

            {/* 3. DEPARTMENT */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Network className="w-3.5 h-3.5 text-slate-400" />
                  <span>Department / Academic Section</span>
                  <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-slate-500">Tier 3: Department</span>
              </label>
              <select
                id="edit-department-select"
                value={selectedDepartmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                disabled={!selectedUnitId || isLoadingDepartments}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingDepartments ? (
                  <option value="">Loading departments...</option>
                ) : !selectedUnitId ? (
                  <option value="">Select an Academic Unit first</option>
                ) : departmentsList.length === 0 ? (
                  <option value="">No departments available for this unit</option>
                ) : !selectedDepartmentId ? (
                  <option value="">-- Select Department --</option>
                ) : null}
                {departmentsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
                {selectedUnitId && <option value="other">Other / Specialized Department</option>}
              </select>

              {selectedDepartmentId === 'other' && (
                <input
                  type="text"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  placeholder="Type your academic department..."
                  className="w-full mt-2 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              )}
            </div>

            {/* 4. PROGRAMME */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Degree Programme</span>
                  <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-slate-500">Tier 4: Degree Major</span>
              </label>
              <select
                id="edit-programme-select"
                value={selectedProgrammeId}
                onChange={(e) => handleProgrammeChange(e.target.value)}
                disabled={!selectedDepartmentId || isLoadingProgrammes}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingProgrammes ? (
                  <option value="">Loading degree programmes...</option>
                ) : !selectedDepartmentId ? (
                  <option value="">Select a Department first</option>
                ) : programmesList.length === 0 ? (
                  <option value="">No programmes available for this department</option>
                ) : !selectedProgrammeId ? (
                  <option value="">-- Select Degree Programme --</option>
                ) : null}
                {programmesList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.code ? `[${p.code}]` : p.shortName ? `(${p.shortName})` : ''} • {p.degreeLevel || "Bachelor's Degree"} • {p.durationYears} {p.durationYears === 1 ? 'Year' : 'Years'}
                  </option>
                ))}
                {selectedDepartmentId && <option value="other">Other Degree Programme</option>}
              </select>

              {/* Programme Metadata Card */}
              {selectedProgrammeId && selectedProgrammeId !== 'other' && (() => {
                const prog = programmesList.find((p) => p.id === selectedProgrammeId);
                if (!prog) return null;
                return (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 font-medium text-[11px] flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {prog.degreeLevel || "Bachelor's Degree"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[11px] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {prog.durationYears} {prog.durationYears === 1 ? 'Year' : 'Years'} ({prog.durationYears * 2} Semesters)
                      </span>
                      {prog.verified && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3" />
                          Official Programme
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Structured under <span className="text-slate-200 font-medium">{departmentName || 'Department'}</span>.
                      {prog.source ? ` Source: ${prog.source}` : ''}
                    </p>
                  </div>
                );
              })()}

              {selectedDepartmentId && !isLoadingProgrammes && programmesList.length === 0 && (
                <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                  No official degree programmes currently catalogued for this department in the 2025/2026 prospectus. You can select "Other Degree Programme" to enter your degree manually.
                </div>
              )}

              {selectedProgrammeId === 'other' && (
                <input
                  type="text"
                  value={customProgramme}
                  onChange={(e) => setCustomProgramme(e.target.value)}
                  placeholder="Type your degree programme..."
                  className="w-full mt-2 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Academic Year</span>
                <span className="text-rose-400">*</span>
              </label>
              <select
                id="edit-academic-year-select"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. YEAR OF STUDY */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Year of Study</span>
                <span className="text-rose-400">*</span>
              </label>
              <select
                id="edit-year-of-study-select"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                disabled={!selectedProgrammeId}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!yearOfStudy && <option value="">-- Select Year --</option>}
                {yearsOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. SEMESTER */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Semester</span>
                <span className="text-rose-400">*</span>
              </label>
              <select
                id="edit-semester-select"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {!semester && <option value="">-- Select Semester --</option>}
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            id="save-profile-btn"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Academic Records...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
