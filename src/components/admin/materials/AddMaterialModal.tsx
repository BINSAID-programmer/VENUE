import React, { useState, useEffect, useId, useRef } from 'react';
import {
  X,
  Plus,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  Building,
  GraduationCap,
  BookOpen,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  AcademicMaterialRecord,
  AcademicMaterialType,
  MaterialStatus,
  UniversityRecord,
  AcademicUnitRecord,
  DepartmentRecord,
  ProgrammeRecord,
  CourseRecord,
} from '../../../types';
import { adminCatalogueService } from '../../../services/adminCatalogueService';
import {
  adminMaterialsService,
  MATERIAL_TYPES,
  MAX_MATERIAL_FILE_SIZE_MB,
  SUPPORTED_ACADEMIC_EXTENSIONS,
  FileValidationResult,
  formatMaterialUploadError,
} from '../../../services/adminMaterialsService';
import { auth } from '../../../services/firebase';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMaterialCreated: (material: AcademicMaterialRecord) => void;
}

type UploadState = 'idle' | 'preparing' | 'uploading' | 'saving' | 'completed' | 'failed';

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  onMaterialCreated,
}) => {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Academic Placement Hierarchy Cascades
  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [academicUnits, setAcademicUnits] = useState<AcademicUnitRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);

  // Selected Placement IDs
  const [selectedUniId, setSelectedUniId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedProgId, setSelectedProgId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // Loading & Error States for Hierarchy
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingProgs, setLoadingProgs] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [coursesReloadKey, setCoursesReloadKey] = useState(0);

  // Material Metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState<AcademicMaterialType>('Lecture Notes');
  const [status, setStatus] = useState<MaterialStatus>('active');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileValidation, setFileValidation] = useState<FileValidationResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Upload Progress & Feedback States
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Universities on open
  useEffect(() => {
    if (!isOpen) return;

    const loadUniversities = async () => {
      try {
        const unis = await adminCatalogueService.getUniversities();
        setUniversities(unis);
        if (unis.length > 0 && !selectedUniId) {
          setSelectedUniId(unis[0].id);
        }
      } catch (err) {
        console.warn('Error loading universities:', err);
      }
    };

    loadUniversities();
  }, [isOpen]);

  // When University changes, load Academic Units
  useEffect(() => {
    if (!selectedUniId) {
      setAcademicUnits([]);
      setSelectedUnitId('');
      setDepartments([]);
      setSelectedDeptId('');
      setProgrammes([]);
      setSelectedProgId('');
      setCourses([]);
      setSelectedCourseId('');
      return;
    }

    let isMounted = true;
    const loadUnits = async () => {
      setLoadingUnits(true);
      setAcademicUnits([]);
      setSelectedUnitId('');
      try {
        const units = (await adminCatalogueService.getAcademicUnits(selectedUniId)).filter(
          (u) => !u.archived && u.status !== 'archived' && u.active !== false
        );
        if (isMounted) {
          setAcademicUnits(units);
          if (units.length > 0) {
            setSelectedUnitId(units[0].id);
          } else {
            setSelectedUnitId('');
          }
        }
      } catch (err) {
        console.warn('Error loading academic units:', err);
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
      setSelectedDeptId('');
      setProgrammes([]);
      setSelectedProgId('');
      setCourses([]);
      setSelectedCourseId('');
      return;
    }

    let isMounted = true;
    const loadDepts = async () => {
      setLoadingDepts(true);
      setDepartments([]);
      setSelectedDeptId('');
      try {
        const depts = (await adminCatalogueService.getDepartmentsByUnit(selectedUnitId)).filter(
          (d) => !d.archived && d.status !== 'archived' && d.active !== false
        );
        if (isMounted) {
          setDepartments(depts);
          if (depts.length > 0) {
            setSelectedDeptId(depts[0].id);
          } else {
            setSelectedDeptId('');
          }
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

  // When Department changes, load Programmes
  useEffect(() => {
    if (!selectedDeptId) {
      setProgrammes([]);
      setSelectedProgId('');
      setCourses([]);
      setSelectedCourseId('');
      return;
    }

    let isMounted = true;
    const loadProgs = async () => {
      setLoadingProgs(true);
      setProgrammes([]);
      setSelectedProgId('');
      try {
        const progs = (await adminCatalogueService.getProgrammesByDepartment(selectedDeptId)).filter(
          (p) => !p.archived && p.status !== 'archived' && p.active !== false
        );
        if (isMounted) {
          setProgrammes(progs);
          if (progs.length > 0) {
            setSelectedProgId(progs[0].id);
          } else {
            setSelectedProgId('');
          }
        }
      } catch (err) {
        console.warn('Error loading programmes:', err);
      } finally {
        if (isMounted) setLoadingProgs(false);
      }
    };

    loadProgs();
    return () => {
      isMounted = false;
    };
  }, [selectedDeptId]);

  // Structure & Duration of selected programme
  const currentProgramme = programmes.find((p) => p.id === selectedProgId);
  const progStructure = currentProgramme
    ? adminCatalogueService.getProgrammeYearStructure(currentProgramme)
    : [
        {
          yearNumber: 1,
          label: 'Year 1',
          semesters: [
            { semesterNumber: 1, label: 'Semester 1' },
            { semesterNumber: 2, label: 'Semester 2' },
          ],
        },
        {
          yearNumber: 2,
          label: 'Year 2',
          semesters: [
            { semesterNumber: 1, label: 'Semester 1' },
            { semesterNumber: 2, label: 'Semester 2' },
          ],
        },
        {
          yearNumber: 3,
          label: 'Year 3',
          semesters: [
            { semesterNumber: 1, label: 'Semester 1' },
            { semesterNumber: 2, label: 'Semester 2' },
          ],
        },
      ];

  const currentYearConfig =
    progStructure.find((y) => y.yearNumber === selectedYear) || progStructure[0];
  const validSemesters = currentYearConfig?.semesters?.length
    ? currentYearConfig.semesters
    : [
        { semesterNumber: 1, label: 'Semester 1' },
        { semesterNumber: 2, label: 'Semester 2' },
      ];

  // When Programme changes, ensure Year and Semester are valid for this programme
  useEffect(() => {
    if (!selectedProgId || !currentProgramme) return;
    const struct = adminCatalogueService.getProgrammeYearStructure(currentProgramme);
    if (struct.length > 0 && !struct.some((y) => y.yearNumber === selectedYear)) {
      setSelectedYear(struct[0].yearNumber);
    }
  }, [selectedProgId, currentProgramme]);

  // When Year changes, ensure Semester is valid for this year
  useEffect(() => {
    if (!validSemesters.some((s) => s.semesterNumber === selectedSemester)) {
      setSelectedSemester(validSemesters[0]?.semesterNumber || 1);
    }
  }, [selectedYear, selectedProgId]);

  // When Programme, Year, or Semester changes, load Courses
  useEffect(() => {
    if (!selectedProgId || !selectedYear || !selectedSemester) {
      setCourses([]);
      setSelectedCourseId('');
      setCoursesError(null);
      setLoadingCourses(false);
      return;
    }

    let isMounted = true;
    // Immediately clear stale courses from previous programme/term before fetching
    setCourses([]);
    setSelectedCourseId('');
    setCoursesError(null);
    setLoadingCourses(true);

    const loadCourses = async () => {
      try {
        const courseList = await adminCatalogueService.getCoursesByTerm(
          selectedProgId,
          selectedYear,
          selectedSemester
        );
        if (isMounted) {
          setCourses(courseList);
          if (courseList.length > 0) {
            setSelectedCourseId(courseList[0].id);
          } else {
            setSelectedCourseId('');
          }
        }
      } catch (err: any) {
        console.error('[AddMaterialModal] Error loading courses for term:', err);
        if (isMounted) {
          setCourses([]);
          setSelectedCourseId('');
          setCoursesError('Unable to load courses. Please try again.');
        }
      } finally {
        if (isMounted) setLoadingCourses(false);
      }
    };

    loadCourses();
    return () => {
      isMounted = false;
    };
  }, [selectedProgId, selectedYear, selectedSemester, coursesReloadKey]);

  // Handle file selection with validation
  const handleFileSelected = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileValidation(null);
      return;
    }

    const validation = adminMaterialsService.validateMaterialFile(file);
    setSelectedFile(file);
    setFileValidation(validation);

    if (validation.valid && !title.trim()) {
      // Auto-suggest clean title from file name
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(cleanTitle);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const isFormSubmitting = uploadState === 'preparing' || uploadState === 'uploading' || uploadState === 'saving';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isFormSubmitting) return; // Prevent duplicate uploads

    setErrorMessage(null);

    // Verify Authentication State
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage('Authentication required: Please sign in with an administrator account to upload materials.');
      return;
    }

    // Form Validations
    if (!title.trim()) {
      setErrorMessage('Missing required information: Please enter a descriptive material title.');
      return;
    }

    if (!selectedUniId) {
      setErrorMessage('Missing required information: Please select an accredited University.');
      return;
    }

    if (!selectedUnitId) {
      setErrorMessage('Missing required information: Please select an Academic Unit (College, School, or Institute).');
      return;
    }

    if (!selectedDeptId) {
      setErrorMessage('Missing required information: Please select a Department.');
      return;
    }

    if (!selectedProgId) {
      setErrorMessage('Missing required information: Please select a Degree Programme.');
      return;
    }

    if (!selectedCourseId) {
      setErrorMessage('Missing required information: Please select the Target Course.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Invalid file: Please select an academic document file to upload.');
      return;
    }

    const validation = adminMaterialsService.validateMaterialFile(selectedFile);
    if (!validation.valid) {
      setErrorMessage(formatMaterialUploadError(validation.error || 'The selected file is invalid.'));
      return;
    }

    const currentCourse = courses.find((c) => c.id === selectedCourseId);
    const currentUnit = academicUnits.find((u) => u.id === selectedUnitId);
    const currentDept = departments.find((d) => d.id === selectedDeptId);
    const currentUni = universities.find((u) => u.id === selectedUniId);

    isSubmittingRef.current = true;
    setUploadState('preparing');
    setUploadProgress(5);

    try {
      const created = await adminMaterialsService.createMaterialWithFile(
        {
          title: title.trim(),
          description: description.trim(),
          materialType,
          status,
          // Strict Academic Placement References
          universityId: selectedUniId,
          academicUnitId: selectedUnitId,
          departmentId: selectedDeptId,
          programmeId: selectedProgId,
          yearId: selectedYear,
          semesterId: selectedSemester,
          courseId: selectedCourseId,
          // Contextual Display Cache
          courseCode: currentCourse?.code || '',
          courseTitle: currentCourse?.title || '',
          programmeName: currentProgramme?.name || '',
          departmentName: currentDept?.name || '',
          academicUnitName: currentUnit?.name || '',
          universityName: currentUni?.name || '',
          uploadedBy: {
            uid: user.uid,
            email: user.email || 'admin@venue.ac.tz',
            name: user.displayName || 'Administrator',
            role: 'super_admin',
          },
        },
        selectedFile,
        (progress, state) => {
          if (!isMountedRef.current) return;
          setUploadProgress(progress);
          setUploadState(state);
        }
      );

      if (!isMountedRef.current) return;
      setUploadState('completed');
      setUploadProgress(100);

      // Brief completion delay before closing
      setTimeout(() => {
        if (!isMountedRef.current) return;
        onMaterialCreated(created);
        handleResetAndClose();
      }, 600);
    } catch (err: any) {
      console.error('[AddMaterialModal] Error during upload flow:', err);
      if (isMountedRef.current) {
        setUploadState('failed');
        setErrorMessage(formatMaterialUploadError(err));
      }
    } finally {
      // Guaranteed loading state cleanup regardless of success or failure
      isSubmittingRef.current = false;
    }
  };

  const handleResetAndClose = () => {
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setFileValidation(null);
    setUploadState('idle');
    setUploadProgress(0);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Upload Academic Material</h3>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  Cloud Storage
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upload verified files directly to Cloud Storage and map them to the official catalogue.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            disabled={isFormSubmitting}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Status / Progress Banner */}
        {uploadState !== 'idle' && (
          <div
            className={`border-b px-6 py-3.5 transition-colors ${
              uploadState === 'completed'
                ? 'bg-emerald-950/40 border-emerald-500/30'
                : uploadState === 'failed'
                ? 'bg-rose-950/40 border-rose-500/30'
                : 'bg-indigo-950/40 border-indigo-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <div className="flex items-center gap-2">
                {uploadState === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : uploadState === 'failed' ? (
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                ) : (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                )}
                <span
                  className={
                    uploadState === 'completed'
                      ? 'text-emerald-300'
                      : uploadState === 'failed'
                      ? 'text-rose-300'
                      : 'text-indigo-300'
                  }
                >
                  {uploadState === 'preparing' && 'Preparing upload to Cloud Storage...'}
                  {uploadState === 'uploading' && `Uploading file... ${uploadProgress}%`}
                  {uploadState === 'saving' && 'Writing material metadata to Firestore...'}
                  {uploadState === 'completed' && 'Academic material uploaded successfully!'}
                  {uploadState === 'failed' && 'Upload failed. You can retry below.'}
                </span>
              </div>
              <span className="font-mono text-slate-300">{uploadProgress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  uploadState === 'completed'
                    ? 'bg-emerald-500'
                    : uploadState === 'failed'
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-indigo-500 to-amber-500'
                }`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                {uploadState === 'failed' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setUploadState('idle');
                    }}
                    className="mt-2 block font-semibold text-rose-200 underline hover:text-white"
                  >
                    Dismiss and Retry
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Section 1: Academic Placement Hierarchy */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <GraduationCap className="h-4 w-4 text-indigo-400" />
              <span>Academic Catalogue Placement</span>
              <span className="text-[10px] text-slate-500 font-normal">
                (Strict reference hierarchy: University → Unit → Dept → Programme → Term → Course)
              </span>
            </div>

            {/* University & Academic Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${formId}-uni`} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  1. University
                </label>
                <select
                  id={`${formId}-uni`}
                  disabled={isFormSubmitting}
                  value={selectedUniId}
                  onChange={(e) => setSelectedUniId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                >
                  {universities.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name} ({uni.shortName || 'UDSM'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={`${formId}-unit`} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  2. Academic Unit / College
                </label>
                <select
                  id={`${formId}-unit`}
                  disabled={isFormSubmitting || loadingUnits || academicUnits.length === 0}
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                >
                  {academicUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.shortName ? `${u.shortName} — ` : ''}{u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department & Programme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${formId}-dept`} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  3. Department
                </label>
                <select
                  id={`${formId}-dept`}
                  disabled={isFormSubmitting || loadingDepts || departments.length === 0}
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                >
                  {loadingDepts && <option value="">Loading departments...</option>}
                  {!loadingDepts && departments.length === 0 && (
                    <option value="">No departments available</option>
                  )}
                  {!loadingDepts &&
                    departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label htmlFor={`${formId}-prog`} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  4. Degree Programme
                </label>
                <select
                  id={`${formId}-prog`}
                  disabled={isFormSubmitting || loadingProgs || programmes.length === 0}
                  value={selectedProgId}
                  onChange={(e) => {
                    const nextProgId = e.target.value;
                    setSelectedProgId(nextProgId);
                    setSelectedYear(1);
                    setSelectedSemester(1);
                    setSelectedCourseId('');
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                >
                  {loadingProgs && <option value="">Loading programmes...</option>}
                  {!loadingProgs && programmes.length === 0 && (
                    <option value="">No programmes found</option>
                  )}
                  {!loadingProgs &&
                    programmes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code ? `[${p.code}] ` : ''}{p.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Year, Semester & Course */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor={`${formId}-year`} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  5. Year of Study
                </label>
                <select
                  id={`${formId}-year`}
                  disabled={isFormSubmitting || !selectedProgId}
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setSelectedSemester(1);
                    setSelectedCourseId('');
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                >
                  {progStructure.map((yr) => (
                    <option key={yr.yearNumber} value={yr.yearNumber}>
                      {yr.label || `Year ${yr.yearNumber}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={`${formId}-sem`} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  6. Semester
                </label>
                <select
                  id={`${formId}-sem`}
                  disabled={isFormSubmitting || !selectedProgId}
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(Number(e.target.value));
                    setSelectedCourseId('');
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                >
                  {validSemesters.map((sem) => (
                    <option key={sem.semesterNumber} value={sem.semesterNumber}>
                      {sem.label || `Semester ${sem.semesterNumber}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor={`${formId}-course`} className="block text-xs font-semibold text-slate-300">
                    7. Target Course <span className="text-amber-400">*</span>
                  </label>
                  {coursesError && (
                    <button
                      type="button"
                      onClick={() => setCoursesReloadKey((k) => k + 1)}
                      className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 underline"
                    >
                      Retry
                    </button>
                  )}
                </div>
                <select
                  id={`${formId}-course`}
                  disabled={isFormSubmitting || loadingCourses || !selectedProgId}
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-white focus:outline-none disabled:opacity-50 ${
                    coursesError
                      ? 'border-rose-500/60 bg-rose-950/30 text-rose-200 focus:border-rose-500'
                      : 'border-slate-700 bg-slate-800/90 focus:border-indigo-500'
                  }`}
                >
                  {loadingCourses && <option value="">Loading courses...</option>}
                  {!loadingCourses && coursesError && (
                    <option value="">Unable to load courses. Please try again.</option>
                  )}
                  {!loadingCourses && !coursesError && courses.length === 0 && (
                    <option value="">No courses assigned to this term.</option>
                  )}
                  {!loadingCourses &&
                    !coursesError &&
                    courses.map((c) => {
                      const cCode = c.code || c.courseCode || c.id;
                      const cTitle = c.title || c.courseTitle || 'Course';
                      const cCredits = c.credits ? ` (${c.credits} Credits)` : '';
                      return (
                        <option key={c.id} value={c.id}>
                          {cCode} — {cTitle}{cCredits}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: File Upload (Real Firebase Cloud Storage) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <UploadCloud className="h-4 w-4 text-sky-400" />
                <span>Document File Upload</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Max {MAX_MATERIAL_FILE_SIZE_MB}MB
              </span>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isFormSubmitting && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-950/20'
                  : selectedFile && fileValidation?.valid
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : selectedFile && !fileValidation?.valid
                  ? 'border-rose-500/40 bg-rose-950/10'
                  : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
              } ${isFormSubmitting ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                disabled={isFormSubmitting}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-indigo-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-md">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {fileValidation?.formattedSize} •{' '}
                      <span className="font-mono text-indigo-300 uppercase">
                        {fileValidation?.extension.replace('.', '')}
                      </span>
                    </p>
                  </div>

                  {fileValidation?.valid ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Ready for Cloud Storage upload</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-[11px] font-semibold text-rose-300">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                      <span>{fileValidation?.error}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500">Click or drag a new file to replace</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <UploadCloud className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-200">
                    Click to browse or drag and drop your file here
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supported: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG
                  </p>
                </div>
              )}
            </div>

            {/* Storage Reference Path Preview */}
            {selectedCourseId && selectedFile && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-[11px] text-slate-400 font-mono">
                <span className="text-slate-500 block mb-0.5">Canonical Cloud Storage Target:</span>
                <span className="text-indigo-300 break-all">
                  materials/{selectedUniId || 'udsm'}/{selectedCourseId}/mat_.../
                  {fileValidation?.safeFileName || 'document.pdf'}
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Material Metadata */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FileText className="h-4 w-4 text-amber-400" />
              <span>Material Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${formId}-type`} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Material Type <span className="text-amber-400">*</span>
                </label>
                <select
                  id={`${formId}-type`}
                  disabled={isFormSubmitting}
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
                  disabled={isFormSubmitting}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MaterialStatus)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="active">Active (Visible to Students)</option>
                  <option value="draft">Draft (Admin Staging Only)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor={`${formId}-title`} className="block text-xs font-semibold text-slate-300 mb-1.5">
                Material Title <span className="text-rose-400">*</span>
              </label>
              <input
                id={`${formId}-title`}
                type="text"
                required
                disabled={isFormSubmitting}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Week 4: Relational Database Normalization & 3NF Proofs"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor={`${formId}-desc`} className="block text-xs font-semibold text-slate-300 mb-1.5">
                Description / Coverage Summary
              </label>
              <textarea
                id={`${formId}-desc`}
                rows={2}
                disabled={isFormSubmitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional syllabus reference, lecture objectives, or examination tips..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetAndClose}
              disabled={isFormSubmitting}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isFormSubmitting || isSubmittingRef.current || !selectedFile || (selectedFile !== null && !fileValidation?.valid)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-indigo-600 to-indigo-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-amber-500 hover:to-indigo-400 transition disabled:opacity-50"
            >
              {isFormSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>
                    {uploadState === 'uploading'
                      ? `Uploading (${uploadProgress}%)...`
                      : uploadState === 'saving'
                      ? 'Saving metadata...'
                      : 'Processing...'}
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload & Save Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
