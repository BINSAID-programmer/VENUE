import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Search,
  Filter,
  GraduationCap,
  Building2,
  Layers,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  LecturerRecord,
  LecturerCourseAssignment,
  UniversityRecord,
  AcademicUnitRecord,
  DepartmentRecord,
  ProgrammeRecord,
} from '../../../types';
import {
  lecturerCourseService,
  CourseSearchOption,
} from '../../../services/lecturerCourseService';
import { adminCatalogueService } from '../../../services/adminCatalogueService';

interface AssignCourseModalProps {
  lecturer: LecturerRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAssignment: LecturerCourseAssignment) => void;
}

export const AssignCourseModal: React.FC<AssignCourseModalProps> = ({
  lecturer,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Academic Catalogue Hierarchy state
  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [units, setUnits] = useState<AcademicUnitRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeRecord[]>([]);

  // Filter selections
  const [selectedUniId, setSelectedUniId] = useState<string>('udsm');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedProgId, setSelectedProgId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  // Course search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<CourseSearchOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseSearchOption | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Initialize modal defaults from lecturer profile
  useEffect(() => {
    if (!isOpen || !lecturer) return;

    setError(null);
    setSelectedCourse(null);
    setSearchQuery('');
    setDebouncedQuery('');

    // Pre-populate hierarchy based on lecturer's academic affiliation (Requirement 11)
    const uniId = lecturer.universityId || 'udsm';
    setSelectedUniId(uniId);
    setSelectedUnitId(lecturer.academicUnitId || '');
    setSelectedDeptId(lecturer.departmentId || '');
    setSelectedProgId('');
    setSelectedYear('');
    setSelectedSemester('');

    // Load universities & units
    const initCatalogue = async () => {
      try {
        const [uniList, unitList] = await Promise.all([
          adminCatalogueService.getUniversities(),
          adminCatalogueService.getAcademicUnits(uniId),
        ]);
        setUniversities(uniList);
        setUnits(unitList);

        if (lecturer.academicUnitId) {
          const depts = await adminCatalogueService.getDepartmentsByUnit(lecturer.academicUnitId);
          setDepartments(depts);
        }
      } catch (err) {
        console.warn('Error loading hierarchy for course assignment:', err);
      }
    };
    initCatalogue();
  }, [isOpen, lecturer]);

  // 3. When selectedUnitId changes, load departments
  useEffect(() => {
    if (!selectedUnitId) {
      setDepartments([]);
      return;
    }
    let isMounted = true;
    const loadDepts = async () => {
      try {
        const depts = await adminCatalogueService.getDepartmentsByUnit(selectedUnitId);
        if (isMounted) setDepartments(depts);
      } catch (err) {
        console.warn('Error loading departments:', err);
      }
    };
    loadDepts();
    return () => {
      isMounted = false;
    };
  }, [selectedUnitId]);

  // 4. When selectedDeptId changes, load programmes
  useEffect(() => {
    if (!selectedDeptId) {
      setProgrammes([]);
      return;
    }
    let isMounted = true;
    const loadProgs = async () => {
      try {
        const progs = await adminCatalogueService.getProgrammesByDepartment(selectedDeptId);
        if (isMounted) setProgrammes(progs);
      } catch (err) {
        console.warn('Error loading programmes:', err);
      }
    };
    loadProgs();
    return () => {
      isMounted = false;
    };
  }, [selectedDeptId]);

  // 5. Search courses when search query or filters change
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const performSearch = async () => {
      setSearching(true);
      setError(null);
      try {
        const results = await lecturerCourseService.searchCatalogueCourses({
          searchTerm: debouncedQuery,
          universityId: selectedUniId,
          academicUnitId: selectedUnitId || undefined,
          departmentId: selectedDeptId || undefined,
          programmeId: selectedProgId || undefined,
          yearOfStudy: selectedYear ? Number(selectedYear) : undefined,
          semester: selectedSemester ? Number(selectedSemester) : undefined,
          maxResults: 40,
        });

        if (isMounted) {
          setSearchResults(results);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Error querying courses:', err);
          setError(err?.message || 'Failed to search courses from catalogue.');
        }
      } finally {
        if (isMounted) setSearching(false);
      }
    };

    performSearch();
    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    debouncedQuery,
    selectedUniId,
    selectedUnitId,
    selectedDeptId,
    selectedProgId,
    selectedYear,
    selectedSemester,
  ]);

  if (!isOpen || !lecturer) return null;

  const handleSelectCourse = (course: CourseSearchOption) => {
    setSelectedCourse(course);
    setError(null);

    // If course had placement context, auto-sync filters
    if (course.programmeId && !selectedProgId) {
      setSelectedProgId(course.programmeId);
    }
    if (course.yearOfStudy && !selectedYear) {
      setSelectedYear(String(course.yearOfStudy));
    }
    if (course.semester && !selectedSemester) {
      setSelectedSemester(String(course.semester));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) {
      setError('Please select an existing academic course to assign.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Find selected programme name
      const targetProg = programmes.find((p) => p.id === selectedProgId);
      const progName = targetProg ? targetProg.name : selectedCourse.programmeName;

      // Find department name
      const targetDept = departments.find((d) => d.id === selectedDeptId);
      const deptName = targetDept ? targetDept.name : lecturer.departmentName;

      // Find unit name
      const targetUnit = units.find((u) => u.id === selectedUnitId);
      const unitName = targetUnit ? targetUnit.name : lecturer.academicUnitName;

      const newAssignment = await lecturerCourseService.assignCourseToLecturer({
        lecturerId: lecturer.id,
        userId: lecturer.userId,
        courseId: selectedCourse.courseId,
        courseCode: selectedCourse.code,
        courseTitle: selectedCourse.title,
        credits: selectedCourse.defaultCredits || 12,
        universityId: selectedUniId || 'udsm',
        academicUnitId: selectedUnitId || lecturer.academicUnitId,
        academicUnitName: unitName,
        departmentId: selectedDeptId || lecturer.departmentId,
        departmentName: deptName,
        programmeId: selectedProgId || undefined,
        programmeName: progName,
        yearOfStudy: selectedYear ? Number(selectedYear) : selectedCourse.yearOfStudy,
        semester: selectedSemester ? Number(selectedSemester) : selectedCourse.semester,
      });

      onSuccess(newAssignment);
      onClose();
    } catch (err: any) {
      console.error('Error assigning course to lecturer:', err);
      // Requirement 7: Clear duplicate message
      setError(
        err?.message ||
          'This course is already assigned to this lecturer for this teaching context.'
      );
    } finally {
      setSubmitting(false);
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
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Assign Course to Lecturer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Faculty Member: <span className="text-white font-semibold">{lecturer.title ? `${lecturer.title} ` : ''}{lecturer.fullName}</span>
                {lecturer.staffId && <span className="font-mono text-slate-500 ml-1.5">({lecturer.staffId})</span>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Assignment Error</span>
                <span className="leading-relaxed">{error}</span>
              </div>
            </div>
          )}

          {/* Academic Context Notice (Requirement 11) */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              Home Department: <strong className="text-slate-200">{lecturer.departmentName || lecturer.departmentId}</strong>.
              You may also assign cross-department service courses without changing the lecturer's home department.
            </span>
          </div>

          {/* Filter Hierarchy Accordion / Grid (Requirement 10) */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-rose-400" />
              Academic Catalogue Placement Scope
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Academic Unit (College / School / Institute) */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-sky-400" /> Academic Unit
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => {
                    setSelectedUnitId(e.target.value);
                    setSelectedDeptId('');
                    setSelectedProgId('');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                >
                  <option value="">All Academic Units</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.shortName ? `${u.shortName} — ` : ''}{u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <Building className="w-3 h-3 text-indigo-400" /> Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    setSelectedProgId('');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Degree Programme */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-emerald-400" /> Teaching Degree Programme Context (Optional)
                </label>
                <select
                  value={selectedProgId}
                  onChange={(e) => setSelectedProgId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                >
                  <option value="">General Offering / Any Programme</option>
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.awardLevel || 'Degree'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Year of Study */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" /> Year of Study
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                >
                  <option value="">All Years</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                </select>
              </div>

              {/* Semester */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-400" /> Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                >
                  <option value="">All Semesters</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Box (Debounced - Requirement 9) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Search Accredited Courses</span>
              {searching && (
                <span className="text-[10px] text-sky-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Searching catalogue...
                </span>
              )}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course code or title (e.g. ST 113, Basic Statistics, MT 100)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Courses Search Results List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Available Courses ({searchResults.length})
            </span>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 border border-slate-800/80 rounded-xl p-2 bg-slate-950/40">
              {searching ? (
                <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
                  <span>Scanning verified canonical courses...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                  <p>No matching courses found in catalogue.</p>
                  <p className="text-[11px] text-slate-600">
                    Try adjusting the search query or changing the department/programme filter above.
                  </p>
                </div>
              ) : (
                searchResults.map((course) => {
                  const isSelected = selectedCourse?.courseId === course.courseId;
                  return (
                    <div
                      key={`${course.code}_${course.programmeId || 'all'}_${course.yearOfStudy || 0}_${course.semester || 0}`}
                      onClick={() => handleSelectCourse(course)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-rose-500/10 border-rose-500/40 text-white shadow-sm'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            {course.code}
                          </span>
                          <span className="font-bold text-xs text-white truncate">
                            {course.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400 pt-0.5">
                          <span>{course.defaultCredits || 12} Credits</span>
                          {course.programmeName && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[200px]">{course.programmeName}</span>
                            </>
                          )}
                          {course.yearOfStudy && course.semester && (
                            <>
                              <span>•</span>
                              <span>Y{course.yearOfStudy}S{course.semester}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCourse(course);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Select
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Course Summary Preview */}
          {selectedCourse && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/30 to-indigo-950/30 border border-rose-500/30 space-y-2 animate-fade-in">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                Selected Course Assignment Summary
              </span>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white text-sm">
                    {selectedCourse.code} — {selectedCourse.title}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {selectedCourse.defaultCredits || 12} Credits •{' '}
                    {selectedProgId
                      ? programmes.find((p) => p.id === selectedProgId)?.name || 'Designated Programme'
                      : 'General Teaching Context'}{' '}
                    {selectedYear && selectedSemester ? `(Year ${selectedYear}, Semester ${selectedSemester})` : ''}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selectedCourse}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assigning Course...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Confirm Assignment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
