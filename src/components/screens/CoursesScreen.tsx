import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  ChevronRight,
  User,
  Calendar,
  Layers,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';
import { Course, StudentProfile } from '../../types';

interface CoursesScreenProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onBackToHome?: () => void;
  profile?: StudentProfile;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({
  courses,
  onSelectCourse,
  onBackToHome,
  profile,
}) => {
  // Navigation Hierarchy:
  // selectedYear = null -> Stage 1: Select Academic Year (Year 1, Year 2, Year 3)
  // selectedSemester = null -> Stage 2: Select Semester (Semester 1, Semester 2)
  // selectedYear && selectedSemester -> Stage 3: Course List for the selected semester
  const [selectedYear, setSelectedYear] = useState<1 | 2 | 3 | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2 | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'Core' | 'Elective'>('all');

  // Helper functions for back navigation
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

  // -------------------------------------------------------------
  // STAGE 1: Academic Year Selection
  // -------------------------------------------------------------
  if (selectedYear === null) {
    return (
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        {/* Header & Degree Context */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-sky-400 uppercase tracking-wider">
              {profile?.university || 'Academic Curriculum'}
            </span>
            {profile?.college && (
              <>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-[11px] text-slate-400 font-medium">{profile.college}</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {profile?.programme || 'BSc Mathematics & Statistics'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Select your academic year to view the official curriculum, course modules, and past examination papers.
          </p>
        </div>

        {/* Section Title */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Select Academic Year</span>
          </div>
          <p className="text-xs text-slate-500">Choose a study year to access semester coursework:</p>
        </div>

        {/* Year Cards Grid */}
        <div className="grid grid-cols-1 gap-3.5">
          {([1, 2, 3] as const).map((year) => {
            const yearCourses = courses.filter((c) => c.year === year);
            const sem1Count = yearCourses.filter((c) => c.semester === 1).length;
            const sem2Count = yearCourses.filter((c) => c.semester === 2).length;
            const coreCount = yearCourses.filter((c) => c.type === 'Core').length;
            const electiveCount = yearCourses.filter((c) => c.type === 'Elective').length;

            return (
              <button
                key={year}
                id={`courses-year-${year}-card`}
                onClick={() => {
                  setSelectedYear(year);
                  setSelectedSemester(null); // Explicitly ensure no semester is pre-selected
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
                          {yearCourses.length} Courses
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Semester 1 ({sem1Count}) • Semester 2 ({sem2Count})
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {coreCount} Core Units • {electiveCount > 0 ? `${electiveCount} Electives` : 'All Core'}
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

        {/* Programme Information Banner */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-200 font-semibold">Degree Structure:</span> 3-Year Bachelor of Science in Mathematics and Statistics at the University of Dar es Salaam, College of Natural and Applied Sciences (CoNAS).
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAGE 2: Semester Selection for Chosen Year
  // -------------------------------------------------------------
  if (selectedSemester === null) {
    const yearCourses = courses.filter((c) => c.year === selectedYear);

    return (
      <div className="p-4 sm:p-6 space-y-6 pb-24">
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
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-sky-400 uppercase tracking-wider">
              Year {selectedYear} Curriculum
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] text-slate-400 font-medium">BSc Math & Stats</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            YEAR {selectedYear}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose a semester to view the complete list of courses and learning materials:
          </p>
        </div>

        {/* Semester Selection Cards */}
        <div className="space-y-3.5">
          {([1, 2] as const).map((sem) => {
            const semCourses = yearCourses.filter((c) => c.semester === sem);
            const totalCredits = semCourses.reduce((sum, c) => sum + c.credits, 0);
            const coreCount = semCourses.filter((c) => c.type === 'Core').length;
            const electiveCount = semCourses.filter((c) => c.type === 'Elective').length;

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
                          {semCourses.length} Courses Available
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 font-medium text-slate-300">
                        {totalCredits} Total Credits
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-medium">
                        {coreCount} Core Courses
                      </span>
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
  const semesterCourses = courses.filter(
    (c) => c.year === selectedYear && c.semester === selectedSemester
  );

  const filteredCourses = semesterCourses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || c.type === selectedType;

    return matchesSearch && matchesType;
  });

  const totalCredits = semesterCourses.reduce((acc, curr) => acc + curr.credits, 0);
  const coreCount = semesterCourses.filter((c) => c.type === 'Core').length;
  const electiveCount = semesterCourses.filter((c) => c.type === 'Elective').length;

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
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
            {profile?.college || profile?.universityShort || 'Curriculum Modules'}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {profile?.programme || 'BSc Mathematics & Statistics'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Showing official curriculum for Year {selectedYear}, Semester {selectedSemester} ({semesterCourses.length} Courses)
        </p>
      </div>

      {/* Semester Load Summary Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-slate-400 font-medium">Courses</p>
          <p className="text-base sm:text-lg font-bold text-white mt-0.5">
            {semesterCourses.length}
          </p>
        </div>
        <div className="border-x border-slate-800">
          <p className="text-[10px] text-slate-400 font-medium">Total Credits</p>
          <p className="text-base sm:text-lg font-bold text-sky-400 mt-0.5">
            {totalCredits} CU
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
            All ({semesterCourses.length})
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

      {/* Courses List */}
      <div className="space-y-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            id={`course-card-${course.id}`}
            onClick={() => onSelectCourse(course)}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/90 hover:border-blue-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span
                    className="text-xs font-extrabold px-2.5 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${course.accentColor}20`,
                      color: course.accentColor,
                    }}
                  >
                    {course.code}
                  </span>

                  {course.type && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        course.type === 'Core'
                          ? 'bg-blue-500/20 text-sky-300 border border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {course.type}
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400">
                    {course.credits} Credits • Grade: {course.gradeTarget}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{course.instructor.name}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] text-slate-500">{course.instructor.office}</span>
                </p>
              </div>

              <div className="p-2 rounded-lg bg-slate-800/60 text-slate-400 group-hover:text-sky-400 group-hover:bg-blue-600/20 transition-colors shrink-0 self-start">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
              {course.overview}
            </p>

            {/* Bottom Progress Bar & Materials Pill */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Syllabus Coverage</span>
                  <span className="font-semibold text-slate-200">{course.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${course.progress}%`,
                      backgroundColor: course.accentColor,
                    }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-400 shrink-0 font-medium px-2 py-1 rounded bg-slate-950 border border-slate-800">
                {course.materials.length} files • {course.pastPapersCount} past papers
              </div>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">
              No courses found matching your filter in Year {selectedYear} Semester {selectedSemester}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
