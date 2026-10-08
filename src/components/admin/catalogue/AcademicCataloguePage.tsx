import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Layers,
  Building,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Edit2,
  Trash2,
  Calendar,
  BookOpen,
  Info,
  CheckCircle2,
  Clock,
  Award,
  Plus,
} from 'lucide-react';
import {
  AcademicUnitRecord,
  DepartmentRecord,
  ProgrammeRecord,
  CourseRecord,
  CanonicalCourseRecord,
} from '../../../types';
import {
  adminCatalogueService,
  CatalogueSearchResult,
} from '../../../services/adminCatalogueService';
import { CatalogueBreadcrumb } from './CatalogueBreadcrumb';
import { CatalogueSearch } from './CatalogueSearch';
import { CatalogueLoadingState } from './CatalogueLoadingState';
import { CatalogueEmptyState } from './CatalogueEmptyState';
import { AcademicUnitList } from './AcademicUnitList';
import { DepartmentList } from './DepartmentList';
import { ProgrammeList } from './ProgrammeList';
import { YearSelector } from './YearSelector';
import { SemesterSelector } from './SemesterSelector';
import { CourseList } from './CourseList';
import { ProgrammeStructureManager } from './ProgrammeStructureManager';
import { EditProgrammeModal } from './EditProgrammeModal';
import { DeleteProgrammeModal } from './DeleteProgrammeModal';
import { AddCourseModal } from './AddCourseModal';
import { AssignCourseModal } from './AssignCourseModal';
import { EditCourseModal } from './EditCourseModal';
import { DeleteCourseModal } from './DeleteCourseModal';
import { CourseDetailModal } from './CourseDetailModal';
import { AcademicCatalogueBuilder } from './AcademicCatalogueBuilder';

