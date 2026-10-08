import React, { useState, useEffect, useMemo, useId } from 'react';
import {
  Building2,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen,
  Search,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Award,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  X,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Archive,
} from 'lucide-react';
import {
  UniversityRecord,
  AcademicUnitRecord,
  AcademicUnitType,
  DepartmentRecord,
  ProgrammeRecord,
  CourseRecord,
  CanonicalCourseRecord,
  ProgrammeYearConfig,
  ProgrammeSemesterConfig,
} from '../../../types';
import { adminCatalogueService } from '../../../services/adminCatalogueService';
import { EditAcademicUnitModal } from './EditAcademicUnitModal';
import { DeleteAcademicUnitModal } from './DeleteAcademicUnitModal';
import { EditDepartmentModal } from './EditDepartmentModal';
import { DeleteDepartmentModal } from './DeleteDepartmentModal';
import { EditProgrammeModal } from './EditProgrammeModal';
import { DeleteProgrammeModal } from './DeleteProgrammeModal';
import { CourseDetailModal } from './CourseDetailModal';
import { EditCourseModal } from './EditCourseModal';
import { DeleteCourseModal } from './DeleteCourseModal';

export const AcademicCatalogueBuilder: React.FC = () => {
  const formId = useId();
  // ==========================================
  // CRUD MODAL STATES
  // ==========================================
  const [viewingUnitModal, setViewingUnitModal] = useState<AcademicUnitRecord | null>(null);
  const [editingUnitModal, setEditingUnitModal] = useState<AcademicUnitRecord | null>(null);
  const [deletingUnitModal, setDeletingUnitModal] = useState<AcademicUnitRecord | null>(null);

  const [viewingDeptModal, setViewingDeptModal] = useState<DepartmentRecord | null>(null);
  const [editingDeptModal, setEditingDeptModal] = useState<DepartmentRecord | null>(null);
  const [deletingDeptModal, setDeletingDeptModal] = useState<DepartmentRecord | null>(null);

  const [editingProgModal, setEditingProgModal] = useState<ProgrammeRecord | null>(null);
  const [deletingProgModal, setDeletingProgModal] = useState<ProgrammeRecord | null>(null);

  const [viewingCourseModal, setViewingCourseModal] = useState<CourseRecord | null>(null);
  const [editingCourseModal, setEditingCourseModal] = useState<CourseRecord | null>(null);
  const [deletingCourseModal, setDeletingCourseModal] = useState<CourseRecord | null>(null);
  // ==========================================
  // STEP 1..7 SELECTIONS STATE
  // ==========================================
  const [activeStep, setActiveStep] = useState<number>(1);

  // Step 1: University
  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [selectedUni, setSelectedUni] = useState<UniversityRecord | null>(null);
  const [uniSearch, setUniSearch] = useState('');
  const [showAddUni, setShowAddUni] = useState(false);
  const [newUniName, setNewUniName] = useState('');
  const [newUniShort, setNewUniShort] = useState('');
  const [newUniCountry, setNewUniCountry] = useState('Tanzania');

  // Step 2: Academic Unit
  const [units, setUnits] = useState<AcademicUnitRecord[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<AcademicUnitRecord | null>(null);
  const [unitSearch, setUnitSearch] = useState('');
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitType, setNewUnitType] = useState<AcademicUnitType>('College');
  const [newUnitShort, setNewUnitShort] = useState('');

  // Step 3: Department
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [selectedDept, setSelectedDept] = useState<DepartmentRecord | null>(null);
  const [deptSearch, setDeptSearch] = useState('');
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptShort, setNewDeptShort] = useState('');

  // Step 4: Programme
  const [programmes, setProgrammes] = useState<ProgrammeRecord[]>([]);
  const [selectedProg, setSelectedProg] = useState<ProgrammeRecord | null>(null);
  const [progSearch, setProgSearch] = useState('');
  const [showAddProg, setShowAddProg] = useState(false);
  const [newProgName, setNewProgName] = useState('');
  const [newProgCode, setNewProgCode] = useState('');
  const [newProgDuration, setNewProgDuration] = useState<number>(3);
  const [newProgAward, setNewProgAward] = useState('Bachelor Degree');

  // Step 5: Year
  const [years, setYears] = useState<ProgrammeYearConfig[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYearNumber, setNewYearNumber] = useState<number>(4);
  const [newYearLabel, setNewYearLabel] = useState('');

  // Step 6: Semester
  const [semesters, setSemesters] = useState<ProgrammeSemesterConfig[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [showAddSem, setShowAddSem] = useState(false);
  const [newSemNumber, setNewSemNumber] = useState<number>(1);
  const [newSemLabel, setNewSemLabel] = useState('');

  // Step 7: Courses
  const [termCourses, setTermCourses] = useState<CourseRecord[]>([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAssignCourse, setShowAssignCourse] = useState(false);

  // New Course fields
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState<number>(12);
  const [newCourseType, setNewCourseType] = useState<'Core' | 'Elective'>('Core');
  const [existingCanonicalMatch, setExistingCanonicalMatch] = useState<CanonicalCourseRecord | null>(null);
  const [checkingCanonical, setCheckingCanonical] = useState(false);

  // Assign Existing Course fields
  const [assignSearch, setAssignSearch] = useState('');
  const [assignResults, setAssignResults] = useState<CanonicalCourseRecord[]>([]);
  const [selectedAssignCourse, setSelectedAssignCourse] = useState<CanonicalCourseRecord | null>(null);
  const [assignCredits, setAssignCredits] = useState<number>(12);
  const [assignType, setAssignType] = useState<'Core' | 'Elective'>('Core');

  // Async / status states
  const [loadingStep, setLoadingStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ==========================================
  // INITIAL LOAD: Step 1 Universities
  // ==========================================
  useEffect(() => {
    const loadUnis = async () => {
      setLoadingStep(true);
      try {
        const list = await adminCatalogueService.getUniversities();
        setUniversities(list);
        // If only 1 university exists, auto-select it and move to Step 2
        if (list.length === 1 && !selectedUni) {
          setSelectedUni(list[0]);
          setActiveStep(2);
        }
      } catch (err) {
        console.warn('Error loading universities:', err);
      } finally {
        setLoadingStep(false);
      }
    };
    loadUnis();
  }, []);

  // ==========================================
  // STEP 2: Load Academic Units when University selected
  // ==========================================
  useEffect(() => {
    if (!selectedUni) {
      setUnits([]);
      return;
    }
    const loadUnits = async () => {
      setLoadingStep(true);
      try {
        const list = await adminCatalogueService.getAcademicUnits(selectedUni.id);
        setUnits(list);
      } catch (err) {
        console.warn('Error loading units:', err);
      } finally {
        setLoadingStep(false);
      }
    };
    loadUnits();
  }, [selectedUni]);

  // ==========================================
  // STEP 3: Load Departments when Academic Unit selected
  // ==========================================
  useEffect(() => {
    if (!selectedUnit) {
      setDepartments([]);
      return;
    }
    const loadDepts = async () => {
      setLoadingStep(true);
      try {
        const list = await adminCatalogueService.getDepartmentsByUnit(selectedUnit.id);
        setDepartments(list);
      } catch (err) {
        console.warn('Error loading departments:', err);
      } finally {
        setLoadingStep(false);
      }
    };
    loadDepts();
  }, [selectedUnit]);

  // ==========================================
  // STEP 4: Load Programmes when Department selected
  // ==========================================
  useEffect(() => {
    if (!selectedDept) {
      setProgrammes([]);
      return;
    }
    const loadProgs = async () => {
      setLoadingStep(true);
      try {
        const list = await adminCatalogueService.getProgrammesByDepartment(selectedDept.id);
        setProgrammes(list);
      } catch (err) {
        console.warn('Error loading programmes:', err);
      } finally {
        setLoadingStep(false);
      }
    };
    loadProgs();
  }, [selectedDept]);

  // ==========================================
  // STEP 5 & 6: Compute Years & Semesters when Programme selected
  // ==========================================
  useEffect(() => {
    if (!selectedProg) {
      setYears([]);
      setSemesters([]);
      return;
    }
    const struct = adminCatalogueService.getProgrammeYearStructure(selectedProg);
    setYears(struct);

    // If selectedYear is active, set its semesters
    if (selectedYear !== null) {
      const yearObj = struct.find((y) => y.yearNumber === selectedYear);
      setSemesters(yearObj ? yearObj.semesters : []);
    }
  }, [selectedProg, selectedYear]);

  // ==========================================
  // STEP 7: Load Term Courses when Programme + Year + Semester active
  // ==========================================
  const loadTermCourses = async () => {
    if (!selectedProg || selectedYear === null || selectedSemester === null) {
      setTermCourses([]);
      return;
    }
    setLoadingStep(true);
    try {
      adminCatalogueService.clearCoursesCache();
      const list = await adminCatalogueService.getCoursesByTerm(
        selectedProg.id,
        selectedYear,
        selectedSemester
      );
      setTermCourses(list);
    } catch (err) {
      console.warn('Error loading term courses:', err);
    } finally {
      setLoadingStep(false);
    }
  };

  useEffect(() => {
    loadTermCourses();
  }, [selectedProg, selectedYear, selectedSemester]);

  // Debounced check for canonical course code in Add Course form
  useEffect(() => {
    const cleanCode = newCourseCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      setExistingCanonicalMatch(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingCanonical(true);
      try {
        const match = await adminCatalogueService.getCanonicalCourseByCode(cleanCode);
        setExistingCanonicalMatch(match);
        if (match && !newCourseTitle) {
          setNewCourseTitle(match.title);
          setNewCourseCredits(match.defaultCredits || 12);
        }
      } catch (err) {
        console.warn('Error checking canonical code:', err);
      } finally {
        setCheckingCanonical(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [newCourseCode]);

  // Debounced search for Assign Existing Course
  useEffect(() => {
    if (!assignSearch || assignSearch.trim().length < 2) return;
    const timer = setTimeout(async () => {
      try {
        const results = await adminCatalogueService.searchCanonicalCourses(assignSearch.trim(), 15);
        setAssignResults(results);
      } catch (err) {
        console.warn('Error searching canonical courses:', err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [assignSearch]);

  // ==========================================
  // STEP NAVIGATION & SELECTION HANDLERS
  // (Safely resets dependent children)
  // ==========================================
  const handleSelectUni = (uni: UniversityRecord) => {
    setSelectedUni(uni);
    setSelectedUnit(null);
    setSelectedDept(null);
    setSelectedProg(null);
    setSelectedYear(null);
    setSelectedSemester(null);
    setTermCourses([]);
    setActiveStep(2);
    setErrorMessage(null);
  };

  const handleSelectUnit = (unit: AcademicUnitRecord) => {
    setSelectedUnit(unit);
    setSelectedDept(null);
    setSelectedProg(null);
    setSelectedYear(null);
    setSelectedSemester(null);
    setTermCourses([]);
    setActiveStep(3);
    setErrorMessage(null);
  };

  const handleSelectDept = (dept: DepartmentRecord) => {
    setSelectedDept(dept);
    setSelectedProg(null);
    setSelectedYear(null);
    setSelectedSemester(null);
    setTermCourses([]);
    setActiveStep(4);
    setErrorMessage(null);
  };

  const handleSelectProg = (prog: ProgrammeRecord) => {
    setSelectedProg(prog);
    setSelectedYear(null);
    setSelectedSemester(null);
    setTermCourses([]);
    setActiveStep(5);
    setErrorMessage(null);
  };

  const handleSelectYear = (yearNum: number) => {
    setSelectedYear(yearNum);
    setSelectedSemester(null);
    setTermCourses([]);
    setActiveStep(6);
    setErrorMessage(null);
  };

  const handleSelectSemester = (semNum: number) => {
    setSelectedSemester(semNum);
    setActiveStep(7);
    setErrorMessage(null);
  };

  // Move back to a specific step
  const handleJumpToStep = (stepNumber: number) => {
    if (stepNumber < activeStep) {
      setActiveStep(stepNumber);
      setErrorMessage(null);
    }
  };

  // ==========================================
  // CREATION HANDLERS (Add & Auto-Select)
  // ==========================================
  // 1. Add University
  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniName.trim() || !newUniShort.trim()) {
      setErrorMessage('University name and abbreviation are required.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await adminCatalogueService.createUniversity({
        name: newUniName.trim(),
        shortName: newUniShort.trim().toUpperCase(),
        country: newUniCountry.trim(),
      });
      if (!res.success || !res.university) {
        setErrorMessage(res.error || 'Failed to create university.');
        setSubmitting(false);
        return;
      }
      setUniversities((prev) => [...prev, res.university!]);
      setSelectedUni(res.university);
      setShowAddUni(false);
      setNewUniName('');
      setNewUniShort('');
      setSuccessMessage(`University "${res.university.name}" created and selected!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setActiveStep(2);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error creating university.');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Add Academic Unit
  const handleAddAcademicUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUni) return;
    if (!newUnitName.trim()) {
      setErrorMessage('Academic Unit name is required.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await adminCatalogueService.createAcademicUnit({
        universityId: selectedUni.id,
        name: newUnitName.trim(),
        type: newUnitType,
        shortName: newUnitShort.trim() || undefined,
      });
      if (!res.success || !res.unit) {
        setErrorMessage(res.error || 'Failed to create academic unit.');
        setSubmitting(false);
        return;
      }
      setUnits((prev) => [...prev, res.unit!]);
      setSelectedUnit(res.unit);
      setShowAddUnit(false);
      setNewUnitName('');
      setNewUnitShort('');
      setSuccessMessage(`Academic Unit "${res.unit.name}" created and selected!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setActiveStep(3);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error creating academic unit.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Add Department
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUni || !selectedUnit) return;
    if (!newDeptName.trim()) {
      setErrorMessage('Department name is required.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await adminCatalogueService.createDepartment({
        universityId: selectedUni.id,
        academicUnitId: selectedUnit.id,
        name: newDeptName.trim(),
        shortName: newDeptShort.trim() || undefined,
      });
      if (!res.success || !res.department) {
        setErrorMessage(res.error || 'Failed to create department.');
        setSubmitting(false);
        return;
      }
      setDepartments((prev) => [...prev, res.department!]);
      setSelectedDept(res.department);
      setShowAddDept(false);
      setNewDeptName('');
      setNewDeptShort('');
      setSuccessMessage(`Department "${res.department.name}" created and selected!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setActiveStep(4);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error creating department.');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Add Programme
  const handleAddProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !selectedUnit) return;
    if (!newProgName.trim() || !newProgCode.trim()) {
      setErrorMessage('Programme name and code are required.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await adminCatalogueService.createProgramme({
        code: newProgCode.trim().toUpperCase(),
        name: newProgName.trim(),
        durationYears: newProgDuration,
        awardLevel: newProgAward,
        departmentId: selectedDept.id,
        academicUnitId: selectedUnit.id,
        status: 'active',
      });
      if (!res.success || !res.programme) {
        setErrorMessage(res.error || 'Failed to create programme.');
        setSubmitting(false);
        return;
      }
      setProgrammes((prev) => [res.programme!, ...prev]);
      setSelectedProg(res.programme);
      setShowAddProg(false);
      setNewProgName('');
      setNewProgCode('');
      setSuccessMessage(`Programme "${res.programme.name}" created and selected!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setActiveStep(5);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error creating programme.');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Add Year
  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProg) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await adminCatalogueService.addProgrammeYear(
        selectedProg.id,
        newYearNumber,
        newYearLabel || `Year ${newYearNumber}`
      );
      if (!res.success || !res.updatedProgramme) {
        setErrorMessage(res.error || 'Failed to add year.');
        setSubmitting(false);
        return;
      }
      setSelectedProg(res.updatedProgramme);
      setSelectedYear(newYearNumber);
      setShowAddYear(false);
      setSuccessMessage(`Year ${newYearNumber} added and selected!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setActiveStep(6);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error adding year.');
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Add Semester
  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProg || selectedYear === null) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await adminCatalogueService.addProgrammeSemester(
        selectedProg.id,
        selectedYear,
        newSemNumber,
        newSemLabel || `Semester ${newSemNumber}`
      );
      if (!res.success || !res.updatedProgramme) {
        setErrorMessage(res.error || 'Failed to add semester.');
        setSubmitting(false);
        return;
      }
      setSelectedProg(res.updatedProgramme);
      setSelectedSemester(newSemNumber);
      setShowAddSem(false);
      setSuccessMessage(`Semester ${newSemNumber} added and selected!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setActiveStep(7);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error adding semester.');
    } finally {
      setSubmitting(false);
    }
  };

  // 7. Add Course / Assign Course
  const handleCreateOrAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProg || selectedYear === null || selectedSemester === null) return;

    const cleanCode = newCourseCode.trim().toUpperCase();
    const cleanTitle = newCourseTitle.trim();

    if (!cleanCode) {
      setErrorMessage('Course code is required.');
      return;
    }
    if (!cleanTitle) {
      setErrorMessage('Course name/title is required.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Check if course code already exists
      const existing = existingCanonicalMatch || (await adminCatalogueService.getCanonicalCourseByCode(cleanCode));
      let canonicalId: string;

      if (existing) {
        canonicalId = existing.id;
      } else {
        // Create canonical course
        const createRes = await adminCatalogueService.createCanonicalCourse({
          code: cleanCode,
          title: cleanTitle,
          defaultCredits: newCourseCredits,
          universityId: selectedUni?.id || 'udsm',
          academicUnitId: selectedUnit?.id,
          departmentId: selectedDept?.id,
        });

        if (!createRes.success || !createRes.course) {
          setErrorMessage(createRes.error || 'Failed to create canonical course.');
          setSubmitting(false);
          return;
        }
        canonicalId = createRes.course.id;
      }

      // 2. Assign to current Programme + Year + Semester
      const assignRes = await adminCatalogueService.assignCourseToProgramme({
        canonicalCourseId: canonicalId,
        code: cleanCode,
        title: cleanTitle,
        credits: newCourseCredits,
        status: newCourseType,
        programmeId: selectedProg.id,
        academicUnitId: selectedProg.academicUnitId,
        departmentId: selectedProg.departmentId,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
      });

      if (!assignRes.success) {
        if (assignRes.alreadyAssigned) {
          setErrorMessage(`Course ${cleanCode} is already assigned to this semester.`);
        } else {
          setErrorMessage(assignRes.error || 'Failed to assign course.');
        }
        setSubmitting(false);
        return;
      }

      setSuccessMessage(`Course "${cleanCode}" successfully assigned to Year ${selectedYear}, Semester ${selectedSemester}!`);
      setTimeout(() => setSuccessMessage(null), 4000);

      // Reset course form & reload
      setShowAddCourse(false);
      setNewCourseCode('');
      setNewCourseTitle('');
      setNewCourseCredits(12);
      setExistingCanonicalMatch(null);
      await loadTermCourses();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error processing course.');
    } finally {
      setSubmitting(false);
    }
  };

  // Assign Existing Course
  const handleAssignExistingCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForAssign || !selectedProg || selectedYear === null || selectedSemester === null) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await adminCatalogueService.assignCourseToProgramme({
        canonicalCourseId: selectedCourseForAssign.id,
        code: selectedCourseForAssign.code,
        title: selectedCourseForAssign.title,
        credits: assignCredits,
        status: assignType,
        programmeId: selectedProg.id,
        academicUnitId: selectedProg.academicUnitId,
        departmentId: selectedProg.departmentId,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
      });

      if (!res.success) {
        if (res.alreadyAssigned) {
          setErrorMessage(`Course ${selectedCourseForAssign.code} is already assigned to this semester.`);
        } else {
          setErrorMessage(res.error || 'Failed to assign course.');
        }
        setSubmitting(false);
        return;
      }

      setSuccessMessage(`Course "${selectedCourseForAssign.code}" assigned to this semester!`);
      setTimeout(() => setSuccessMessage(null), 4000);

      setShowAssignCourse(false);
      setSelectedAssignCourse(null);
      setAssignSearch('');
      await loadTermCourses();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error assigning course.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCourseForAssign = selectedAssignCourse;

  // Filtered lists for search
  const filteredUnis = useMemo(() => {
    return universities.filter(
      (u) =>
        u.name.toLowerCase().includes(uniSearch.toLowerCase()) ||
        u.shortName.toLowerCase().includes(uniSearch.toLowerCase())
    );
  }, [universities, uniSearch]);

  const filteredUnits = useMemo(() => {
    return units.filter(
      (u) =>
        u.name.toLowerCase().includes(unitSearch.toLowerCase()) ||
        (u.shortName || '').toLowerCase().includes(unitSearch.toLowerCase())
    );
  }, [units, unitSearch]);

  const filteredDepts = useMemo(() => {
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
        (d.shortName || '').toLowerCase().includes(deptSearch.toLowerCase())
    );
  }, [departments, deptSearch]);

  const filteredProgs = useMemo(() => {
    return programmes.filter(
      (p) =>
        p.name.toLowerCase().includes(progSearch.toLowerCase()) ||
        (p.code || p.shortName || '').toLowerCase().includes(progSearch.toLowerCase())
    );
  }, [programmes, progSearch]);

  // Steps definition for top indicator
  const steps = [
    { num: 1, label: 'University', icon: Building2, value: selectedUni?.shortName || selectedUni?.name },
    { num: 2, label: 'Academic Unit', icon: Building, value: selectedUnit?.shortName || selectedUnit?.name },
    { num: 3, label: 'Department', icon: Layers, value: selectedDept?.name },
    { num: 4, label: 'Programme', icon: GraduationCap, value: selectedProg?.code || selectedProg?.name },
    { num: 5, label: 'Year', icon: Calendar, value: selectedYear ? `Year ${selectedYear}` : null },
    { num: 6, label: 'Semester', icon: Clock, value: selectedSemester ? `Sem ${selectedSemester}` : null },
    { num: 7, label: 'Course', icon: BookOpen, value: termCourses.length > 0 ? `${termCourses.length} Courses` : null },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-6 sm:p-8 backdrop-blur-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400">
                Stage 3D
              </span>
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Guided Catalogue Builder</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Academic Catalogue Builder
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Build and expand your institution's academic hierarchy sequentially. Select or add each tier from University down to accredited Term Courses without managing raw document IDs.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedProg && selectedYear && selectedSemester) {
                  loadTermCourses();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 2. Visual 7-Step Pipeline Bar */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {steps.map((st) => {
              const isPast = st.num < activeStep;
              const isCurrent = st.num === activeStep;
              const isFuture = st.num > activeStep;
              const Icon = st.icon;

              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => handleJumpToStep(st.num)}
                  disabled={isFuture}
                  className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-500/10'
                      : isPast
                      ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60 cursor-pointer'
                      : 'border-slate-800/40 bg-slate-950/30 text-slate-600 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-indigo-600 text-white'
                          : isPast
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : st.num}
                    </span>
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        isCurrent ? 'text-indigo-400' : isPast ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider">{st.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {st.value || (isCurrent ? 'Selecting...' : 'Pending')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Sticky / Always Visible Current Path Breadcrumb */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs flex flex-wrap items-center gap-2 text-slate-400 shadow-sm backdrop-blur-md">
        <span className="font-semibold text-slate-500 uppercase text-[10px]">Catalogue Path:</span>
        <button
          onClick={() => handleJumpToStep(1)}
          className={`hover:text-white transition ${selectedUni ? 'text-slate-300 font-semibold' : 'text-indigo-400 font-bold'}`}
        >
          {selectedUni ? selectedUni.shortName || selectedUni.name : '1. University'}
        </button>

        {selectedUni && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => handleJumpToStep(2)}
              className={`hover:text-white transition ${selectedUnit ? 'text-slate-300 font-semibold' : 'text-indigo-400 font-bold'}`}
            >
              {selectedUnit ? selectedUnit.shortName || selectedUnit.name : '2. Academic Unit'}
            </button>
          </>
        )}

        {selectedUnit && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => handleJumpToStep(3)}
              className={`hover:text-white transition ${selectedDept ? 'text-slate-300 font-semibold' : 'text-indigo-400 font-bold'}`}
            >
              {selectedDept ? selectedDept.name : '3. Department'}
            </button>
          </>
        )}

        {selectedDept && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => handleJumpToStep(4)}
              className={`hover:text-white transition ${selectedProg ? 'text-slate-300 font-semibold' : 'text-indigo-400 font-bold'}`}
            >
              {selectedProg ? selectedProg.code || selectedProg.name : '4. Programme'}
            </button>
          </>
        )}

        {selectedProg && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => handleJumpToStep(5)}
              className={`hover:text-white transition ${selectedYear ? 'text-slate-300 font-semibold' : 'text-indigo-400 font-bold'}`}
            >
              {selectedYear ? `Year ${selectedYear}` : '5. Year'}
            </button>
          </>
        )}

        {selectedYear && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => handleJumpToStep(6)}
              className={`hover:text-white transition ${selectedSemester ? 'text-slate-300 font-semibold' : 'text-indigo-400 font-bold'}`}
            >
              {selectedSemester ? `Semester ${selectedSemester === 1 ? 'I' : 'II'}` : '6. Semester'}
            </button>
          </>
        )}

        {selectedSemester && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <span className="text-indigo-400 font-bold">7. Courses</span>
          </>
        )}
      </div>

      {/* Global Notifications */}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs text-emerald-300 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-rose-300 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <p className="font-semibold leading-relaxed flex-1">{errorMessage}</p>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 1 VIEW: UNIVERSITY */}
      {/* ======================================================== */}
      {activeStep === 1 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-400" />
                <span>Step 1: Select or Add University</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every academic catalogue tier belongs to an accredited university entity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddUni(!showAddUni)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showAddUni ? 'Cancel Add' : 'Add University'}</span>
            </button>
          </div>

          {/* Add University Inline Form */}
          {showAddUni && (
            <form onSubmit={handleAddUniversity} className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-4">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Add New University Record
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor={`${formId}-uni-name`} className="text-[11px] font-semibold text-slate-300">University Full Name *</label>
                  <input
                    id={`${formId}-uni-name`}
                    type="text"
                    required
                    placeholder="e.g. University of Dar es Salaam"
                    value={newUniName}
                    onChange={(e) => setNewUniName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${formId}-uni-short`} className="text-[11px] font-semibold text-slate-300">Code / Abbr *</label>
                  <input
                    id={`${formId}-uni-short`}
                    type="text"
                    required
                    placeholder="e.g. UDSM"
                    value={newUniShort}
                    onChange={(e) => setNewUniShort(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 uppercase"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUni(false)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add & Select'}
                </button>
              </div>
            </form>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search existing universities..."
              value={uniSearch}
              onChange={(e) => setUniSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          {/* Universities List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUnis.map((uni) => {
              const isSelected = selectedUni?.id === uni.id;
              return (
                <button
                  key={uni.id}
                  type="button"
                  onClick={() => handleSelectUni(uni)}
                  className={`p-4 rounded-2xl border text-left transition flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {uni.shortName || uni.id.toUpperCase()}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {uni.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{uni.country || 'Tanzania'}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition">
                    <span>Select</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2 VIEW: ACADEMIC UNIT (COLLEGE / SCHOOL / INSTITUTE) */}
      {/* ======================================================== */}
      {activeStep === 2 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Selected University:</span>
                <strong className="text-white">{selectedUni?.name}</strong>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="h-4 w-4 text-indigo-400" />
                <span>Step 2: Select or Add Academic Unit</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Colleges, Schools, Institutes, and Centres under {selectedUni?.shortName || selectedUni?.name}.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleJumpToStep(1)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change University</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddUnit(!showAddUnit)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{showAddUnit ? 'Cancel' : 'Add Academic Unit'}</span>
              </button>
            </div>
          </div>

          {/* Add Unit Inline Form */}
          {showAddUnit && (
            <form onSubmit={handleAddAcademicUnit} className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-4">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Add Academic Unit under {selectedUni?.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor={`${formId}-unit-name`} className="text-[11px] font-semibold text-slate-300">Unit Name *</label>
                  <input
                    id={`${formId}-unit-name`}
                    type="text"
                    required
                    placeholder="e.g. College of Engineering and Technology"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${formId}-unit-type`} className="text-[11px] font-semibold text-slate-300">Unit Type *</label>
                  <select
                    id={`${formId}-unit-type`}
                    value={newUnitType}
                    onChange={(e) => setNewUnitType(e.target.value as AcademicUnitType)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  >
                    <option value="College">College</option>
                    <option value="School">School</option>
                    <option value="Institute">Institute</option>
                    <option value="Centre">Centre</option>
                    <option value="Constituent College">Constituent College</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUnit(false)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add & Select'}
                </button>
              </div>
            </form>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search academic units in ${selectedUni?.shortName || 'university'}...`}
              value={unitSearch}
              onChange={(e) => setUnitSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          {/* Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUnits.map((u) => {
              const isSelected = selectedUnit?.id === u.id;
              const isArchived = Boolean(u.archived || u.status === 'archived');
              return (
                <div
                  key={u.id}
                  onClick={() => handleSelectUnit(u)}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 group cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-500/10'
                      : isArchived
                      ? 'border-amber-500/20 bg-slate-950/30 opacity-80 text-slate-400'
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[9px] font-bold text-indigo-400">
                          {u.type || 'College'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                          {u.shortName || u.id}
                        </span>
                      </div>
                      {isArchived && (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                          Archived
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {u.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setViewingUnitModal(u)}
                        title="View Academic Unit"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUnitModal(u)}
                        title="Edit Academic Unit"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUnitModal(u)}
                        title="Archive or Delete Academic Unit"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition">
                      <span>Select</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3 VIEW: DEPARTMENT */}
      {/* ======================================================== */}
      {activeStep === 3 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Selected Unit:</span>
                <strong className="text-white">{selectedUnit?.name}</strong>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>Step 3: Select or Add Department</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Departments housed under {selectedUnit?.name}.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleJumpToStep(2)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change Unit</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddDept(!showAddDept)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{showAddDept ? 'Cancel' : 'Add Department'}</span>
              </button>
            </div>
          </div>

          {/* Add Dept Inline Form */}
          {showAddDept && (
            <form onSubmit={handleAddDepartment} className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-4">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Add Department under {selectedUnit?.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor={`${formId}-dept-name`} className="text-[11px] font-semibold text-slate-300">Department Name *</label>
                  <input
                    id={`${formId}-dept-name`}
                    type="text"
                    required
                    placeholder="e.g. Mechanical and Industrial Engineering"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${formId}-dept-short`} className="text-[11px] font-semibold text-slate-300">Code / Abbr</label>
                  <input
                    id={`${formId}-dept-short`}
                    type="text"
                    placeholder="e.g. MIE"
                    value={newDeptShort}
                    onChange={(e) => setNewDeptShort(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDept(false)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add & Select'}
                </button>
              </div>
            </form>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search departments in ${selectedUnit?.shortName || selectedUnit?.name}...`}
              value={deptSearch}
              onChange={(e) => setDeptSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          {/* Departments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDepts.map((d) => {
              const isSelected = selectedDept?.id === d.id;
              const isArchived = Boolean(d.archived || d.status === 'archived');
              return (
                <div
                  key={d.id}
                  onClick={() => handleSelectDept(d)}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 group cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-500/10'
                      : isArchived
                      ? 'border-amber-500/20 bg-slate-950/30 opacity-80 text-slate-400'
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-slate-400">ID: {d.id}</span>
                      {isArchived && (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                          Archived
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {d.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setViewingDeptModal(d)}
                        title="View Department"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingDeptModal(d)}
                        title="Edit Department"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingDeptModal(d)}
                        title="Archive or Delete Department"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition">
                      <span>Select</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 4 VIEW: PROGRAMME */}
      {/* ======================================================== */}
      {activeStep === 4 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Selected Department:</span>
                <strong className="text-white">{selectedDept?.name}</strong>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-400" />
                <span>Step 4: Select or Add Programme</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Degree and certificate curricula under {selectedDept?.name}.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleJumpToStep(3)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change Department</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddProg(!showAddProg)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{showAddProg ? 'Cancel' : 'Add Programme'}</span>
              </button>
            </div>
          </div>

          {/* Add Programme Inline Form */}
          {showAddProg && (
            <form onSubmit={handleAddProgramme} className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-4">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Add Degree Programme under {selectedDept?.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor={`${formId}-prog-name`} className="text-[11px] font-semibold text-slate-300">Programme Name *</label>
                  <input
                    id={`${formId}-prog-name`}
                    type="text"
                    required
                    placeholder="e.g. Bachelor of Science in Mechanical Engineering"
                    value={newProgName}
                    onChange={(e) => setNewProgName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${formId}-prog-code`} className="text-[11px] font-semibold text-slate-300">Programme Code *</label>
                  <input
                    id={`${formId}-prog-code`}
                    type="text"
                    required
                    placeholder="e.g. BSc ME"
                    value={newProgCode}
                    onChange={(e) => setNewProgCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`${formId}-prog-duration`} className="text-[11px] font-semibold text-slate-300">Duration (Years) *</label>
                  <select
                    id={`${formId}-prog-duration`}
                    value={newProgDuration}
                    onChange={(e) => setNewProgDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <option key={y} value={y}>
                        {y} {y === 1 ? 'Year' : 'Years'} ({y * 2} Semesters)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${formId}-prog-award`} className="text-[11px] font-semibold text-slate-300">Award Level</label>
                  <select
                    id={`${formId}-prog-award`}
                    value={newProgAward}
                    onChange={(e) => setNewProgAward(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  >
                    <option value="Bachelor Degree">Bachelor Degree</option>
                    <option value="Master Degree">Master Degree</option>
                    <option value="PhD">Doctor of Philosophy (PhD)</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProg(false)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add & Select'}
                </button>
              </div>
            </form>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search programmes in ${selectedDept?.name}...`}
              value={progSearch}
              onChange={(e) => setProgSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          {/* Programmes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredProgs.map((p) => {
              const isSelected = selectedProg?.id === p.id;
              const isArchived = Boolean(p.archived || p.status === 'archived');
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProg(p)}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 group cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-500/10'
                      : isArchived
                      ? 'border-amber-500/20 bg-slate-950/30 opacity-80 text-slate-400'
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                          {p.code || p.shortName || p.id}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {p.durationYears || 3} Years
                        </span>
                      </div>
                      {isArchived && (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                          Archived
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {p.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setEditingProgModal(p)}
                        title="Edit Programme"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProgModal(p)}
                        title="Archive or Delete Programme"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition">
                      <span>Select</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 5 VIEW: YEAR */}
      {/* ======================================================== */}
      {activeStep === 5 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Selected Programme:</span>
                <strong className="text-white">{selectedProg?.name}</strong>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span>Step 5: Select or Add Academic Year</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Year of study structure for {selectedProg?.shortName || selectedProg?.name}.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleJumpToStep(4)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change Programme</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddYear(!showAddYear)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{showAddYear ? 'Cancel' : 'Add Year'}</span>
              </button>
            </div>
          </div>

          {/* Add Year Inline Form */}
          {showAddYear && (
            <form onSubmit={handleAddYear} className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-4">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Add Academic Year to {selectedProg?.shortName || selectedProg?.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`${formId}-year-num`} className="text-[11px] font-semibold text-slate-300">Year Number *</label>
                  <input
                    id={`${formId}-year-num`}
                    type="number"
                    min={1}
                    max={7}
                    required
                    value={newYearNumber}
                    onChange={(e) => setNewYearNumber(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${formId}-year-label`} className="text-[11px] font-semibold text-slate-300">Custom Label (Optional)</label>
                  <input
                    id={`${formId}-year-label`}
                    type="text"
                    placeholder={`e.g. Year ${newYearNumber}`}
                    value={newYearLabel}
                    onChange={(e) => setNewYearLabel(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddYear(false)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add & Select Year'}
                </button>
              </div>
            </form>
          )}

          {/* Years Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {years.map((y) => {
              const isSelected = selectedYear === y.yearNumber;
              return (
                <button
                  key={y.yearNumber}
                  type="button"
                  onClick={() => handleSelectYear(y.yearNumber)}
                  className={`p-5 rounded-2xl border text-center transition space-y-2 group ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300'
                  }`}
                >
                  <Calendar className="h-6 w-6 mx-auto text-indigo-400 group-hover:scale-110 transition" />
                  <div>
                    <h4 className="text-base font-bold text-white">{y.label || `Year ${y.yearNumber}`}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {y.semesters?.length || 2} Semesters
                    </p>
                  </div>
                  <span className="inline-block text-[11px] font-semibold text-indigo-400 group-hover:underline">
                    Select Year →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 6 VIEW: SEMESTER */}
      {/* ======================================================== */}
      {activeStep === 6 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Selected:</span>
                <strong className="text-white">{selectedProg?.shortName || selectedProg?.name} • Year {selectedYear}</strong>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                <span>Step 6: Select or Add Teaching Semester</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Semesters under Year {selectedYear}.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleJumpToStep(5)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change Year</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddSem(!showAddSem)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{showAddSem ? 'Cancel' : 'Add Semester'}</span>
              </button>
            </div>
          </div>

          {/* Add Semester Inline Form */}
          {showAddSem && (
            <form onSubmit={handleAddSemester} className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-4">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Add Semester to Year {selectedYear}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`${formId}-sem-num`} className="text-[11px] font-semibold text-slate-300">Semester Number *</label>
                  <input
                    id={`${formId}-sem-num`}
                    type="number"
                    min={1}
                    max={4}
                    required
                    value={newSemNumber}
                    onChange={(e) => setNewSemNumber(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${formId}-sem-label`} className="text-[11px] font-semibold text-slate-300">Custom Label (Optional)</label>
                  <input
                    id={`${formId}-sem-label`}
                    type="text"
                    placeholder={`e.g. Semester ${newSemNumber} or Practical Training`}
                    value={newSemLabel}
                    onChange={(e) => setNewSemLabel(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSem(false)}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add & Select Semester'}
                </button>
              </div>
            </form>
          )}

          {/* Semesters Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {semesters.map((s) => {
              const isSelected = selectedSemester === s.semesterNumber;
              return (
                <button
                  key={s.semesterNumber}
                  type="button"
                  onClick={() => handleSelectSemester(s.semesterNumber)}
                  className={`p-5 rounded-2xl border text-center transition space-y-2 group ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300'
                  }`}
                >
                  <Clock className="h-6 w-6 mx-auto text-indigo-400 group-hover:scale-110 transition" />
                  <div>
                    <h4 className="text-base font-bold text-white">{s.label || `Semester ${s.semesterNumber}`}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Teaching Term</p>
                  </div>
                  <span className="inline-block text-[11px] font-semibold text-indigo-400 group-hover:underline">
                    Select Term & View Courses →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 7 VIEW: COURSES (CANONICAL CATALOGUE MANAGEMENT) */}
      {/* ======================================================== */}
      {activeStep === 7 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Current Destination:</span>
                <strong className="text-white">
                  {selectedProg?.name} • Year {selectedYear}, Semester {selectedSemester === 1 ? 'I' : 'II'}
                </strong>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>Step 7: Manage & Assign Courses</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign canonical accredited courses to this specific term curriculum.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleJumpToStep(6)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change Semester</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAssignCourse(!showAssignCourse);
                  setShowAddCourse(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>Assign Existing Course</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddCourse(!showAddCourse);
                  setShowAssignCourse(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Course</span>
              </button>
            </div>
          </div>

          {/* Form Option A: Add New Course (with Canonical Deduplication) */}
          {showAddCourse && (
            <form onSubmit={handleCreateOrAssignCourse} className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Add Course to {selectedProg?.shortName || selectedProg?.name} (Year {selectedYear}, Sem {selectedSemester})
                </h4>
                <button type="button" onClick={() => setShowAddCourse(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Duplicate Canonical Warning */}
              {existingCanonicalMatch && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-3.5 text-xs text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Course {existingCanonicalMatch.code} Already Exists in Catalogue</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    &ldquo;{existingCanonicalMatch.title}&rdquo; ({existingCanonicalMatch.defaultCredits || 12} credits) is already a canonical course. Saving will link this existing course record to this programme term without creating a duplicate.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label htmlFor={`${formId}-new-course-code`} className="text-[11px] font-semibold text-slate-300">Course Code *</label>
                  <div className="relative">
                    <input
                      id={`${formId}-new-course-code`}
                      type="text"
                      required
                      placeholder="e.g. MT 101"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-white focus:border-indigo-500 uppercase"
                    />
                    {checkingCanonical && (
                      <div className="absolute right-2.5 top-2.5 h-3.5 w-3.5 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor={`${formId}-new-course-title`} className="text-[11px] font-semibold text-slate-300">Course Name / Title *</label>
                  <input
                    id={`${formId}-new-course-title`}
                    type="text"
                    required
                    placeholder="e.g. Matrices and Basic Calculus for Non-Majors"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`${formId}-new-course-credits`} className="text-[11px] font-semibold text-slate-300">Credits *</label>
                  <input
                    id={`${formId}-new-course-credits`}
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={newCourseCredits}
                    onChange={(e) => setNewCourseCredits(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-300 block">Course Classification *</span>
                  <div className="flex items-center gap-4 pt-1.5">
                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="builderCourseType"
                        value="Core"
                        checked={newCourseType === 'Core'}
                        onChange={() => setNewCourseType('Core')}
                        className="text-indigo-600 focus:ring-0"
                      />
                      <span className="font-semibold text-emerald-400">Core</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="builderCourseType"
                        value="Elective"
                        checked={newCourseType === 'Elective'}
                        onChange={() => setNewCourseType('Elective')}
                        className="text-indigo-600 focus:ring-0"
                      />
                      <span className="font-semibold text-amber-400">Elective</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="rounded-xl border border-slate-700 px-3.5 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : existingCanonicalMatch ? 'Assign Existing Course' : 'Create & Assign Course'}
                </button>
              </div>
            </form>
          )}

          {/* Form Option B: Assign Existing Course Search */}
          {showAssignCourse && (
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Search & Assign Existing Canonical Course
                </h4>
                <button type="button" onClick={() => setShowAssignCourse(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {selectedAssignCourse ? (
                <form onSubmit={handleAssignExistingCourse} className="space-y-4">
                  <div className="rounded-xl border border-indigo-500/40 bg-slate-950 p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded">
                        {selectedAssignCourse.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedAssignCourse(null)}
                        className="text-xs text-indigo-400 underline font-semibold"
                      >
                        Change selection
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-white">{selectedAssignCourse.title}</h4>
                    <p className="text-[11px] text-slate-400">Default Credits: {selectedAssignCourse.defaultCredits || 12}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor={`${formId}-assign-credits`} className="text-[11px] font-semibold text-slate-300">Credits for this Term</label>
                      <input
                        id={`${formId}-assign-credits`}
                        type="number"
                        min={1}
                        max={60}
                        required
                        value={assignCredits}
                        onChange={(e) => setAssignCredits(Math.max(1, Number(e.target.value)))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-300 block">Course Classification</span>
                      <div className="flex items-center gap-4 pt-1.5">
                        <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                          <input
                            type="radio"
                            name="assignType"
                            value="Core"
                            checked={assignType === 'Core'}
                            onChange={() => setAssignType('Core')}
                            className="text-indigo-600 focus:ring-0"
                          />
                          <span className="font-semibold text-emerald-400">Core</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                          <input
                            type="radio"
                            name="assignType"
                            value="Elective"
                            checked={assignType === 'Elective'}
                            onChange={() => setAssignType('Elective')}
                            className="text-indigo-600 focus:ring-0"
                          />
                          <span className="font-semibold text-amber-400">Elective</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAssignCourse(false)}
                      className="rounded-xl border border-slate-700 px-3.5 py-1.5 text-xs text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {submitting ? 'Assigning...' : 'Assign to this Semester'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type course code or title (e.g. MT 101, Calculus, CS 174)..."
                      value={assignSearch}
                      onChange={(e) => setAssignSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 divide-y divide-slate-800/80 max-h-48 overflow-y-auto">
                    {assignResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        {assignSearch.length >= 2 ? 'No courses match this code or title.' : 'Search canonical courses...'}
                      </div>
                    ) : (
                      assignResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedAssignCourse(c);
                            setAssignCredits(c.defaultCredits || 12);
                          }}
                          className="w-full text-left p-3 hover:bg-slate-900 flex items-center justify-between gap-3 text-xs transition group"
                        >
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-indigo-400 group-hover:text-indigo-300">
                              {c.code}
                            </span>
                            <span className="text-white font-medium ml-2">{c.title}</span>
                            <p className="text-[11px] text-slate-500">{c.defaultCredits || 12} Credits</p>
                          </div>
                          <span className="text-[11px] text-indigo-400 font-semibold group-hover:underline">
                            Select →
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Current Term Courses Summary Bar */}
          <div className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Courses in Year {selectedYear}, Semester {selectedSemester === 1 ? 'I' : 'II'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {termCourses.length} active courses • {termCourses.reduce((sum, c) => sum + (c.credits || 0), 0)} Total Credits
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-400 font-semibold text-[11px]">
                {termCourses.filter((c) => (c.status || (c as any).courseType || '').toLowerCase() === 'core').length} Core
              </span>
              <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-amber-400 font-semibold text-[11px]">
                {termCourses.filter((c) => (c.status || (c as any).courseType || '').toLowerCase() === 'elective').length} Elective
              </span>
            </div>
          </div>

          {/* Term Courses List Grid */}
          {termCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-3">
              <BookOpen className="h-7 w-7 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                No courses assigned to Year {selectedYear}, Semester {selectedSemester} yet.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignCourse(true);
                    setShowAddCourse(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <Layers className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Assign Existing Course</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCourse(true);
                    setShowAssignCourse(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Course</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {termCourses.map((c) => {
                const isCore = (c.status || (c as any).courseType || '').toLowerCase() === 'core';
                return (
                  <div
                    key={c.id || c.code}
                    className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/40 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                            {c.code || (c as any).courseCode}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border ${
                              isCore
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {c.status || (c as any).courseType || 'Core'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white pt-0.5">{c.title || (c as any).courseName}</h4>
                        <p className="text-[11px] text-slate-500">
                          {c.credits || 12} Credits • Year {selectedYear}, Sem {selectedSemester}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Assigned</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => setViewingCourseModal(c)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCourseModal(c)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCourseModal(c)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-950/50 hover:border-rose-500/30 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove / Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* FULL CRUD / ARCHIVE / DELETE MODALS IN BUILDER VIEW */}
      {/* ======================================================== */}
      {viewingUnitModal && (
        <EditAcademicUnitModal
          isOpen={Boolean(viewingUnitModal)}
          onClose={() => setViewingUnitModal(null)}
          unit={viewingUnitModal}
          mode="view"
          onUnitUpdated={(updated) => {
            setUnits((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            if (selectedUnit?.id === updated.id) setSelectedUnit(updated);
            setSuccessMessage(`Academic Unit "${updated.name}" updated.`);
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
        />
      )}

      {editingUnitModal && (
        <EditAcademicUnitModal
          isOpen={Boolean(editingUnitModal)}
          onClose={() => setEditingUnitModal(null)}
          unit={editingUnitModal}
          mode="edit"
          onUnitUpdated={(updated) => {
            setUnits((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            if (selectedUnit?.id === updated.id) setSelectedUnit(updated);
            setSuccessMessage(`Academic Unit "${updated.name}" updated.`);
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
        />
      )}

      {deletingUnitModal && (
        <DeleteAcademicUnitModal
          isOpen={Boolean(deletingUnitModal)}
          onClose={() => setDeletingUnitModal(null)}
          unit={deletingUnitModal}
          onUnitArchived={(updated) => {
            setUnits((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            if (selectedUnit?.id === updated.id) setSelectedUnit(updated);
            setSuccessMessage(`Academic Unit "${updated.name}" archive status updated.`);
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
          onUnitDeleted={(deletedId) => {
            setUnits((prev) => prev.filter((u) => u.id !== deletedId));
            if (selectedUnit?.id === deletedId) setSelectedUnit(null);
            setSuccessMessage('Academic Unit permanently deleted.');
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
        />
      )}

      {viewingDeptModal && (
        <EditDepartmentModal
          isOpen={Boolean(viewingDeptModal)}
          onClose={() => setViewingDeptModal(null)}
          department={viewingDeptModal}
          unit={selectedUnit}
          mode="view"
          onDepartmentUpdated={(updated) => {
            setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
            if (selectedDept?.id === updated.id) setSelectedDept(updated);
            setSuccessMessage(`Department "${updated.name}" updated.`);
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
        />
      )}

      {editingDeptModal && (
        <EditDepartmentModal
          isOpen={Boolean(editingDeptModal)}
          onClose={() => setEditingDeptModal(null)}
          department={editingDeptModal}
          unit={selectedUnit}
          mode="edit"
          onDepartmentUpdated={(updated) => {
            setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
            if (selectedDept?.id === updated.id) setSelectedDept(updated);
            setSuccessMessage(`Department "${updated.name}" updated.`);
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
        />
      )}

      {deletingDeptModal && (
        <DeleteDepartmentModal
          isOpen={Boolean(deletingDeptModal)}
          onClose={() => setDeletingDeptModal(null)}
          department={deletingDeptModal}
          onDepartmentArchived={(updated) => {
            setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
            if (selectedDept?.id === updated.id) setSelectedDept(updated);
            setSuccessMessage(`Department "${updated.name}" archive status updated.`);
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
          onDepartmentDeleted={(deletedId) => {
            setDepartments((prev) => prev.filter((d) => d.id !== deletedId));
            if (selectedDept?.id === deletedId) setSelectedDept(null);
            setSuccessMessage('Department permanently deleted.');
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
        />
      )}

      {editingProgModal && (
        <EditProgrammeModal
          isOpen={Boolean(editingProgModal)}
          onClose={() => setEditingProgModal(null)}
          programme={editingProgModal}
          department={selectedDept}
          unit={selectedUnit}
          onProgrammeUpdated={(updated) => {
            setProgrammes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            if (selectedProg?.id === updated.id) setSelectedProg(updated);
            setSuccessMessage(`Programme "${updated.name}" updated.`);
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
        />
      )}

      {deletingProgModal && (
        <DeleteProgrammeModal
          isOpen={Boolean(deletingProgModal)}
          onClose={() => setDeletingProgModal(null)}
          programme={deletingProgModal}
          department={selectedDept}
          onProgrammeDeleted={(deletedId) => {
            setProgrammes((prev) => prev.filter((p) => p.id !== deletedId));
            if (selectedProg?.id === deletedId) setSelectedProg(null);
            setSuccessMessage('Programme permanently deleted.');
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
          onProgrammeUpdated={(updated) => {
            setProgrammes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            if (selectedProg?.id === updated.id) setSelectedProg(updated);
            setSuccessMessage(`Programme "${updated.name}" archive status updated.`);
            setTimeout(() => setSuccessMessage(null), 4000);
          }}
        />
      )}

      {viewingCourseModal && (
        <CourseDetailModal
          isOpen={Boolean(viewingCourseModal)}
          onClose={() => setViewingCourseModal(null)}
          course={viewingCourseModal}
          currentProgramme={selectedProg}
          currentYear={selectedYear}
          currentSemester={selectedSemester}
          onAssignToAnotherProg={() => {
            setViewingCourseModal(null);
            setShowAssignCourse(true);
          }}
          onEditCourse={(c) => {
            setViewingCourseModal(null);
            setEditingCourseModal(c);
          }}
          onDeleteCanonicalCourse={(c) => {
            setViewingCourseModal(null);
            setDeletingCourseModal(c);
          }}
          onRemoveFromThisProg={(c) => {
            setViewingCourseModal(null);
            setDeletingCourseModal(c);
          }}
        />
      )}

      {editingCourseModal && (
        <EditCourseModal
          isOpen={Boolean(editingCourseModal)}
          onClose={() => setEditingCourseModal(null)}
          course={editingCourseModal}
          programme={selectedProg}
          onCourseUpdated={async (updated) => {
            setSuccessMessage(`Course "${updated.code}" updated successfully.`);
            setTimeout(() => setSuccessMessage(null), 4000);
            await loadTermCourses();
          }}
        />
      )}

      {deletingCourseModal && (
        <DeleteCourseModal
          isOpen={Boolean(deletingCourseModal)}
          onClose={() => setDeletingCourseModal(null)}
          course={deletingCourseModal}
          programme={selectedProg}
          year={selectedYear}
          semester={selectedSemester}
          onCourseRemovedFromProg={async (removed) => {
            setSuccessMessage(`Course "${removed.code}" updated/removed from term.`);
            setTimeout(() => setSuccessMessage(null), 4000);
            await loadTermCourses();
          }}
          onCanonicalCourseDeleted={async (deleted) => {
            setSuccessMessage(`Canonical course "${deleted.code}" deleted.`);
            setTimeout(() => setSuccessMessage(null), 4000);
            await loadTermCourses();
          }}
        />
      )}
    </div>
  );
};
