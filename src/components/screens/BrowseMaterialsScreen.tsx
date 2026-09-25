import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  Compass,
  GraduationCap,
  Layers,
  School,
  Sparkles,
  FileText,
  ChevronRight,
  Info,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Course, ScreenId, StudentProfile } from '../../types';
import {
  ACADEMIC_UNIVERSITIES,
  AcademicCollege,
  AcademicDepartment,
  AcademicProgramme,
  fetchCollegesForUniversity,
  fetchDepartmentsForCollege,
  fetchProgrammesForDepartment,
  fetchBrowseCourses,
} from '../../data/academicStructure';

interface BrowseMaterialsScreenProps {
  profile: StudentProfile;
  onNavigate: (screen: ScreenId) => void;
  onSelectCourse: (course: Course) => void;
  onBack: () => void;
}

export const BrowseMaterialsScreen: React.FC<BrowseMaterialsScreenProps> = ({
  profile,
  onNavigate,
  onSelectCourse,
  onBack,
}) => {
  // Temporary browsing selections — completely decoupled from student profile
  const [universityId, setUniversityId] = useState<string>('');
  const [colleges, setColleges] = useState<AcademicCollege[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);

  const [collegeId, setCollegeId] = useState<string>('');
  const [departments, setDepartments] = useState<AcademicDepartment[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [departmentId, setDepartmentId] = useState<string>('');
  const [programmes, setProgrammes] = useState<AcademicProgramme[]>([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);

  const [programmeId, setProgrammeId] = useState<string>('');
  const [specialisationId, setSpecialisationId] = useState<string>('');
  const [subStreamSlug, setSubStreamSlug] = useState<string>('');
  const [year, setYear] = useState<number | null>(null);
  const [semester, setSemester] = useState<number | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [hasQueriedCourses, setHasQueriedCourses] = useState(false);

  // Initialize with student's current profile values for convenience (if available)
  useEffect(() => {
    const initPreselection = async () => {
      // Determine default university
      let defaultUniId = 'udsm';
      if (profile.universityId) {
        defaultUniId = profile.universityId;
      } else if (profile.university?.toLowerCase().includes('dar es salaam')) {
        defaultUniId = 'udsm';
      }

      setUniversityId(defaultUniId);
      setLoadingColleges(true);
      const fetchedColleges = await fetchCollegesForUniversity(defaultUniId);
      setColleges(fetchedColleges);
      setLoadingColleges(false);

      if (fetchedColleges.length > 0) {
        // Preselect CoNAS for UDSM or first college
        const defaultCollege =
          fetchedColleges.find((c) => c.id === 'conas') || fetchedColleges[0];
        setCollegeId(defaultCollege.id);

        setLoadingDepartments(true);
        const fetchedDepts = await fetchDepartmentsForCollege(defaultCollege.id);
        setDepartments(fetchedDepts);
        setLoadingDepartments(false);

        if (fetchedDepts.length > 0) {
          // Preselect Department of Statistics or Mathematics
          const defaultDept =
            fetchedDepts.find((d) => d.id === 'dept-stats') || fetchedDepts[0];
          setDepartmentId(defaultDept.id);

          setLoadingProgrammes(true);
          const fetchedProgs = await fetchProgrammesForDepartment(defaultDept.id);
          setProgrammes(fetchedProgs);
          setLoadingProgrammes(false);

          if (fetchedProgs.length > 0) {
            const defaultProg =
              fetchedProgs.find(
                (p) => p.id === 'math-stats' || p.id === 'math-stats-math'
              ) || fetchedProgs[0];
            setProgrammeId(defaultProg.id);

            // Leave Year and Semester open or ready for the user to explore freely
            setYear(null);
            setSemester(null);
          }
        }
      }
    };

    initPreselection();
  }, [profile.universityId, profile.university]);

  // Dependent selection 1: University Change
  // If University changes: reset College, Department, Programme, Year, Semester and Course.
  const handleUniversityChange = async (newUniId: string) => {
    setUniversityId(newUniId);
    setCollegeId('');
    setDepartments([]);
    setDepartmentId('');
    setProgrammes([]);
    setProgrammeId('');
    setYear(null);
    setSemester(null);
    setCourses([]);
    setHasQueriedCourses(false);

    if (!newUniId) {
      setColleges([]);
      return;
    }

    setLoadingColleges(true);
    const fetched = await fetchCollegesForUniversity(newUniId);
    setColleges(fetched);
    setLoadingColleges(false);
  };

  // Dependent selection 2: College Change
  // If College changes: reset Department, Programme, Year, Semester and Course.
  const handleCollegeChange = async (newCollegeId: string) => {
    setCollegeId(newCollegeId);
    setDepartmentId('');
    setProgrammes([]);
    setProgrammeId('');
    setYear(null);
    setSemester(null);
    setCourses([]);
    setHasQueriedCourses(false);

    if (!newCollegeId) {
      setDepartments([]);
      return;
    }

    setLoadingDepartments(true);
    const fetched = await fetchDepartmentsForCollege(newCollegeId);
    setDepartments(fetched);
    setLoadingDepartments(false);
  };

  // Dependent selection 3: Department Change
  // If Department changes: reset Programme, Year, Semester and Course.
  const handleDepartmentChange = async (newDeptId: string) => {
    setDepartmentId(newDeptId);
    setProgrammeId('');
    setYear(null);
    setSemester(null);
    setCourses([]);
    setHasQueriedCourses(false);

    if (!newDeptId) {
      setProgrammes([]);
      return;
    }

    setLoadingProgrammes(true);
    const fetched = await fetchProgrammesForDepartment(newDeptId);
    setProgrammes(fetched);
    setLoadingProgrammes(false);
  };

  const loadCourses = async (
    targetProgId: string,
    targetYear: number | null,
    targetSemester: number | null,
    targetSpecId: string,
    targetStreamSlug: string
  ) => {
    if (!targetYear || !targetSemester || !targetProgId || !universityId) return;

    setLoadingCourses(true);
    setHasQueriedCourses(true);
    const loadedCourses = await fetchBrowseCourses({
      universityId,
      programmeId: targetProgId,
      year: targetYear,
      semester: targetSemester,
      specialisationId: targetSpecId || undefined,
      subStreamSlug: targetStreamSlug || undefined,
    });
    setCourses(loadedCourses);
    setLoadingCourses(false);
  };

  // Dependent selection 4: Programme Change
  // If Programme changes: reset Specialisation, Sub-Stream, Year, Semester and Course.
  const handleProgrammeChange = (newProgId: string) => {
    setProgrammeId(newProgId);
    setSpecialisationId('');
    setSubStreamSlug('');
    setYear(null);
    setSemester(null);
    setCourses([]);
    setHasQueriedCourses(false);
  };

  // Dependent selection 4b: Specialisation Change
  const handleSpecialisationChange = (newSpecId: string) => {
    setSpecialisationId(newSpecId);
    setSubStreamSlug('');
    if (year && semester) {
      loadCourses(programmeId, year, semester, newSpecId, '');
    }
  };

  // Dependent selection 4c: Sub-Stream Change
  const handleSubStreamChange = (newSlug: string) => {
    setSubStreamSlug(newSlug);
    if (year && semester) {
      loadCourses(programmeId, year, semester, specialisationId, newSlug);
    }
  };

  // Dependent selection 5: Year Change
  // If Year changes: reset Semester and Course.
  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    setSemester(null);
    setCourses([]);
    setHasQueriedCourses(false);
  };

  // Dependent selection 6: Semester Change
  // If Semester changes: reload only courses belonging to that selection.
  const handleSemesterChange = async (newSemester: number) => {
    setSemester(newSemester);
    if (!year || !programmeId || !universityId) return;
    loadCourses(programmeId, year, newSemester, specialisationId, subStreamSlug);
  };

  const selectedProgrammeObj = programmes.find((p) => p.id === programmeId);
  const availableSpecialisations = selectedProgrammeObj?.specialisations || [];
  const selectedSpecialisationObj = availableSpecialisations.find(
    (s) => s.id === specialisationId
  );
  const availableSubStreams = selectedSpecialisationObj?.subStreams || [];
  const durationYears = selectedProgrammeObj?.durationYears || 3;
  const yearsList = Array.from({ length: durationYears }, (_, i) => i + 1);

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28 max-w-4xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="browse-materials-back-btn"
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
            Temporary Session
          </span>
        </div>
      </div>

      {/* Screen Title & Safe Browsing Banner */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-md shadow-sky-600/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Browse Academic Materials
            </h1>
            <p className="text-xs text-slate-400">
              Explore syllabus topics, lecture notes, and past examination papers across faculties and years.
            </p>
          </div>
        </div>

        {/* Explicit Assurance Notice */}
        <div
          id="browse-safe-notice"
          className="mt-3 p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-start gap-2.5 text-sky-200 text-xs shadow-inner"
        >
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-white text-xs">
              Browsing mode does not alter your saved student profile.
            </p>
            <p className="text-[11px] text-sky-300/80 leading-relaxed">
              Your registered degree programme, active year of study, and Home &ldquo;My Courses&rdquo; list remain strictly preserved.
            </p>
          </div>
        </div>
      </div>

      {/* DEPENDENT SELECTION PANEL */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Academic Hierarchy Filter</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">
            Step-by-step dependent selection
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. University */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-blue-400" />
              <span>1. University</span>
            </label>
            <select
              id="browse-select-university"
              value={universityId}
              onChange={(e) => handleUniversityChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">-- Choose University --</option>
              {ACADEMIC_UNIVERSITIES.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name} ({uni.short})
                </option>
              ))}
            </select>
          </div>

          {/* 2. College / School / Institute */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>2. College / School / Institute</span>
              </span>
              {loadingColleges && (
                <span className="text-[10px] text-sky-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              id="browse-select-college"
              value={collegeId}
              disabled={!universityId || loadingColleges}
              onChange={(e) => handleCollegeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">
                {!universityId
                  ? '-- Select University First --'
                  : colleges.length === 0
                  ? '-- No Colleges Available --'
                  : '-- Choose College / School --'}
              </option>
              {colleges.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>3. Department</span>
              </span>
              {loadingDepartments && (
                <span className="text-[10px] text-sky-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              id="browse-select-department"
              value={departmentId}
              disabled={!collegeId || loadingDepartments}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">
                {!collegeId
                  ? '-- Select College First --'
                  : departments.length === 0
                  ? '-- No Departments Available --'
                  : '-- Choose Department --'}
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Programme */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>4. Degree Programme</span>
              </span>
              {loadingProgrammes && (
                <span className="text-[10px] text-sky-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                </span>
              )}
            </label>
            <select
              id="browse-select-programme"
              value={programmeId}
              disabled={!departmentId || loadingProgrammes}
              onChange={(e) => handleProgrammeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">
                {!departmentId
                  ? '-- Select Department First --'
                  : programmes.length === 0
                  ? '-- No Programmes Available --'
                  : '-- Choose Degree Programme --'}
              </option>
              {programmes.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4b. Specialisation & 4c. Sub-Stream / Language Option (if programme has specialisations) */}
        {availableSpecialisations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
            {/* 4b. Specialisation */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Specialisation (Academic Stream)</span>
              </label>
              <select
                id="browse-select-specialisation"
                value={specialisationId}
                onChange={(e) => handleSpecialisationChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">-- All Specialisations --</option>
                {availableSpecialisations.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4c. Sub-Stream / Language Option */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>Sub-Stream / Language Option</span>
              </label>
              <select
                id="browse-select-substream"
                value={subStreamSlug}
                disabled={!specialisationId || availableSubStreams.length === 0}
                onChange={(e) => handleSubStreamChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">
                  {!specialisationId
                    ? '-- Select Specialisation First --'
                    : availableSubStreams.length === 0
                    ? '-- No Sub-Streams Available --'
                    : '-- All Sub-Streams / Options --'}
                </option>
                {availableSubStreams.map((sub) => (
                  <option key={sub.slug} value={sub.slug}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 5. Year and 6. Semester Selectors */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Year Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>5. Academic Year of Study</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {yearsList.map((y) => {
                  const isSelected = year === y;
                  return (
                    <button
                      key={y}
                      id={`browse-year-btn-${y}`}
                      type="button"
                      disabled={!programmeId}
                      onClick={() => handleYearChange(y)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      Year {y}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Semester Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>6. Semester</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((s) => {
                  const isSelected = semester === s;
                  return (
                    <button
                      key={s}
                      id={`browse-semester-btn-${s}`}
                      type="button"
                      disabled={!year}
                      onClick={() => handleSemesterChange(s)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/30'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      Semester {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFIED COURSES & MATERIALS VIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Verified Academic Courses & Materials
            </h3>
            <p className="text-xs text-slate-400">
              {year && semester && programmeId
                ? `Year ${year} • Semester ${semester} Curriculum`
                : 'Select Year and Semester to view available coursework and documents'}
            </p>
          </div>
          {courses.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-sky-400 border border-blue-500/20">
              {courses.length} Courses Verified
            </span>
          )}
        </div>

        {/* State A: Loading Courses */}
        {loadingCourses && (
          <div
            id="browse-loading-courses"
            className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3"
          >
            <Loader2 className="w-7 h-7 text-sky-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-300 font-medium">
              Loading verified courses for this semester...
            </p>
          </div>
        )}

        {/* State B: Courses Loaded (Found) */}
        {!loadingCourses && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {courses.map((course) => {
              const materialsCount = course.materials?.length || 0;
              const pastPapersCount = course.pastPapersCount || 0;

              return (
                <div
                  key={course.id}
                  id={`browse-course-card-${course.id}`}
                  onClick={() => {
                    onSelectCourse(course);
                    onNavigate('course-detail');
                  }}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/90 hover:border-blue-500/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${course.accentColor || '#38BDF8'}20`,
                          color: course.accentColor || '#38BDF8',
                        }}
                      >
                        {course.code}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {course.subStream && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            {course.subStream}
                          </span>
                        )}
                        {course.type && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              course.type === 'Core'
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                                : 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                            }`}
                          >
                            {course.type}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">
                          {course.credits} Credits
                        </span>
                        {course.electiveRule && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {course.electiveRule}
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                      {course.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {course.overview}
                    </p>
                    {course.note && (
                      <p className="text-[10px] text-amber-400/90 italic mt-1.5 flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>Note: {course.note}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {course.instructor?.name} • {course.department}
                    </p>
                  </div>

                  {/* Materials & Resources Badge */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-sky-400 font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        {materialsCount} Handouts
                      </span>
                      <span>•</span>
                      <span className="text-indigo-400 font-medium">
                        {pastPapersCount} Past Papers
                      </span>
                    </div>

                    <span className="text-xs text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* State C: Empty State (Exact required phrase when no verified data exists) */}
        {!loadingCourses && hasQueriedCourses && courses.length === 0 && (
          <div
            id="browse-empty-state"
            className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/90 text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-200">
                No verified academic data is available for this selection yet.
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Academic materials and syllabus documents for this specific programme, year, or semester have not yet been certified. Please try another selection.
              </p>
            </div>
          </div>
        )}

        {/* State D: Prompt to pick year & semester */}
        {!loadingCourses && !hasQueriedCourses && (
          <div
            id="browse-prompt-state"
            className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2"
          >
            <BookOpen className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">
              Select an <strong>Academic Year</strong> and <strong>Semester</strong> above to load verified courses and syllabus materials.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
