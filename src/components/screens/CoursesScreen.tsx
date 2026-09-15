import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  ChevronRight,
  User,
  Calendar,
  Layers,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  School,
  Building,
  Info,
  CheckCircle2,
  ListFilter,
  X,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Course, CourseRecord, StudentProfile } from '../../types';
import { courseCurriculumService, ProgrammeCurriculumSummary } from '../../services/courseCurriculumService';
import { academicStructureService } from '../../services/academicStructureService';

interface CoursesScreenProps {
  courses?: Course[];
  onSelectCourse: (course: Course) => void;
  onBackToHome?: () => void;
  profile?: StudentProfile;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({
  courses: initialCourses = [],
  onSelectCourse,
  onBackToHome,
  profile,
}) => {
  // Navigation Hierarchy:
  // selectedYear = null -> Stage 1: Select Academic Year (Year 1..N based on programme duration)
  // selectedSemester = null -> Stage 2: Select Semester (Semester 1, Semester 2)
  // selectedYear && selectedSemester -> Stage 3: Course List for the selected semester
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  // View Mode: 'term' (step-by-step) | 'roadmap' (complete multi-year degree overview)
  const [viewMode, setViewMode] = useState<'term' | 'roadmap'>('term');

  // Search & Filter in Stage 3
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'Core' | 'Elective'>('all');

  // Loaded courses and state
  const [termCourses, setTermCourses] = useState<CourseRecord[]>([]);
  const [curriculumRoadmap, setCurriculumRoadmap] = useState<ProgrammeCurriculumSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'firestore' | 'cache' | 'catalogue_fallback'>('cache');

  // Course Detail Modal state (Requirement 10: Clean basic course info without fake data)
  const [inspectingCourse, setInspectingCourse] = useState<CourseRecord | null>(null);

  // Resolve programme ID and metadata
  const currentProgrammeId = useMemo(() => {
    return (
      profile?.programmeId ||
      profile?.programmeShort?.toLowerCase() ||
      'math-stats'
    );
  }, [profile?.programmeId, profile?.programmeShort]);

  // Resolve dynamic programme duration (e.g. 3, 4, 5 years)
  const durationYears = useMemo(() => {
    if (curriculumRoadmap?.durationYears) return curriculumRoadmap.durationYears;
    if (profile?.programmeDurationYears) return profile.programmeDurationYears;
    return 3;
  }, [curriculumRoadmap?.durationYears, profile?.programmeDurationYears]);

  // Available study years based on actual programme duration
  const availableYears = useMemo(() => {
    return Array.from({ length: Math.max(1, durationYears) }, (_, i) => i + 1);
  }, [durationYears]);

  // Load complete programme curriculum roadmap on initial mount or programme change
  useEffect(() => {
    let isMounted = true;
    const loadRoadmap = async () => {
      try {
        const roadmap = await courseCurriculumService.getProgrammeCurriculumRoadmap(currentProgrammeId);
        if (isMounted) {
          setCurriculumRoadmap(roadmap);
        }
      } catch (err) {
        console.warn('CoursesScreen: Error loading curriculum roadmap:', err);
      }
    };

    loadRoadmap();
    return () => {
      isMounted = false;
    };
  }, [currentProgrammeId]);

  // Load term courses whenever selectedYear and selectedSemester are set
  useEffect(() => {
    if (selectedYear === null || selectedSemester === null) {
      setTermCourses([]);
      return;
    }

    let isMounted = true;
    const fetchTermCourses = async () => {
      setIsLoading(true);
      try {
        const result = await courseCurriculumService.getCoursesByProgrammeAndTerm({
          programmeId: currentProgrammeId,
          yearOfStudy: selectedYear,
          semester: selectedSemester,
          universityId: profile?.universityId,
        });

        if (isMounted) {
          setTermCourses(result.courses);
          setDataSource(result.source);
        }
      } catch (err) {
        console.warn('CoursesScreen: Error fetching term courses:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTermCourses();
    return () => {
      isMounted = false;
    };
  }, [currentProgrammeId, selectedYear, selectedSemester, profile?.universityId]);

  // Navigation helpers
  const handleBackToYears = () => {
    setSelectedYear(null);
    setSelectedSemester(null);
    setSearchQuery('');
    setSelectedType('all');
  };

  const handleBackToSemesters = () => {
    setSelectedSemester(null);
    setSearchQuery('');
    setSelectedType('all');
  };

  // Convert CourseRecord to UI Course model when needed
  const handleSelectCourseRecord = (record: CourseRecord) => {
    const uiCourse = courseCurriculumService.mapRecordToCourse(
      record,
      profile?.programmeName || profile?.programme
    );
    onSelectCourse(uiCourse);
  };

  // -------------------------------------------------------------
  // VIEW MODE: Full Degree Curriculum Roadmap (Requirement 9)
  // Shows Year 1 (Sem 1, Sem 2), Year 2 (Sem 1, Sem 2)... Year N
  // -------------------------------------------------------------
  if (viewMode === 'roadmap') {
    return (
      <div className="p-4 sm:p-6 space-y-6 pb-28">
        {/* Header & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <School className="w-3 h-3" />
                {profile?.universityShort || profile?.university || 'University'}
              </span>
              {profile?.college && (
                <>
                  <span className="text-slate-600 text-xs">•</span>
                  <span className="text-[11px] text-slate-400 font-medium">{profile.college}</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {profile?.programme || profile?.programmeName || 'Degree Curriculum Roadmap'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Official accredited curriculum structure ({durationYears}-Year Programme •{' '}
              {curriculumRoadmap?.totalProgrammeCredits || 0} Total Credits)
            </p>
          </div>

          <button
            id="courses-switch-to-terms-btn"
            onClick={() => setViewMode('term')}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Switch to Semester Cards</span>
          </button>
        </div>

        {/* Programme Overview Summary Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duration</span>
            <p className="text-base sm:text-lg font-extrabold text-white mt-0.5">{durationYears} Years</p>
          </div>
          <div className="border-l border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Courses</span>
            <p className="text-base sm:text-lg font-extrabold text-sky-400 mt-0.5">
              {curriculumRoadmap?.totalCoursesCount || 0}
            </p>
          </div>
          <div className="border-l border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Credits</span>
            <p className="text-base sm:text-lg font-extrabold text-emerald-400 mt-0.5">
              {curriculumRoadmap?.totalProgrammeCredits || 0} CU
            </p>
          </div>
          <div className="border-l border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Catalogue Status</span>
            <p className="text-xs sm:text-sm font-bold text-blue-300 mt-1 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              Verified
            </p>
          </div>
        </div>

        {/* Multi-Year Academic Structure */}
        <div className="space-y-6">
          {availableYears.map((year) => {
            const yearTerms = curriculumRoadmap?.terms.filter((t) => t.yearOfStudy === year) || [];

            return (
              <div key={year} className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-800/90">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-sky-400 font-extrabold text-xs flex items-center justify-center border border-blue-500/30">
                    Y{year}
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    YEAR {year} CURRICULUM
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[1, 2].map((sem) => {
                    const termData = yearTerms.find((t) => t.semester === sem);
                    const coursesList = termData?.courses || [];
                    const semCredits = termData?.totalCredits || 0;

                    return (
                      <div
                        key={sem}
                        className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-blue-500/15 text-sky-300 border border-blue-500/25">
                              Semester {sem}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {coursesList.length} Courses
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-300">
                            {semCredits} Credits
                          </span>
                        </div>

                        {/* Courses Table / List for this semester */}
                        {coursesList.length > 0 ? (
                          <div className="space-y-1.5 divide-y divide-slate-800/50">
                            {coursesList.map((course) => (
                              <div
                                key={course.id}
                                onClick={() => setInspectingCourse(course)}
                                className="pt-1.5 first:pt-0 flex items-center justify-between gap-3 text-xs hover:bg-slate-800/40 p-1.5 rounded-lg transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono font-bold text-sky-400 shrink-0">
                                    {course.courseCode || course.code}
                                  </span>
                                  <span className="text-slate-200 truncate group-hover:text-sky-300 transition-colors">
                                    {course.courseName || course.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                      (course.courseType || course.status) === 'Core'
                                        ? 'bg-blue-500/20 text-sky-300'
                                        : 'bg-amber-500/20 text-amber-300'
                                    }`}
                                  >
                                    {course.courseType || course.status || 'Core'}
                                  </span>
                                  <span className="font-semibold text-slate-400">
                                    {course.credits} CU
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-6 text-center text-slate-500 text-xs">
                            No courses currently indexed for Year {year} Semester {sem}.
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setSelectedYear(year);
                            setSelectedSemester(sem);
                            setViewMode('term');
                          }}
                          className="w-full mt-2 py-1.5 rounded-xl bg-slate-800/60 hover:bg-blue-600 hover:text-white text-slate-300 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Open Detailed Coursework</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Course Details (Requirement 10) */}
        {inspectingCourse && renderCourseDetailModal(inspectingCourse)}
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAGE 1: Academic Year Selection
  // -------------------------------------------------------------
  if (selectedYear === null) {
    return (
      <div className="p-4 sm:p-6 space-y-6 pb-28">
        {/* Header & Degree Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <School className="w-3 h-3" />
                {profile?.university || 'VENUE Academic Space'}
              </span>
              {profile?.college && (
                <>
                  <span className="text-slate-600 text-xs">•</span>
                  <span className="text-[11px] text-slate-400 font-medium">{profile.college}</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {profile?.programme || profile?.programmeName || 'Degree Curriculum'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Select your academic year to view the official course units, syllabus credits, and learning modules.
            </p>
          </div>

          <button
            id="courses-view-roadmap-btn"
            onClick={() => setViewMode('roadmap')}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-blue-600/15 border border-blue-500/30 text-sky-300 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Degree Roadmap</span>
          </button>
        </div>

        {/* Section Title */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Select Academic Year ({durationYears} Years Total)</span>
          </div>
          <p className="text-xs text-slate-500">Choose a study year to access semester coursework:</p>
        </div>

        {/* Year Cards Grid - Dynamically supports any programme duration */}
        <div className="grid grid-cols-1 gap-3.5">
          {availableYears.map((year) => {
            const yearTerms = curriculumRoadmap?.terms.filter((t) => t.yearOfStudy === year) || [];
            const sem1Courses = yearTerms.find((t) => t.semester === 1)?.courses || [];
            const sem2Courses = yearTerms.find((t) => t.semester === 2)?.courses || [];
            const totalYearCourses = sem1Courses.length + sem2Courses.length;
            const totalYearCredits =
              (yearTerms.find((t) => t.semester === 1)?.totalCredits || 0) +
              (yearTerms.find((t) => t.semester === 2)?.totalCredits || 0);

            const coreCount =
              sem1Courses.filter((c) => (c.courseType || c.status) === 'Core').length +
              sem2Courses.filter((c) => (c.courseType || c.status) === 'Core').length;
            const electiveCount = totalYearCourses - coreCount;

            return (
              <button
                key={year}
                id={`courses-year-${year}-card`}
                onClick={() => {
                  setSelectedYear(year);
                  setSelectedSemester(null);
                }}
                className="w-full text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-blue-950/20 hover:from-slate-850 hover:to-blue-900/30 border border-slate-800/90 hover:border-blue-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform shrink-0">
                      Y{year}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                          Year {year}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/15 text-sky-400 border border-blue-500/25">
                          {totalYearCourses > 0 ? `${totalYearCourses} Courses` : 'Curriculum Available'}
                        </span>
                        {totalYearCredits > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            {totalYearCredits} Credits
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Semester 1 ({sem1Courses.length}) • Semester 2 ({sem2Courses.length})
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {coreCount > 0 ? `${coreCount} Core Units` : 'Official Curriculum'}
                        {electiveCount > 0 && ` • ${electiveCount} Electives`}
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/60 text-slate-400 group-hover:text-sky-400 group-hover:bg-blue-600/20 transition-colors shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Programme Information Banner */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-200 font-semibold">Degree Structure:</span> {durationYears}-Year{' '}
            {profile?.programme || profile?.programmeName || 'Degree Programme'} at{' '}
            {profile?.university || 'the University'}
            {profile?.college ? `, ${profile.college}` : ''}.
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAGE 2: Semester Selection for Chosen Year
  // -------------------------------------------------------------
  if (selectedSemester === null) {
    const yearTerms = curriculumRoadmap?.terms.filter((t) => t.yearOfStudy === selectedYear) || [];

    return (
      <div className="p-4 sm:p-6 space-y-6 pb-28">
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex items-center justify-between gap-3">
          <button
            id="courses-back-to-years-btn"
            onClick={handleBackToYears}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Back to Academic Years</span>
          </button>

          <span className="text-xs font-bold text-sky-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
            Year {selectedYear}
          </span>
        </div>

        {/* Header Information */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-sky-400 uppercase tracking-wider">
              Year {selectedYear} Curriculum
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] text-slate-400 font-medium">
              {profile?.programmeShort || profile?.programme || 'Degree'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            YEAR {selectedYear}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose a semester to view the complete list of courses, credits, and syllabus details:
          </p>
        </div>

        {/* Semester Selection Cards */}
        <div className="space-y-3.5">
          {[1, 2].map((sem) => {
            const termData = yearTerms.find((t) => t.semester === sem);
            const semCourses = termData?.courses || [];
            const totalCredits = termData?.totalCredits || 0;
            const coreCount = termData?.coreCount || 0;
            const electiveCount = termData?.electiveCount || 0;

            return (
              <button
                key={sem}
                id={`courses-select-sem-${sem}-btn`}
                onClick={() => setSelectedSemester(sem)}
                className="w-full text-left p-5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-blue-950/30 hover:from-slate-850 hover:to-blue-900/40 border border-slate-800/90 hover:border-sky-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-blue-500/10 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-sky-400 font-extrabold flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                        S{sem}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                          Semester {sem}
                        </h3>
                        <p className="text-xs font-semibold text-sky-400">
                          {semCourses.length > 0 ? `${semCourses.length} Courses Available` : 'View Course List'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
                      {totalCredits > 0 && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 font-medium text-slate-300">
                          {totalCredits} Total Credits
                        </span>
                      )}
                      {coreCount > 0 && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-medium">
                          {coreCount} Core Courses
                        </span>
                      )}
                      {electiveCount > 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium">
                          {electiveCount} Electives
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 text-slate-400 group-hover:text-sky-400 group-hover:bg-blue-600/20 transition-colors shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAGE 3: Selected Semester Course List
  // -------------------------------------------------------------
  const filteredCourses = termCourses.filter((c) => {
    const code = c.courseCode || c.code;
    const title = c.courseName || c.title;
    const matchesSearch =
      code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase());

    const cType = c.courseType || c.status || 'Core';
    const matchesType = selectedType === 'all' || cType === selectedType;

    return matchesSearch && matchesType;
  });

  const totalTermCredits = termCourses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  const coreCount = termCourses.filter((c) => (c.courseType || c.status) === 'Core').length;
  const electiveCount = termCourses.filter((c) => (c.courseType || c.status) === 'Elective').length;

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-28">
      {/* Navigation Header / Back to Semesters */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="courses-back-to-semesters-btn"
          onClick={handleBackToSemesters}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Back to Semesters</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={handleBackToYears}
            className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
          >
            Year {selectedYear}
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-sky-400 font-bold">Semester {selectedSemester}</span>
        </div>
      </div>

      {/* Header & Context */}
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-sky-400 uppercase tracking-wider">
            Year {selectedYear} • Semester {selectedSemester}
          </span>
          <span className="text-slate-600 text-xs">•</span>
          <span className="text-[11px] text-slate-400 font-medium">
            {profile?.college || profile?.universityShort || 'Official Curriculum'}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {profile?.programme || profile?.programmeName || 'Degree Programme'}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Showing official curriculum courses for Year {selectedYear}, Semester {selectedSemester} ({termCourses.length} Courses)
        </p>
      </div>

      {/* Semester Load Summary Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-slate-400 font-medium">Courses</p>
          <p className="text-base sm:text-lg font-bold text-white mt-0.5">
            {isLoading ? '...' : termCourses.length}
          </p>
        </div>
        <div className="border-x border-slate-800">
          <p className="text-[10px] text-slate-400 font-medium">Total Credits</p>
          <p className="text-base sm:text-lg font-bold text-sky-400 mt-0.5">
            {isLoading ? '...' : `${totalTermCredits} CU`}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium">Breakdown</p>
          <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
            <span className="text-blue-400 font-bold">{coreCount}</span> Core
            {electiveCount > 0 && (
              <>
                {' '}• <span className="text-amber-400 font-bold">{electiveCount}</span> Elec
              </>
            )}
          </p>
        </div>
      </div>

      {/* Search Input & Course Type Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="courses-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search Year ${selectedYear} Semester ${selectedSemester} courses...`}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            id="courses-filter-all"
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedType === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All ({termCourses.length})
          </button>
          <button
            id="courses-filter-core"
            onClick={() => setSelectedType('Core')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedType === 'Core'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Core Only ({coreCount})
          </button>
          {electiveCount > 0 && (
            <button
              id="courses-filter-elective"
              onClick={() => setSelectedType('Elective')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedType === 'Elective'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Electives ({electiveCount})
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse space-y-2">
              <div className="h-4 w-24 bg-slate-800 rounded" />
              <div className="h-5 w-48 bg-slate-800 rounded" />
              <div className="h-3 w-32 bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Course Cards List */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredCourses.map((course) => {
            const code = course.courseCode || course.code;
            const title = course.courseName || course.title;
            const cType = course.courseType || course.status || 'Core';
            const credits = Number(course.credits) || 12;

            return (
              <div
                key={course.id}
                id={`course-card-${course.id}`}
                onClick={() => setInspectingCourse(course)}
                className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/90 hover:border-blue-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-blue-500/15 text-sky-400 border border-blue-500/25">
                        {code}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          cType === 'Core'
                            ? 'bg-blue-500/20 text-sky-300 border border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {cType}
                      </span>

                      <span className="text-[11px] text-slate-400 font-semibold">
                        {credits} Credits
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                      {title}
                    </h3>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{course.departmentId || profile?.department || 'Academic Department'}</span>
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-800/60 text-slate-400 group-hover:text-sky-400 group-hover:bg-blue-600/20 transition-colors shrink-0 self-start">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-400">
                    <CheckCircle2 className="w-3 h-3 text-sky-400" />
                    Verified Prospectus Curriculum
                  </span>
                  <span className="text-sky-400 font-medium group-hover:underline">
                    View Course Details
                  </span>
                </div>
              </div>
            );
          })}

          {/* Empty State when no courses match filter */}
          {filteredCourses.length === 0 && termCourses.length > 0 && (
            <div className="text-center py-12 text-slate-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">
                No courses found matching "{searchQuery}" in Year {selectedYear} Semester {selectedSemester}.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
                className="mt-2 text-sky-400 hover:underline text-xs font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Empty State: Programme or Term has no courses yet (Requirement 15) */}
          {termCourses.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200">
                  No Courses Indexed for Year {selectedYear} Semester {selectedSemester}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  The official course catalogue for this specific semester is currently being verified against the university prospectus. You can still record your grades and manage custom courses directly in the GPA screen.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={handleBackToSemesters}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition-all"
                >
                  Choose Another Semester
                </button>
                <button
                  onClick={() => setViewMode('roadmap')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-all"
                >
                  View Full Roadmap
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Course Details (Requirement 10) */}
      {inspectingCourse && renderCourseDetailModal(inspectingCourse)}
    </div>
  );

  // -------------------------------------------------------------
  // HELPER: Render Clean Course Detail Modal (Requirement 10)
  // Shows only basic official information: code, title, credits,
  // course type, programme, year, semester, department.
  // Strictly no fake lecturer names, notes, past papers, or descriptions!
  // -------------------------------------------------------------
  function renderCourseDetailModal(course: CourseRecord) {
    const code = course.courseCode || course.code;
    const title = course.courseName || course.title;
    const cType = course.courseType || course.status || 'Core';
    const credits = Number(course.credits) || 12;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl animate-fadeIn relative">
          {/* Close button */}
          <button
            id="close-course-modal-btn"
            onClick={() => setInspectingCourse(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-blue-500/20 text-sky-400 border border-blue-500/30">
                {code}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  cType === 'Core'
                    ? 'bg-blue-500/20 text-sky-300 border border-blue-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {cType}
              </span>
              <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                {credits} Credits
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
              {title}
            </h2>
          </div>

          {/* Official Course Metadata Grid (Requirement 10) */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Year of Study</span>
              <span className="font-bold text-white mt-0.5 block">Year {course.yearOfStudy}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Semester</span>
              <span className="font-bold text-sky-400 mt-0.5 block">Semester {course.semester}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Course Classification</span>
              <span className="font-bold text-white mt-0.5 block">{cType} Course</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Academic Credits</span>
              <span className="font-bold text-emerald-400 mt-0.5 block">{credits} Credit Units</span>
            </div>
          </div>

          {/* Degree Programme & Department Details */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-400 font-medium">Degree Programme:</span>
              <span className="text-white font-semibold text-right">
                {profile?.programme || course.programmeId}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-400 font-medium">Department:</span>
              <span className="text-slate-200 text-right">
                {course.departmentId || profile?.department || 'Academic Department'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-400 font-medium">Academic Unit:</span>
              <span className="text-slate-200 text-right">
                {profile?.college || 'Faculty / College'}
              </span>
            </div>
          </div>

          {/* Source & Verification Note */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-sky-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Official Curriculum Record</p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {course.source || 'Audited against the University Undergraduate Prospectus (Official Source of Truth).'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setInspectingCourse(null)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                const selected = inspectingCourse;
                setInspectingCourse(null);
                handleSelectCourseRecord(selected);
              }}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <span>Open Course Space</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
};