export const AcademicCataloguePage: React.FC = () => {
  // Page Mode: 'builder' (Stage 3D Guided Workflow) | 'explorer' (Hierarchical Tree View)
  const [viewMode, setViewMode] = useState<'builder' | 'explorer'>('builder');

  // Navigation Hierarchy State
  const [selectedUnit, setSelectedUnit] = useState<AcademicUnitRecord | null>(null);
  const [selectedDept, setSelectedDept] = useState<DepartmentRecord | null>(null);
  const [selectedProg, setSelectedProg] = useState<ProgrammeRecord | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  // Selected Programme Sub-View: 'curriculum' (courses) | 'structure' (years & semesters) | 'details' (metadata)
  const [progActiveTab, setProgActiveTab] = useState<'curriculum' | 'structure' | 'details'>('curriculum');

  // Programme Action Modals
  const [editingProg, setEditingProg] = useState<ProgrammeRecord | null>(null);
  const [deletingProg, setDeletingProg] = useState<ProgrammeRecord | null>(null);

  // Course Action Modals (Stage 3C Course Management)
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isAssigningCourse, setIsAssigningCourse] = useState(false);
  const [courseForAssignment, setCourseForAssignment] = useState<CourseRecord | CanonicalCourseRecord | null>(null);
  const [viewingCourseDetail, setViewingCourseDetail] = useState<CourseRecord | null>(null);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseRecord | null>(null);

  // Data Collections State
  const [units, setUnits] = useState<AcademicUnitRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);

  // Loading & Error States
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingProgs, setLoadingProgs] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // 1. Initial Load: Academic Units
  const loadUnits = async () => {
    setLoadingUnits(true);
    setErrorMessage(null);
    try {
      const data = await adminCatalogueService.getAcademicUnits('udsm');
      setUnits(data);
    } catch (err: any) {
      console.error('Failed to load academic units:', err);
      setErrorMessage('Could not load academic units from Firestore. Please check connection.');
    } finally {
      setLoadingUnits(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  // 2. Load Departments when an Academic Unit is selected
  useEffect(() => {
    if (!selectedUnit) {
      setDepartments([]);
      return;
    }

    const loadDepts = async () => {
      setLoadingDepts(true);
      setErrorMessage(null);
      try {
        const data = await adminCatalogueService.getDepartmentsByUnit(selectedUnit.id);
        setDepartments(data);
      } catch (err: any) {
        console.error('Failed to load departments:', err);
        setErrorMessage(`Could not load departments for ${selectedUnit.name}.`);
      } finally {
        setLoadingDepts(false);
      }
    };

    loadDepts();
  }, [selectedUnit]);

  // 3. Load Programmes when a Department is selected
  useEffect(() => {
    if (!selectedDept) {
      setProgrammes([]);
      return;
    }

    const loadProgs = async () => {
      setLoadingProgs(true);
      setErrorMessage(null);
      try {
        const data = await adminCatalogueService.getProgrammesByDepartment(selectedDept.id);
        setProgrammes(data);
      } catch (err: any) {
        console.error('Failed to load programmes:', err);
        setErrorMessage(`Could not load degree programmes for ${selectedDept.name}.`);
      } finally {
        setLoadingProgs(false);
      }
    };

    loadProgs();
  }, [selectedDept]);

  // 4. Load Courses when Programme + Year + Semester are active
  useEffect(() => {
    if (!selectedProg || selectedYear === null || selectedSemester === null) {
      setCourses([]);
      return;
    }

    const loadTermCourses = async () => {
      setLoadingCourses(true);
      setErrorMessage(null);
      try {
        const data = await adminCatalogueService.getCoursesByTerm(
          selectedProg.id,
          selectedYear,
          selectedSemester
        );
        setCourses(data);
      } catch (err: any) {
        console.error('Failed to load courses:', err);
        setErrorMessage('Could not load courses for this semester from Firestore.');
      } finally {
        setLoadingCourses(false);
      }
    };

    loadTermCourses();
  }, [selectedProg, selectedYear, selectedSemester]);

  // Hierarchy Selection Handlers
  const handleSelectUnit = (unit: AcademicUnitRecord) => {
    setSelectedUnit(unit);
    setSelectedDept(null);
    setSelectedProg(null);
    setSelectedYear(null);
    setSelectedSemester(null);
  };

  const handleSelectDept = (dept: DepartmentRecord) => {
    setSelectedDept(dept);
    setSelectedProg(null);
    setSelectedYear(null);
    setSelectedSemester(null);
  };

  const handleSelectProg = (prog: ProgrammeRecord) => {
    setSelectedProg(prog);
    setProgActiveTab('curriculum');
    // Default to Year 1, Semester 1
    setSelectedYear(1);
    setSelectedSemester(1);
  };

  const handleResetToRoot = () => {
    setSelectedUnit(null);
    setSelectedDept(null);
    setSelectedProg(null);
    setSelectedYear(null);
    setSelectedSemester(null);
  };

  // Programme Mutation Handlers
  const handleProgrammeCreated = (newProg: ProgrammeRecord) => {
    setProgrammes((prev) => [newProg, ...prev]);
    setSuccessNotice(`Programme "${newProg.name}" (${newProg.code || newProg.shortName}) created successfully.`);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleProgrammeUpdated = (updated: ProgrammeRecord) => {
    setProgrammes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProg?.id === updated.id) {
      setSelectedProg(updated);
    }
    setSuccessNotice(`Programme "${updated.name}" updated successfully.`);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleProgrammeDeleted = (deletedId: string) => {
    setProgrammes((prev) => prev.filter((p) => p.id !== deletedId));
    if (selectedProg?.id === deletedId) {
      setSelectedProg(null);
      setSelectedYear(null);
      setSelectedSemester(null);
    }
    setSuccessNotice('Programme was successfully deleted.');
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleDurationUpdated = (newDuration: number) => {
    if (selectedProg) {
      const updated: ProgrammeRecord = {
        ...selectedProg,
        durationYears: newDuration,
      };
      setSelectedProg(updated);
      setProgrammes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedYear && selectedYear > newDuration) {
        setSelectedYear(1);
      }
    }
  };

  // Course Mutation Handlers (Stage 3C Course Management)
  const reloadCurrentTermCourses = async () => {
    if (!selectedProg || selectedYear === null || selectedSemester === null) return;
    setLoadingCourses(true);
    try {
      adminCatalogueService.clearCoursesCache();
      const data = await adminCatalogueService.getCoursesByTerm(
        selectedProg.id,
        selectedYear,
        selectedSemester
      );
      setCourses(data);
    } catch (err) {
      console.warn('Error refreshing term courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCourseCreated = async (newCourse: CourseRecord, wasAssigned: boolean) => {
    setSuccessNotice(`Canonical course "${newCourse.code}" was created successfully.`);
    setTimeout(() => setSuccessNotice(null), 5000);
    if (wasAssigned) {
      await reloadCurrentTermCourses();
    }
  };

  const handleCourseAssigned = async (assignedCourse: CourseRecord) => {
    setSuccessNotice(`Course "${assignedCourse.code}" was assigned to this term successfully.`);
    setTimeout(() => setSuccessNotice(null), 5000);
    await reloadCurrentTermCourses();
  };

  const handleCourseUpdated = async (updatedCourse: CourseRecord) => {
    setSuccessNotice(`Course "${updatedCourse.code}" updated successfully.`);
    setTimeout(() => setSuccessNotice(null), 5000);
    await reloadCurrentTermCourses();
  };

  const handleCourseRemovedFromProg = async (removedCourse: CourseRecord) => {
    setSuccessNotice(`Course "${removedCourse.code}" was unassigned from this term.`);
    setTimeout(() => setSuccessNotice(null), 5000);
    await reloadCurrentTermCourses();
  };

  const handleCanonicalCourseDeleted = async (deletedCourse: CourseRecord) => {
    setSuccessNotice(`Canonical course "${deletedCourse.code}" was permanently deleted from the catalogue.`);
    setTimeout(() => setSuccessNotice(null), 5000);
    await reloadCurrentTermCourses();
  };

  // Search Jump Handler
  const handleSelectSearchResult = async (result: CatalogueSearchResult) => {
    setViewMode('explorer');
    setErrorMessage(null);

    // If unit clicked
    if (result.type === 'unit') {
      const allUnits = units.length > 0 ? units : await adminCatalogueService.getAcademicUnits();
      const targetUnit = allUnits.find((u) => u.id === result.unitId);
      if (targetUnit) {
        handleSelectUnit(targetUnit);
      }
      return;
    }

    // If department clicked
    if (result.type === 'department' && result.unitId && result.departmentId) {
      const allUnits = units.length > 0 ? units : await adminCatalogueService.getAcademicUnits();
      const targetUnit = allUnits.find((u) => u.id === result.unitId);
      if (targetUnit) {
        setSelectedUnit(targetUnit);
        const depts = await adminCatalogueService.getDepartmentsByUnit(targetUnit.id);
        setDepartments(depts);
        const targetDept = depts.find((d) => d.id === result.departmentId);
        if (targetDept) {
          setSelectedDept(targetDept);
          setSelectedProg(null);
          setSelectedYear(null);
          setSelectedSemester(null);
        }
      }
      return;
    }

    // If programme clicked
    if (result.type === 'programme' && result.departmentId && result.programmeId) {
      const allUnits = units.length > 0 ? units : await adminCatalogueService.getAcademicUnits();
      const targetUnit = allUnits.find((u) => u.id === result.unitId) || allUnits[0];
      if (targetUnit) setSelectedUnit(targetUnit);

      const depts = await adminCatalogueService.getDepartmentsByUnit(result.unitId || targetUnit?.id || '');
      setDepartments(depts);
      const targetDept = depts.find((d) => d.id === result.departmentId) || {
        id: result.departmentId,
        academicUnitId: targetUnit?.id || '',
        name: result.departmentId,
        universityId: 'udsm',
        verified: true,
        source: 'Official Catalogue',
      };
      setSelectedDept(targetDept);

      const progs = await adminCatalogueService.getProgrammesByDepartment(result.departmentId);
      setProgrammes(progs);
      const targetProg = progs.find((p) => p.id === result.programmeId) || {
        id: result.programmeId,
        name: result.title,
        departmentId: result.departmentId,
        academicUnitId: targetUnit?.id || '',
        universityId: 'udsm',
        durationYears: 3,
      };
      setSelectedProg(targetProg);
      setProgActiveTab('curriculum');
      setSelectedYear(1);
      setSelectedSemester(1);
      return;
    }

    // If course clicked
    if (result.type === 'course' && result.programmeId) {
      const allUnits = units.length > 0 ? units : await adminCatalogueService.getAcademicUnits();
      const targetUnit = allUnits.find((u) => u.id === result.unitId) || allUnits[0];
      if (targetUnit) setSelectedUnit(targetUnit);

      if (result.departmentId) {
        setSelectedDept({
          id: result.departmentId,
          academicUnitId: targetUnit?.id || '',
          name: result.departmentId,
          universityId: 'udsm',
          verified: true,
          source: 'Official Catalogue',
        });
      }

      setSelectedProg({
        id: result.programmeId,
        name: result.programmeId,
        departmentId: result.departmentId || '',
        academicUnitId: targetUnit?.id || '',
        universityId: 'udsm',
        durationYears: 3,
      });

      setProgActiveTab('curriculum');
      setSelectedYear(result.year || 1);
      setSelectedSemester(result.semester || 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Academic Catalogue
            </h2>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              Stage 3D (Catalogue Builder)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Build and manage VENUE's academic structure, degree programmes, and canonical course curriculum.
          </p>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('builder')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                viewMode === 'builder'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Guided Builder</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('explorer')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                viewMode === 'explorer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Hierarchy Explorer</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingCourse(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition shrink-0"
          >
            <Plus className="h-4 w-4 text-indigo-400" />
            <span>Add Course</span>
          </button>

          {/* Debounced Global Search Bar */}
          <CatalogueSearch onSelectResult={handleSelectSearchResult} />
        </div>
      </div>

      {viewMode === 'builder' ? (
        <AcademicCatalogueBuilder />
      ) : (
        <>
          {/* 2. Interactive Catalogue Breadcrumbs */}
          <CatalogueBreadcrumb
            selectedUnit={selectedUnit}
            selectedDept={selectedDept}
            selectedProg={selectedProg}
            selectedYear={selectedYear}
            selectedSemester={selectedSemester}
            onSelectUnit={setSelectedUnit}
            onSelectDept={setSelectedDept}
            onSelectProg={setSelectedProg}
            onSelectYear={setSelectedYear}
            onSelectSemester={setSelectedSemester}
            onResetToRoot={handleResetToRoot}
          />

      {/* 3. Success & Error Notices */}
      {successNotice && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-xs text-emerald-400 hover:text-white font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => {
              if (!selectedUnit) loadUnits();
            }}
            className="flex items-center gap-1 font-semibold text-rose-400 hover:text-white px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 4. Progressive Hierarchy Rendering */}

      {/* LEVEL 1: Academic Units (Root view) */}
      {!selectedUnit && (
        <>
          {loadingUnits ? (
            <CatalogueLoadingState label="Loading academic units from Firestore..." count={9} />
          ) : units.length === 0 ? (
            <CatalogueEmptyState
              title="No Academic Units found."
              message="No academic units are currently registered for this university."
            />
          ) : (
            <AcademicUnitList
              units={units}
              onSelectUnit={handleSelectUnit}
              onUnitUpdated={(updated) => {
                setUnits((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
                setSuccessNotice(`Academic Unit "${updated.name}" updated successfully.`);
                setTimeout(() => setSuccessNotice(null), 5000);
              }}
              onUnitDeleted={(deletedId) => {
                setUnits((prev) => prev.filter((u) => u.id !== deletedId));
                setSuccessNotice('Academic Unit deleted successfully.');
                setTimeout(() => setSuccessNotice(null), 5000);
              }}
            />
          )}
        </>
      )}

      {/* LEVEL 2: Departments (When Academic Unit is chosen, but Department not yet) */}
      {selectedUnit && !selectedDept && (
        <>
          {loadingDepts ? (
            <CatalogueLoadingState label={`Loading departments for ${selectedUnit.name}...`} count={6} />
          ) : departments.length === 0 ? (
            <CatalogueEmptyState
              title="No Departments found."
              message={`No departments were found under ${selectedUnit.name}.`}
              onAction={handleResetToRoot}
              actionLabel="Back to Academic Units"
            />
          ) : (
            <DepartmentList
              unit={selectedUnit}
              departments={departments}
              onSelectDepartment={handleSelectDept}
              onBackToUnits={handleResetToRoot}
              onDepartmentUpdated={(updated) => {
                setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
                setSuccessNotice(`Department "${updated.name}" updated successfully.`);
                setTimeout(() => setSuccessNotice(null), 5000);
              }}
              onDepartmentDeleted={(deletedId) => {
                setDepartments((prev) => prev.filter((d) => d.id !== deletedId));
                setSuccessNotice('Department deleted successfully.');
                setTimeout(() => setSuccessNotice(null), 5000);
              }}
            />
          )}
        </>
      )}

      {/* LEVEL 3: Degree Programmes (When Department is chosen, but Programme not yet) */}
      {selectedUnit && selectedDept && !selectedProg && (
        <>
          {loadingProgs ? (
            <CatalogueLoadingState label={`Loading degree programmes for ${selectedDept.name}...`} count={6} />
          ) : (
            <ProgrammeList
              department={selectedDept}
              unit={selectedUnit}
              programmes={programmes}
              onSelectProgramme={handleSelectProg}
              onBackToDepartments={() => setSelectedDept(null)}
              onProgrammeCreated={handleProgrammeCreated}
              onProgrammeUpdated={handleProgrammeUpdated}
              onProgrammeDeleted={handleProgrammeDeleted}
            />
          )}
        </>
      )}

      {/* LEVEL 4: Programme Selected -> Management Hub (Curriculum / Structure / Metadata) */}
      {selectedUnit && selectedDept && selectedProg && (
        <div className="space-y-6">
          {/* Programme Context Banner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    {selectedProg.awardLevel || 'Bachelor Degree'}
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {selectedProg.code || selectedProg.shortName || selectedProg.id}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                    selectedProg.active !== false
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    {selectedProg.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {selectedProg.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Housed in {selectedDept.name} • {selectedUnit.name}
                </p>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <button
                  onClick={() => setEditingProg(selectedProg)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setDeletingProg(selectedProg)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/30 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => setSelectedProg(null)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  <span>Back to Programmes</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs for Programme Management */}
            <div className="mt-4 flex items-center gap-2 border-b border-slate-800/60 pb-3">
              <button
                onClick={() => setProgActiveTab('curriculum')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  progActiveTab === 'curriculum'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Term Courses</span>
              </button>

              <button
                onClick={() => setProgActiveTab('structure')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  progActiveTab === 'structure'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Year & Semester Structure</span>
              </button>

              <button
                onClick={() => setProgActiveTab('details')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  progActiveTab === 'details'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Info className="h-3.5 w-3.5" />
                <span>Programme Details</span>
              </button>
            </div>

            {/* Sub-view 1: Curriculum & Courses (Filter bar) */}
            {progActiveTab === 'curriculum' && (
              <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
                <YearSelector
                  durationYears={selectedProg.durationYears || 3}
                  selectedYear={selectedYear}
                  onSelectYear={(y) => setSelectedYear(y)}
                />

                <SemesterSelector
                  selectedSemester={selectedSemester}
                  onSelectSemester={(s) => setSelectedSemester(s)}
                />
              </div>
            )}
          </div>

          {/* TAB 1 CONTENT: Courses List View */}
          {progActiveTab === 'curriculum' && selectedYear !== null && selectedSemester !== null && (
            <>
              {loadingCourses ? (
                <CatalogueLoadingState
                  label={`Loading Year ${selectedYear} Semester ${selectedSemester === 1 ? 'I' : 'II'} courses...`}
                  count={4}
                />
              ) : (
                <CourseList
                  programme={selectedProg}
                  year={selectedYear}
                  semester={selectedSemester}
                  courses={courses}
                  onAddCourse={() => setIsAddingCourse(true)}
                  onAssignCourse={() => {
                    setCourseForAssignment(null);
                    setIsAssigningCourse(true);
                  }}
                  onViewCourseDetails={(c) => setViewingCourseDetail(c)}
                  onEditCourse={(c) => setEditingCourse(c)}
                  onDeleteCourse={(c) => setDeletingCourse(c)}
                />
              )}
            </>
          )}

          {/* TAB 2 CONTENT: Year & Semester Structure Manager */}
          {progActiveTab === 'structure' && (
            <ProgrammeStructureManager
              programme={selectedProg}
              onSelectTerm={(y, s) => {
                setSelectedYear(y);
                setSelectedSemester(s);
                setProgActiveTab('curriculum');
              }}
              onDurationUpdated={handleDurationUpdated}
            />
          )}

          {/* TAB 3 CONTENT: Programme Details & Metadata Breakdown */}
          {progActiveTab === 'details' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Official Programme Specifications
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Accreditation, structural IDs, and regulatory records stored in Firestore.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Document ID:</span>
                    <span className="font-mono text-indigo-400 font-semibold">{selectedProg.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Programme Code:</span>
                    <span className="font-mono text-white font-semibold">{selectedProg.code || selectedProg.shortName || selectedProg.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Award Level:</span>
                    <span className="text-emerald-400 font-medium">{selectedProg.awardLevel || 'Bachelor Degree'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Degree Level:</span>
                    <span className="text-slate-300 font-medium">{selectedProg.degreeLevel || "Bachelor's Degree"}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Duration:</span>
                    <span className="text-white font-medium">{selectedProg.durationYears || 3} Years ({Number(selectedProg.durationYears || 3) * 2} Semesters)</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Host Department:</span>
                    <span className="text-white font-medium">{selectedDept.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Academic Unit:</span>
                    <span className="text-white font-medium">{selectedUnit.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Study Mode:</span>
                    <span className="text-slate-300 font-medium">{selectedProg.studyMode || 'Full-Time'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Academic Year Edition:</span>
                    <span className="text-slate-300 font-medium">{selectedProg.academicYear || '2025/2026'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Source:</span>
                    <span className="text-slate-400 truncate max-w-[200px]">{selectedProg.source || 'Official Academic Catalogue'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modals for Current Programme (Stage 3B) */}
          {editingProg && (
            <EditProgrammeModal
              isOpen={Boolean(editingProg)}
              onClose={() => setEditingProg(null)}
              programme={editingProg}
              department={selectedDept}
              unit={selectedUnit}
              onProgrammeUpdated={handleProgrammeUpdated}
            />
          )}

          {deletingProg && (
            <DeleteProgrammeModal
              isOpen={Boolean(deletingProg)}
              onClose={() => setDeletingProg(null)}
              programme={deletingProg}
              department={selectedDept}
              onProgrammeDeleted={handleProgrammeDeleted}
              onProgrammeUpdated={handleProgrammeUpdated}
            />
          )}
        </div>
      )}
    </>
  )}

      {/* Course Action Modals (Stage 3C Course Management) */}
      {isAddingCourse && (
        <AddCourseModal
          isOpen={isAddingCourse}
          onClose={() => setIsAddingCourse(false)}
          programme={selectedProg}
          department={selectedDept}
          unit={selectedUnit}
          year={selectedYear}
          semester={selectedSemester}
          onCourseCreated={handleCourseCreated}
          onCourseAssigned={handleCourseAssigned}
        />
      )}

      {isAssigningCourse && selectedProg && (
        <AssignCourseModal
          isOpen={isAssigningCourse}
          onClose={() => {
            setIsAssigningCourse(false);
            setCourseForAssignment(null);
          }}
          programme={selectedProg}
          initialCourse={courseForAssignment}
          initialYear={selectedYear || 1}
          initialSemester={selectedSemester || 1}
          onCourseAssigned={handleCourseAssigned}
        />
      )}

      {viewingCourseDetail && (
        <CourseDetailModal
          isOpen={Boolean(viewingCourseDetail)}
          onClose={() => setViewingCourseDetail(null)}
          course={viewingCourseDetail}
          currentProgramme={selectedProg}
          currentYear={selectedYear}
          currentSemester={selectedSemester}
          onAssignToAnotherProg={(c) => {
            setViewingCourseDetail(null);
            setCourseForAssignment(c);
            setIsAssigningCourse(true);
          }}
          onEditCourse={(c) => {
            setViewingCourseDetail(null);
            setEditingCourse(c);
          }}
          onDeleteCanonicalCourse={(c) => {
            setViewingCourseDetail(null);
            setDeletingCourse(c);
          }}
          onRemoveFromThisProg={(c) => {
            setViewingCourseDetail(null);
            setDeletingCourse(c);
          }}
        />
      )}

      {editingCourse && (
        <EditCourseModal
          isOpen={Boolean(editingCourse)}
          onClose={() => setEditingCourse(null)}
          course={editingCourse}
          programme={selectedProg}
          onCourseUpdated={handleCourseUpdated}
        />
      )}

      {deletingCourse && (
        <DeleteCourseModal
          isOpen={Boolean(deletingCourse)}
          onClose={() => setDeletingCourse(null)}
          course={deletingCourse}
          programme={selectedProg}
          year={selectedYear}
          semester={selectedSemester}
          onCourseRemovedFromProg={handleCourseRemovedFromProg}
          onCanonicalCourseDeleted={handleCanonicalCourseDeleted}
        />
      )}
    </div>
  );
};
