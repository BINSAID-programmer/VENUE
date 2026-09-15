import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Building,
  School,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  AlertCircle,
  Hash,
  Layers,
} from 'lucide-react';
import {
  StudentProfile,
  StudentResult,
  UniversityGradingSystem,
  CumulativeGpaSummary,
  CourseRecord,
} from '../../types';
import {
  getStudentResults,
  saveStudentResult,
  deleteStudentResult,
  syncStudentProfileGpa,
  getAuthenticatedUid,
  calculateQualityPoints,
  calculateSemesterGPA,
  calculateCGPA,
} from '../../services/gpaService';
import {
  getGradingSystem,
  isValidGrade,
} from '../../services/gradingService';
import { courseCurriculumService } from '../../services/courseCurriculumService';

interface GPAScreenProps {
  profile: StudentProfile;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
  onBack: () => void;
}

const ACADEMIC_YEARS = [
  '2025/2026',
  '2024/2025',
  '2023/2024',
  '2022/2023',
  '2021/2022',
];

export const GPAScreen: React.FC<GPAScreenProps> = ({
  profile,
  onUpdateProfile,
  onBack,
}) => {
  // Results & Loading state
  const [results, setResults] = useState<StudentResult[]>([]);
  const [catalogueCourses, setCatalogueCourses] = useState<CourseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Active Semester Filter (defaults to student's current year and semester)
  const defaultYearNum = useMemo(() => {
    const match = String(profile.yearOfStudy || '1').match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }, [profile.yearOfStudy]);

  const defaultSemNum = useMemo(() => {
    const match = String(profile.semester || '1').match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }, [profile.semester]);

  const [selectedYear, setSelectedYear] = useState<number>(defaultYearNum);
  const [selectedSemester, setSelectedSemester] = useState<number>(defaultSemNum);
  const [academicYear, setAcademicYear] = useState<string>(
    profile.academicYear || '2025/2026'
  );

  // Dynamic Programme Duration (Supports variable 1..6 year programmes)
  const durationYears = useMemo(() => {
    return profile.programmeDurationYears || 3;
  }, [profile.programmeDurationYears]);

  const availableYears = useMemo(() => {
    return Array.from({ length: Math.max(1, durationYears) }, (_, i) => i + 1);
  }, [durationYears]);

  // Active University Grading System
  const gradingSystem: UniversityGradingSystem = useMemo(() => {
    return getGradingSystem(profile.universityId || profile.university);
  }, [profile.universityId, profile.university]);

  // Modal States
  const [editingResultModal, setEditingResultModal] = useState<{
    courseId: string;
    courseCode: string;
    courseName: string;
    credits: number;
    currentGrade?: string;
    isCustom?: boolean;
    isRepeated?: boolean;
  } | null>(null);

  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [customCourseCode, setCustomCourseCode] = useState('');
  const [customCourseName, setCustomCourseName] = useState('');
  const [customCredits, setCustomCredits] = useState('12');
  const [customGrade, setCustomGrade] = useState('A');
  const [customIsRepeated, setCustomIsRepeated] = useState(false);

  const [showGradingScaleRef, setShowGradingScaleRef] = useState(false);

  // 1. Load Student Results from Firestore / Cache
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const studentUid = getAuthenticatedUid(profile.uid);
        const storedResults = await getStudentResults(studentUid);
        if (isMounted) {
          setResults(storedResults);
        }
      } catch (err) {
        console.warn('Error loading student results:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [profile.uid]);

  // 2. Fetch Catalogue Courses for the selected Year & Semester
  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      try {
        const progId =
          profile.programmeId ||
          profile.programmeShort?.toLowerCase() ||
          'math-stats';
        const res = await courseCurriculumService.getCoursesByProgrammeAndTerm({
          programmeId: progId,
          yearOfStudy: selectedYear,
          semester: selectedSemester,
          universityId: profile.universityId,
        });
        if (isMounted) {
          setCatalogueCourses(res.courses);
        }
      } catch (err) {
        console.warn('Error fetching catalogue courses:', err);
      }
    };
    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, [profile.programmeId, profile.programmeShort, selectedYear, selectedSemester, profile.universityId]);

  // 3. Compute Real GPA & Cumulative Metrics using calculation engine
  const gpaSummary: CumulativeGpaSummary = useMemo(() => {
    const semStr = `Semester ${selectedSemester}`;
    return calculateCGPA(
      results,
      profile.universityId || profile.university,
      semStr,
      academicYear
    );
  }, [results, profile.universityId, profile.university, selectedSemester, academicYear]);

  // Selected semester labels for display
  const currentSemesterLabel = `Semester ${selectedSemester}`;
  const currentYearLabel = `Year ${selectedYear}`;

  // Find semester-specific GPA summary
  const currentSemesterSummary = useMemo(() => {
    return gpaSummary.semesters.find(
      (s) =>
        s.semester.toLowerCase() === currentSemesterLabel.toLowerCase() &&
        (!s.yearOfStudy || s.yearOfStudy.toLowerCase() === currentYearLabel.toLowerCase())
    );
  }, [gpaSummary.semesters, currentSemesterLabel, currentYearLabel]);

  // Merge catalogue courses with student's recorded results for this semester
  // Course database is the SINGLE SOURCE OF TRUTH for credits.
  const semesterCourseItems = useMemo(() => {
    const semName = `Semester ${selectedSemester}`;
    const relevantResults = results.filter((r) => {
      const semMatches =
        r.semester.toLowerCase() === semName.toLowerCase() ||
        r.semester === String(selectedSemester);
      const yearMatches =
        !r.yearOfStudy ||
        r.yearOfStudy.toLowerCase() === currentYearLabel.toLowerCase() ||
        r.yearOfStudy === String(selectedYear);
      return semMatches && yearMatches;
    });

    // Map catalogue courses
    const list = catalogueCourses.map((catCourse) => {
      const code = catCourse.courseCode || catCourse.code;
      const title = catCourse.courseName || catCourse.title;
      const cId = catCourse.courseId || catCourse.id;
      // Credits strictly derived from course database
      const credits = Number(catCourse.credits) > 0 ? Number(catCourse.credits) : 12;

      const foundResult = relevantResults.find(
        (r) =>
          r.courseId === cId ||
          r.courseCode.toLowerCase().replace(/\s+/g, '') ===
            code.toLowerCase().replace(/\s+/g, '')
      );

      return {
        courseId: cId,
        courseCode: code,
        courseName: title,
        credits: foundResult ? foundResult.credits : credits,
        status: catCourse.status || 'Core',
        result: foundResult || null,
        isCustom: false,
      };
    });

    // Also include any custom / elective courses entered by the student not in catalogue
    relevantResults.forEach((res) => {
      const alreadyIncluded = list.some(
        (item) =>
          item.courseId === res.courseId ||
          item.courseCode.toLowerCase().replace(/\s+/g, '') ===
            res.courseCode.toLowerCase().replace(/\s+/g, '')
      );
      if (!alreadyIncluded) {
        list.push({
          courseId: res.courseId,
          courseCode: res.courseCode,
          courseName: res.courseName,
          credits: res.credits,
          status: 'Elective',
          result: res,
          isCustom: true,
        });
      }
    });

    return list;
  }, [catalogueCourses, results, selectedSemester, selectedYear, currentYearLabel]);

  // Handle saving a grade
  const handleSelectGrade = async (grade: string) => {
    if (!editingResultModal) return;
    setIsSaving(true);
    setStatusMessage('Saving result...');

    try {
      const studentUid = getAuthenticatedUid(profile.uid);
      const semStr = `Semester ${selectedSemester}`;
      const yearStr = `Year ${selectedYear}`;

      const { allResults } = await saveStudentResult(
        {
          courseId: editingResultModal.courseId,
          courseCode: editingResultModal.courseCode,
          courseName: editingResultModal.courseName,
          credits: editingResultModal.credits,
          grade,
          semester: semStr,
          academicYear,
          yearOfStudy: yearStr,
          universityId: profile.universityId || profile.university,
          programmeId: profile.programmeId || profile.programmeShort,
          isRepeated: editingResultModal.isRepeated,
        },
        studentUid
      );

      setResults(allResults);

      // Recalculate and synchronize profile GPA
      const { updatedProfile, summary } = await syncStudentProfileGpa(
        profile,
        allResults
      );
      onUpdateProfile({
        gpa: updatedProfile.gpa,
        gpaMax: updatedProfile.gpaMax,
        creditsCompleted: updatedProfile.creditsCompleted,
      });

      setStatusMessage(`Saved! Cumulative CGPA: ${summary.cgpa.toFixed(2)} / ${summary.maxGpa.toFixed(1)}`);
      setTimeout(() => setStatusMessage(null), 3500);
      setEditingResultModal(null);
    } catch (err: any) {
      setStatusMessage(`Error saving result: ${err?.message || 'Please try again'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle removing a result
  const handleRemoveResult = async (resultId: string) => {
    if (!confirm('Are you sure you want to remove this grade result?')) return;
    setIsSaving(true);
    setStatusMessage('Removing result...');

    try {
      const studentUid = getAuthenticatedUid(profile.uid);
      const updatedList = await deleteStudentResult(resultId, studentUid);
      setResults(updatedList);

      const { updatedProfile, summary } = await syncStudentProfileGpa(
        profile,
        updatedList
      );
      onUpdateProfile({
        gpa: updatedProfile.gpa,
        gpaMax: updatedProfile.gpaMax,
        creditsCompleted: updatedProfile.creditsCompleted,
      });

      setStatusMessage(`Result removed. Updated CGPA: ${summary.cgpa.toFixed(2)}`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage(`Error removing result: ${err?.message || 'Failed'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle adding custom/elective course
  const handleAddCustomCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCourseCode.trim() || !customCourseName.trim()) return;

    setIsSaving(true);
    setStatusMessage('Adding course result...');

    try {
      const studentUid = getAuthenticatedUid(profile.uid);
      const semStr = `Semester ${selectedSemester}`;
      const yearStr = `Year ${selectedYear}`;
      const cId = `custom_${customCourseCode.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;

      const { allResults } = await saveStudentResult(
        {
          courseId: cId,
          courseCode: customCourseCode.trim(),
          courseName: customCourseName.trim(),
          credits: Math.max(1, Number(customCredits) || 12),
          grade: customGrade,
          semester: semStr,
          academicYear,
          yearOfStudy: yearStr,
          universityId: profile.universityId || profile.university,
          programmeId: profile.programmeId || profile.programmeShort,
          isRepeated: customIsRepeated,
        },
        studentUid
      );

      setResults(allResults);

      const { updatedProfile, summary } = await syncStudentProfileGpa(
        profile,
        allResults
      );
      onUpdateProfile({
        gpa: updatedProfile.gpa,
        gpaMax: updatedProfile.gpaMax,
        creditsCompleted: updatedProfile.creditsCompleted,
      });

      setIsAddCustomOpen(false);
      setCustomCourseCode('');
      setCustomCourseName('');
      setCustomIsRepeated(false);
      setStatusMessage(`Course added! CGPA: ${summary.cgpa.toFixed(2)}`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage(`Error adding course: ${err?.message || 'Failed'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Registered total credits for this semester (from curriculum list)
  const totalRegisteredSemesterCredits = useMemo(() => {
    return semesterCourseItems.reduce((sum, item) => sum + item.credits, 0);
  }, [semesterCourseItems]);

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28 max-w-5xl mx-auto">
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer text-xs font-semibold active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <School className="w-3.5 h-3.5" />
            {profile.universityShort || profile.university || 'University'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            {gradingSystem.scaleType} Grading Scale
          </span>
        </div>
      </div>

      {/* Degree Context Banner */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            {profile.institutionName || profile.college || 'Academic Unit'}
          </span>
          <span className="text-slate-600 text-xs">•</span>
          <span className="text-xs text-slate-400 font-medium">
            {profile.departmentName || profile.department || 'Department'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Academic GPA & Performance
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {profile.programmeName || profile.programme || 'Degree Programme'} • Official Database-Driven GPA & CGPA Engine
        </p>
      </div>

      {/* Status Toast Banner */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/40 text-sky-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Top Cumulative GPA Performance Dashboard */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          {/* Main Cumulative CGPA */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                Cumulative GPA (CGPA)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {gpaSummary.cgpa.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / {gpaSummary.maxGpa.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${gpaSummary.classification.badgeColor}`}
              >
                {gpaSummary.classification.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {gpaSummary.totalGradedCoursesCount} of {gpaSummary.totalCoursesCount} Graded
              </span>
            </div>
          </div>

          {/* Current / Selected Semester GPA */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {currentYearLabel} {currentSemesterLabel} GPA
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                {currentSemesterSummary && currentSemesterSummary.isGraded ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">
                      {currentSemesterSummary.gpa.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / {gpaSummary.maxGpa.toFixed(1)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-500 tracking-tight">
                    —
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
              <span>Graded Credits:</span>
              <span className="font-bold text-white">
                {currentSemesterSummary ? currentSemesterSummary.totalCredits : 0} / {totalRegisteredSemesterCredits}
              </span>
            </div>
          </div>

          {/* Degree Credits Completed */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                Total Credits Earned
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-sky-400 tracking-tight">
                  {gpaSummary.totalCredits}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / {profile.totalCredits || 120}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-850">
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (gpaSummary.totalCredits / (profile.totalCredits || 120)) * 100
                      )
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Quality Points: {gpaSummary.totalQualityPoints.toFixed(1)}</span>
                <span>
                  {Math.round(
                    (gpaSummary.totalCredits / (profile.totalCredits || 120)) * 100
                  )}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formula Explainer Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              Formula: <strong className="text-slate-300 font-mono">GPA = Σ(Quality Points) / Σ(Credits)</strong>. Missing grades are excluded.
            </span>
          </span>
          <button
            type="button"
            onClick={() => setShowGradingScaleRef(!showGradingScaleRef)}
            className="text-sky-400 hover:text-sky-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{showGradingScaleRef ? 'Hide' : 'View'} University Grading Scale</span>
            {showGradingScaleRef ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Collapsible University Grading Scale Reference */}
      {showGradingScaleRef && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-sky-400" />
              {gradingSystem.name}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Max: {gradingSystem.maxGpa.toFixed(1)} • Pass Threshold: {gradingSystem.passGpa.toFixed(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
            {gradingSystem.grades.map((g) => (
              <div
                key={g.grade}
                className={`p-2.5 rounded-xl border ${
                  g.isPass
                    ? 'bg-slate-950/70 border-slate-800'
                    : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                }`}
              >
                <span className="text-base font-extrabold text-white block">{g.grade}</span>
                <span className="text-xs font-bold text-sky-400 block mt-0.5">
                  {g.gradePoint.toFixed(1)} GP
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">{g.description}</span>
                {g.percentageRange && (
                  <span className="text-[9px] text-slate-500 block">{g.percentageRange}</span>
                )}
              </div>
            ))}
          </div>

          {/* Classification thresholds */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px]">
            {gradingSystem.classifications.map((c) => (
              <span
                key={c.name}
                className={`px-2.5 py-1 rounded-lg border font-medium ${c.badgeColor}`}
              >
                {c.name} ({c.minGpa.toFixed(1)} – {c.maxGpa.toFixed(1)})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. Academic Year & Semester Selector */}
      <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Academic Term & Semester
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
            {/* Academic Year Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Academic Year:</span>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {ACADEMIC_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Custom Course Button */}
            <button
              type="button"
              onClick={() => setIsAddCustomOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/30 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Course</span>
            </button>
          </div>
        </div>

        {/* Year & Semester Switcher Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/50">
          {availableYears.map((y) =>
            [1, 2].map((s) => {
              const isSelected = selectedYear === y && selectedSemester === s;
              const semStr = `Semester ${s}`;
              const yearStr = `Year ${y}`;
              const matchingSem = gpaSummary.semesters.find(
                (sum) =>
                  sum.semester.toLowerCase() === semStr.toLowerCase() &&
                  (!sum.yearOfStudy || sum.yearOfStudy.toLowerCase() === yearStr.toLowerCase())
              );

              return (
                <button
                  key={`y${y}-s${s}`}
                  type="button"
                  onClick={() => {
                    setSelectedYear(y);
                    setSelectedSemester(s);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                  }`}
                >
                  <span>Y{y} Sem {s}</span>
                  {matchingSem && matchingSem.isGraded && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isSelected ? 'bg-blue-800 text-sky-200' : 'bg-slate-800 text-amber-300'
                      }`}
                    >
                      {matchingSem.gpa.toFixed(2)}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Course Curriculum & Examination Results Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{currentYearLabel} • {currentSemesterLabel} Registered Courses</span>
              <span className="text-xs text-slate-400 font-normal">
                ({semesterCourseItems.length} courses)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Official courses from the curriculum. Credits are loaded directly from the course database.
            </p>
          </div>

          {currentSemesterSummary && currentSemesterSummary.isGraded && (
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-medium">Semester GPA</span>
              <p className="text-sm font-bold text-amber-400">
                {currentSemesterSummary.gpa.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Course Cards / Table */}
        {isLoading ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
            Loading student course results and academic curriculum...
          </div>
        ) : semesterCourseItems.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-300 font-medium">
              No courses configured for {currentYearLabel} {currentSemesterLabel}.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You can manually add custom elective or core courses to compute your GPA for this term.
            </p>
            <button
              type="button"
              onClick={() => setIsAddCustomOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course Result</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/80 rounded-xl border border-slate-850">
              <div className="col-span-2">Course Code</div>
              <div className="col-span-4">Course Name</div>
              <div className="col-span-1 text-center">Credits</div>
              <div className="col-span-2 text-center">Grade</div>
              <div className="col-span-1 text-center">Grade Point</div>
              <div className="col-span-1 text-center">Quality Pts</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Course Rows */}
            {semesterCourseItems.map((item) => {
              const res = item.result;
              const hasGrade = Boolean(res && res.grade && isValidGrade(res.grade, profile.universityId));
              const isPassing = res && hasGrade ? res.gradePoint >= gradingSystem.passGpa : false;
              const qp = res && hasGrade ? (res.qualityPoints !== undefined ? res.qualityPoints : calculateQualityPoints(res.credits, res.gradePoint)) : null;

              return (
                <div
                  key={item.courseId}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm"
                >
                  {/* Desktop Grid Layout */}
                  <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                    {/* Course Code & Badge */}
                    <div className="col-span-2 flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-sky-400">
                        {item.courseCode}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-850 text-slate-400">
                        {item.status}
                      </span>
                    </div>

                    {/* Course Name */}
                    <div className="col-span-4 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate" title={item.courseName}>
                        {item.courseName}
                      </p>
                      {res?.isRepeated && (
                        <span className="text-[9px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                          <Layers className="w-2.5 h-2.5" />
                          Repeated Attempt ({res.attemptNumber || 2})
                        </span>
                      )}
                    </div>

                    {/* Credits */}
                    <div className="col-span-1 text-center">
                      <span className="text-xs font-bold text-slate-200">
                        {item.credits}
                      </span>
                    </div>

                    {/* Grade */}
                    <div className="col-span-2 text-center">
                      {hasGrade ? (
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-md border ${
                            isPassing
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                              : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                          }`}
                        >
                          {res?.grade}
                          {isPassing ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 px-2 py-0.5 rounded-md border border-dashed border-slate-800 bg-slate-950">
                          <Clock className="w-2.5 h-2.5" />
                          Grade not entered
                        </span>
                      )}
                    </div>

                    {/* Grade Point */}
                    <div className="col-span-1 text-center font-mono text-xs">
                      {hasGrade ? (
                        <span className="font-bold text-slate-200">{res?.gradePoint.toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </div>

                    {/* Quality Points */}
                    <div className="col-span-1 text-center font-mono text-xs">
                      {hasGrade && qp !== null ? (
                        <span className="font-bold text-sky-400">{qp.toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </div>

                    {/* Action */}
                    <div className="col-span-1 flex items-center justify-end gap-1.5">
                      {hasGrade ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingResultModal({
                                courseId: item.courseId,
                                courseCode: item.courseCode,
                                courseName: item.courseName,
                                credits: item.credits,
                                currentGrade: res?.grade,
                                isCustom: item.isCustom,
                                isRepeated: res?.isRepeated,
                              })
                            }
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Grade"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {res?.id && (
                            <button
                              type="button"
                              onClick={() => handleRemoveResult(res.id!)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Clear Result"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingResultModal({
                              courseId: item.courseId,
                              courseCode: item.courseCode,
                              courseName: item.courseName,
                              credits: item.credits,
                              isCustom: item.isCustom,
                            })
                          }
                          className="px-2 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-sky-300 hover:text-white text-[11px] font-semibold cursor-pointer transition-all whitespace-nowrap"
                        >
                          Enter Grade
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile Card Layout */}
                  <div className="md:hidden flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-sky-400">
                            {item.courseCode}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            {item.credits} Credits
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-850 text-slate-400">
                            {item.status}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white mt-1.5 leading-snug">
                          {item.courseName}
                        </h3>
                      </div>

                      {hasGrade ? (
                        <div
                          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border font-black shrink-0 ${
                            isPassing
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                              : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                          }`}
                        >
                          <span className="text-sm leading-none">{res?.grade}</span>
                          <span className="text-[8px] font-semibold mt-0.5">
                            {res?.gradePoint.toFixed(1)} GP
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 px-2 py-1 rounded-md border border-dashed border-slate-800 bg-slate-950 shrink-0">
                          Grade not entered
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-850/80 text-xs">
                      {hasGrade ? (
                        <span className="text-slate-400 text-[11px]">
                          Quality Points: <strong className="text-sky-400">{qp?.toFixed(1)} pts</strong>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Quality Points: —</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        {hasGrade ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingResultModal({
                                  courseId: item.courseId,
                                  courseCode: item.courseCode,
                                  courseName: item.courseName,
                                  credits: item.credits,
                                  currentGrade: res?.grade,
                                  isCustom: item.isCustom,
                                  isRepeated: res?.isRepeated,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            {res?.id && (
                              <button
                                type="button"
                                onClick={() => handleRemoveResult(res.id!)}
                                className="p-1 rounded-lg bg-rose-500/10 text-rose-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingResultModal({
                                courseId: item.courseId,
                                courseCode: item.courseCode,
                                courseName: item.courseName,
                                credits: item.credits,
                                isCustom: item.isCustom,
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/30"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Enter Grade</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Semester-by-Semester Academic Breakdown Table */}
      {gpaSummary.semesters.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Semester Performance History
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Overall CGPA: <strong className="text-white">{gpaSummary.cgpa.toFixed(2)}</strong>
            </span>
          </div>

          <div className="space-y-2">
            {gpaSummary.semesters.map((sem) => (
              <div
                key={sem.key}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between text-xs gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {sem.yearOfStudy ? `${sem.yearOfStudy} • ` : ''}{sem.semester}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium font-mono">
                      {sem.academicYear}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sem.gradedCoursesCount} Graded ({sem.resultsCount} Total) • {sem.totalCredits} Credits • {sem.totalQualityPoints.toFixed(1)} Quality Pts
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Semester GPA</span>
                  <span className="text-sm font-extrabold text-amber-400">
                    {sem.isGraded ? sem.gpa.toFixed(2) : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Grade Selection Modal */}
      {editingResultModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {editingResultModal.courseCode}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {editingResultModal.credits} Credits
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {editingResultModal.courseName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Select official letter grade for {currentYearLabel} {currentSemesterLabel}:
              </p>
            </div>

            {/* University Grade Buttons Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {gradingSystem.grades.map((g) => {
                const isSelected = editingResultModal.currentGrade === g.grade;
                const calculatedQp = calculateQualityPoints(editingResultModal.credits, g.gradePoint);

                return (
                  <button
                    key={g.grade}
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSelectGrade(g.grade)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-500 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-950/80 hover:bg-slate-850 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black">{g.grade}</span>
                        <span className="text-xs font-bold text-sky-400">
                          {g.gradePoint.toFixed(1)} GP
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {calculatedQp.toFixed(1)} Quality Pts
                      </span>
                      {g.percentageRange && (
                        <span className="text-[9px] text-slate-500 block">
                          {g.percentageRange}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Repeated Course Checkbox */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingResultModal.isRepeated)}
                  onChange={(e) =>
                    setEditingResultModal({
                      ...editingResultModal,
                      isRepeated: e.target.checked,
                    })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span>This is a repeated course attempt</span>
              </label>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setEditingResultModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add Custom Course Modal */}
      {isAddCustomOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Custom Course Result</h3>
              <span className="text-xs text-slate-400">
                {currentYearLabel} {currentSemesterLabel}
              </span>
            </div>

            <form onSubmit={handleAddCustomCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Course Code (e.g. MT 100, ST 113, CS 174)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MT 100"
                  value={customCourseCode}
                  onChange={(e) => setCustomCourseCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Course Name / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Linear Algebra & Numerical Methods"
                  value={customCourseName}
                  onChange={(e) => setCustomCourseName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Credits (e.g. 12 or 3)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={customCredits}
                    onChange={(e) => setCustomCredits(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Letter Grade
                  </label>
                  <select
                    value={customGrade}
                    onChange={(e) => setCustomGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {gradingSystem.grades.map((g) => (
                      <option key={g.grade} value={g.grade}>
                        {g.grade} ({g.gradePoint.toFixed(1)} GP)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customIsRepeated}
                    onChange={(e) => setCustomIsRepeated(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                  />
                  <span>This is a repeated course attempt</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
