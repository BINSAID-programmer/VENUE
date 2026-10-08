import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Calendar,
  Award,
  GraduationCap,
  Briefcase,
  Building2,
  Users,
  Wallet,
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
  TrendingUp,
  FileText,
  HelpCircle,
  Layers,
  ChevronRight,
  Compass,
  Plus,
  Calculator,
  Megaphone,
  Brain,
  Check,
  Loader2,
} from 'lucide-react';
import {
  Course,
  StudentProfile,
  StudyTask,
  ExamCountdown,
  ScreenId,
  AnnouncementRecord,
} from '../../types';
import {
  studentDashboardService,
  StudentDashboardMetrics,
  StudentRecentActivityItem,
  formatRelativeActivityTime,
} from '../../services/studentDashboardService';
import { communityService } from '../../services/communityService';

interface HomeScreenProps {
  profile: StudentProfile;
  courses: Course[];
  todayTasks: StudyTask[];
  upcomingExams: ExamCountdown[];
  isLoadingCourses?: boolean;
  onNavigate: (screen: ScreenId) => void;
  onSelectCourse: (course: Course) => void;
  onToggleTask?: (taskId: string) => void;
  onAddTask?: (task: StudyTask) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  courses,
  todayTasks,
  upcomingExams,
  isLoadingCourses = false,
  onNavigate,
  onSelectCourse,
  onToggleTask,
  onAddTask,
}) => {
  const nextExam = upcomingExams && upcomingExams.length > 0 ? upcomingExams[0] : null;
  const pendingTasks = (todayTasks || []).filter((t) => !t.completed);
  const completedTasksCount = (todayTasks || []).filter((t) => t.completed).length;

  // Dynamic verified courses strictly matching currently authenticated student's profile:
  // university + programme + yearOfStudy + semester
  // VENUE MUST NEVER ASSUME THAT A USER IS A MATHEMATICS & STATISTICS STUDENT.
  const myCourses = useMemo(() => courses || [], [courses]);
  const pid = (profile?.programmeId || '').toLowerCase().trim();
  const isMissingCurriculum = pid.startsWith('bsc-ed-') && pid !== 'bsc-ed';

  // Real database-driven dashboard metrics, upcoming notices/events, and recent student activity
  const [metrics, setMetrics] = useState<StudentDashboardMetrics | null>(null);
  const [upcomingNotices, setUpcomingNotices] = useState<AnnouncementRecord[]>([]);
  const [recentActivities, setRecentActivities] = useState<StudentRecentActivityItem[]>([]);
  const [communitySummary, setCommunitySummary] = useState<{
    unreadMessagesCount: number;
    recentDiscussionsCount: number;
    unreadAnnouncementsCount: number;
  }>({
    unreadMessagesCount: 0,
    recentDiscussionsCount: 0,
    unreadAnnouncementsCount: 0,
  });
  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState<boolean>(true);

  // Quick inline task creation state for empty or active study plan
  const [showQuickTaskInput, setShowQuickTaskInput] = useState<boolean>(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState<string>('');
  const [quickTaskCourse, setQuickTaskCourse] = useState<string>('');
  const [quickTaskPriority, setQuickTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    if (myCourses.length > 0 && !quickTaskCourse) {
      setQuickTaskCourse(myCourses[0].code);
    }
  }, [myCourses, quickTaskCourse]);

  useEffect(() => {
    let isMounted = true;

    const loadRealDashboardData = async () => {
      setIsLoadingDashboardData(true);
      try {
        const [computedMetrics, notices, activities, commSummary] = await Promise.all([
          studentDashboardService.getDashboardMetrics(profile, myCourses, todayTasks || []),
          studentDashboardService.getUpcomingEventsAndNotices(profile, 3),
          studentDashboardService.getRecentActivities(profile.uid, 4),
          typeof communityService.getHomeCommunitySummary === 'function'
            ? communityService.getHomeCommunitySummary(profile, myCourses)
            : Promise.resolve({
                unreadMessagesCount: 0,
                recentDiscussionsCount: 0,
                unreadAnnouncementsCount: 0,
              }),
        ]);

        if (isMounted) {
          setMetrics(computedMetrics);
          setUpcomingNotices(notices);
          setRecentActivities(activities);
          setCommunitySummary(commSummary);
        }
      } catch (err) {
        console.warn('HomeScreen: Error loading real dashboard data:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDashboardData(false);
        }
      }
    };

    loadRealDashboardData();
    return () => {
      isMounted = false;
    };
  }, [
    profile.uid,
    profile.universityId,
    profile.academicUnitId,
    profile.departmentId,
    profile.programmeId,
    profile.yearOfStudy,
    profile.semester,
    myCourses,
    todayTasks,
  ]);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim() || !onAddTask) return;

    const newTask: StudyTask = {
      id: `task_${Date.now()}`,
      title: quickTaskTitle.trim(),
      courseCode: quickTaskCourse || myCourses[0]?.code || 'General',
      date: 'Today',
      timeSlot: 'Flexible',
      estimatedMinutes: 60,
      completed: false,
      priority: quickTaskPriority,
    };

    onAddTask(newTask);
    setQuickTaskTitle('');
    setShowQuickTaskInput(false);
  };

  // Real dynamic counts for feature tiles — never hardcoded fake values
  const quickFeatureTiles = useMemo(
    () => [
      {
        id: 'courses' as ScreenId,
        title: 'My Courses',
        count:
          myCourses.length > 0
            ? `${myCourses.length} Enrolled`
            : profile.programme
            ? 'View Curriculum'
            : 'Setup Required',
        icon: BookOpen,
        color: 'from-blue-600/20 to-sky-500/10 border-blue-500/30 text-blue-400',
      },
      {
        id: 'browse-materials' as ScreenId,
        title: 'Browse Materials',
        count: 'Explore All Years',
        icon: Compass,
        color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400',
      },
      {
        id: 'ai-tutor' as ScreenId,
        title: 'AI Tutor',
        count: 'Study, Solve & Practice',
        icon: Sparkles,
        color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30 text-sky-400',
        isGlowing: true,
      },
      {
        id: 'planner' as ScreenId,
        title: 'Study Planner',
        count:
          pendingTasks.length > 0
            ? `${pendingTasks.length} Due Today`
            : todayTasks.length > 0
            ? 'All Tasks Done'
            : 'Plan Schedule',
        icon: Calendar,
        color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      },
      {
        id: 'resources' as ScreenId,
        title: 'Resources',
        count:
          metrics && metrics.activeResourcesCount > 0
            ? `${metrics.activeResourcesCount} Available`
            : 'Notes & Handouts',
        icon: FileText,
        color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-sky-400',
      },
      {
        id: 'past-papers' as ScreenId,
        title: 'Past Papers',
        count:
          metrics && metrics.activePastPapersCount > 0
            ? `${metrics.activePastPapersCount} Papers`
            : 'Exam Archive',
        icon: FileText,
        color: 'from-indigo-600/20 to-blue-500/10 border-indigo-500/30 text-indigo-400',
      },
      {
        id: 'quiz' as ScreenId,
        title: 'Quizzes',
        count:
          metrics && metrics.completedQuizzesCount > 0
            ? `${metrics.completedQuizzesCount} Completed`
            : 'Practice & Test',
        icon: HelpCircle,
        color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
      },
      {
        id: 'flashcards' as ScreenId,
        title: 'Flashcards',
        count:
          metrics && metrics.savedFlashcardDecksCount > 0
            ? `${metrics.savedFlashcardDecksCount} Decks`
            : 'Study Decks',
        icon: Layers,
        color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
      },
      {
        id: 'gpa' as ScreenId,
        title: 'GPA Tracker',
        count:
          metrics?.hasGpaData && metrics.gpa !== null
            ? `CGPA: ${metrics.gpa.toFixed(2)}`
            : 'Calculate GPA',
        icon: Calculator,
        color: 'from-emerald-500/20 to-cyan-500/10 border-emerald-500/30 text-emerald-400',
      },
      {
        id: 'scholarships' as ScreenId,
        title: 'Scholarships',
        count: profile.programmeShort || profile.programme ? 'Matched Grants' : 'Opportunities',
        icon: Award,
        color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
      },
      {
        id: 'career' as ScreenId,
        title: 'Career Hub',
        count:
          profile.programmeShort || profile.programme
            ? `${profile.programmeShort || 'Degree'} Paths & AI`
            : 'Career Paths & AI',
        icon: Briefcase,
        color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
      },
      {
        id: 'university-hub' as ScreenId,
        title: 'University Hub',
        count:
          metrics && metrics.publishedNoticesCount > 0
            ? `${metrics.publishedNoticesCount} Official Notices`
            : profile.universityShort
            ? `${profile.universityShort} Hub`
            : 'Campus Notices',
        icon: Building2,
        color: 'from-blue-600/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
      },
      {
        id: 'community' as ScreenId,
        title: 'Community',
        count:
          communitySummary.unreadMessagesCount > 0
            ? `${communitySummary.unreadMessagesCount} Unread Chat${
                communitySummary.unreadMessagesCount === 1 ? '' : 's'
              }`
            : communitySummary.recentDiscussionsCount > 0
            ? `${communitySummary.recentDiscussionsCount} New Post${
                communitySummary.recentDiscussionsCount === 1 ? '' : 's'
              }`
            : profile.programmeShort || profile.universityShort
            ? `${profile.programmeShort || profile.universityShort} Forum`
            : 'Academic Forum',
        icon: Users,
        color: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30 text-indigo-400',
        isGlowing:
          communitySummary.unreadMessagesCount > 0 || communitySummary.recentDiscussionsCount > 0,
      },
      {
        id: 'financial-planner' as ScreenId,
        title: 'Financial Planner',
        count: 'HESLB & Budget',
        icon: Wallet,
        color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-400',
      },
    ],
    [
      myCourses.length,
      profile.programme,
      profile.programmeShort,
      profile.universityShort,
      pendingTasks.length,
      todayTasks.length,
      metrics,
      communitySummary,
    ]
  );

  // Real resolved academic metrics (never fallback to fake hardcoded 4.25, 14 days, 18.5 hrs, 96/144)
  const displayStreakDays = metrics ? metrics.studyStreakDays : 0;
  const displayStudyHours = metrics ? metrics.studyHoursThisWeek : 0;
  const currentSemesterCredits = useMemo(
    () => myCourses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0),
    [myCourses]
  );

  const renderActivityIcon = (type: StudentRecentActivityItem['type']) => {
    switch (type) {
      case 'ai_quiz':
      case 'grade_recorded':
        return <Award className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'ai_study':
      case 'ai_practice':
      case 'ai_exam_prep':
        return <Brain className="w-4 h-4 text-indigo-400 shrink-0" />;
      case 'ai_flashcards':
        return <Layers className="w-4 h-4 text-purple-400 shrink-0" />;
      case 'planner_task':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'material_view':
      case 'material_download':
        return <FileText className="w-4 h-4 text-sky-400 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24">
      {/* If profile is incomplete, show prominent Complete Academic Profile notification */}
      {(!profile.isProfileComplete || !profile.university || !profile.programme) && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-sky-950/40 to-slate-900 border border-sky-500/30 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-sky-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                Complete Your Academic Profile
              </h4>
              <p className="text-[11px] text-slate-300 truncate">
                Select your University, College, Department, Degree Programme, Year & Semester to unlock your verified courses.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="home-complete-profile-btn"
            onClick={() =>
              onNavigate(
                !profile.universityId || !profile.programmeId ? 'onboarding' : 'edit-profile'
              )
            }
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:brightness-110 shrink-0 cursor-pointer"
          >
            Complete Setup
          </button>
        </div>
      )}

      {/* 1. Welcome Card with Authenticated Student Identity, Photo & Real Academic Placement */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-blue-500/20 p-5 shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-36 h-36 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Student Photo Thumbnail with click to profile */}
            <button
              type="button"
              id="home-profile-avatar-btn"
              onClick={() => onNavigate('profile')}
              className="relative group shrink-0 cursor-pointer"
              title="Go to Academic Profile"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 overflow-hidden">
                {profile.profilePhoto || profile.photoURL || profile.avatar ? (
                  <img
                    src={profile.profilePhoto || profile.photoURL || profile.avatar}
                    alt={profile.name || profile.fullName || 'Student'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-2xl object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center font-bold text-lg text-sky-400 font-['Space_Grotesk']">
                    {(profile.name || profile.fullName || 'S').trim().charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs text-sky-400 font-medium flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      profile.status === 'inactive' || profile.accountStatus === 'inactive'
                        ? 'bg-rose-400'
                        : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  {profile.status === 'inactive' || profile.accountStatus === 'inactive'
                    ? 'Inactive Student'
                    : 'Active Student'}
                </span>
                {profile.yearOfStudy && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-300 font-medium">{profile.yearOfStudy}</span>
                  </>
                )}
                {profile.semester && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{profile.semester}</span>
                  </>
                )}
                {profile.registrationNumber && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] font-mono font-semibold text-sky-300/90">
                      {profile.registrationNumber}
                    </span>
                  </>
                )}
              </div>

              {/* Welcome message: "Hello, [student's name]" */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                Hello, {profile.name || profile.fullName || 'Student'}
              </h2>

              {/* Real University, College/Unit, Department & Degree Programme Badge */}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {(profile.universityShort || profile.university || profile.universityName) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold text-xs border border-blue-500/30">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {profile.universityShort || profile.university || profile.universityName}
                  </span>
                )}
                {(profile.college || profile.academicUnitName) && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/70 truncate max-w-[200px]">
                    {profile.college || profile.academicUnitName}
                  </span>
                )}
                {(profile.programme || profile.programmeName) ? (
                  <span className="text-xs text-slate-200 font-medium truncate">
                    {profile.programme || profile.programmeName}
                  </span>
                ) : (
                  <span className="text-xs text-amber-300/90 font-medium">
                    Academic placement not yet configured
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real Study Streak Counter Badge */}
          <div
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner min-w-[74px] shrink-0"
            title={
              displayStreakDays > 0
                ? `${displayStreakDays}-day active study streak`
                : 'Complete a study session or planner task today to start your streak'
            }
          >
            <div className="flex items-center gap-1 text-amber-400">
              <Flame
                className={`w-4 h-4 ${
                  displayStreakDays > 0 ? 'fill-amber-400 animate-bounce' : 'text-slate-500'
                }`}
              />
              <span className="font-extrabold text-sm text-white">{displayStreakDays}</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
              {displayStreakDays === 1 ? 'Day Streak' : 'Days Streak'}
            </span>
          </div>
        </div>

        {/* Real GPA, Study Activity & Credits Snapshot */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          <button
            type="button"
            onClick={() => onNavigate('gpa')}
            className="p-2 rounded-lg bg-slate-950/50 hover:bg-slate-950/80 border border-transparent hover:border-slate-800 transition-all cursor-pointer text-center"
            title="Open GPA Calculator & Academic Results"
          >
            <p className="text-[10px] text-slate-400">Current CGPA</p>
            {metrics?.hasGpaData && metrics.gpa !== null ? (
              <p className="text-sm font-bold text-white mt-0.5">
                {metrics.gpa.toFixed(2)}{' '}
                <span className="text-[10px] text-slate-500">/ {metrics.gpaMax.toFixed(1)}</span>
              </p>
            ) : (
              <p className="text-xs font-semibold text-sky-400 mt-1 flex items-center justify-center gap-1">
                <span>Record Grades</span>
                <ChevronRight className="w-3 h-3" />
              </p>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('planner')}
            className="p-2 rounded-lg bg-slate-950/50 hover:bg-slate-950/80 border border-transparent hover:border-slate-800 transition-all cursor-pointer text-center"
            title="View Weekly Study Activity"
          >
            <p className="text-[10px] text-slate-400">Week Study</p>
            <p className="text-sm font-bold text-sky-400 mt-0.5">
              {displayStudyHours > 0 ? `${displayStudyHours} hrs` : '0 hrs'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('courses')}
            className="p-2 rounded-lg bg-slate-950/50 hover:bg-slate-950/80 border border-transparent hover:border-slate-800 transition-all cursor-pointer text-center"
            title="View Enrolled Term & Degree Credits"
          >
            <p className="text-[10px] text-slate-400">
              {metrics?.hasGpaData ? 'Credits Earned' : 'Term Credits'}
            </p>
            {metrics?.hasGpaData ? (
              <p className="text-sm font-bold text-white mt-0.5">
                {metrics.creditsEarned}
                {metrics.hasProgrammeCredits ? (
                  <span className="text-[10px] text-slate-500">
                    {' '}
                    / {metrics.totalProgrammeCredits}
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="text-sm font-bold text-white mt-0.5">
                {currentSemesterCredits > 0 ? `${currentSemesterCredits} Units` : '—'}
              </p>
            )}
          </button>
        </div>
      </section>

      {/* 2. Real Exam Countdown Banner (Shown only when student has scheduled an exam) */}
      {nextExam && (
        <section
          onClick={() => onNavigate('planner')}
          className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/25 flex items-center justify-between gap-3 shadow-lg cursor-pointer hover:border-amber-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
                  Upcoming Exam
                </span>
                <span className="text-xs text-slate-400 font-semibold">{nextExam.courseCode}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 mt-0.5 leading-snug">
                {nextExam.examName}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {nextExam.date}
                {nextExam.venue && nextExam.venue !== 'TBA' ? ` • ${nextExam.venue}` : ''}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-amber-400 font-['Space_Grotesk'] leading-none">
              {nextExam.daysRemaining}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
              Days Left
            </div>
          </div>
        </section>
      )}

      {/* 3. AI Tutor Interactive Prompt Banner (Context-Aware for Student's Real Courses) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 text-[10px] font-semibold">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>VENUE Academic AI Assistant</span>
            </div>
            <h3 className="text-sm font-bold text-white">
              {profile?.programme
                ? `Study Assistant for ${profile.programmeShort || profile.programme}`
                : 'Personalized Academic AI Tutor'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {myCourses.length > 0
                ? `Grounded in your ${myCourses.length} enrolled ${profile.yearOfStudy || ''} (${profile.semester || ''}) courses, lecture notes, and past papers.`
                : 'Get step-by-step explanations, study sessions, quizzes, flashcards, and visual problem solving.'}
            </p>
          </div>
          <button
            id="home-open-ai-tutor-banner"
            onClick={() => onNavigate('ai-tutor')}
            className="shrink-0 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
            aria-label="Open AI Tutor"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Quick Prompt Chips grounded in student's actual courses */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
          {myCourses.slice(0, 2).map((course) => (
            <button
              key={course.id}
              onClick={() => {
                onSelectCourse(course);
                onNavigate('ai-tutor');
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-sky-300 border border-slate-800 transition-colors cursor-pointer font-medium"
            >
              Study {course.code}
            </button>
          ))}
          <button
            onClick={() => onNavigate('ai-tutor')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
          >
            Generate course quiz
          </button>
          <button
            onClick={() => onNavigate('ai-tutor')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
          >
            Solve homework photo
          </button>
        </div>
      </section>

      {/* 4. My Courses Dynamic Section (Strictly Real Catalogue Courses for Student's Placement) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">My Courses</h3>
            <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
              {profile.programme
                ? `${profile.programme}${profile.yearOfStudy ? ` • ${profile.yearOfStudy}` : ''}${
                    profile.semester ? ` • ${profile.semester}` : ''
                  }`
                : 'Official Degree Curriculum Courses'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="home-browse-materials-btn"
              onClick={() => onNavigate('browse-materials')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1.5 border border-slate-700/60 transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Browse Materials</span>
            </button>
            {myCourses.length > 0 && (
              <button
                id="home-view-all-courses-btn"
                onClick={() => onNavigate('courses')}
                className="text-xs text-slate-400 hover:text-slate-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({myCourses.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {isLoadingCourses ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((skeletonIdx) => (
              <div
                key={skeletonIdx}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-pulse space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-16 rounded bg-slate-800" />
                  <div className="h-4 w-20 rounded bg-slate-800" />
                </div>
                <div className="h-4 w-3/4 rounded bg-slate-800" />
                <div className="h-3 w-1/2 rounded bg-slate-800" />
              </div>
            ))}
          </div>
        ) : myCourses.length === 0 ? (
          <div
            id="home-no-verified-courses"
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-2.5"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5 text-slate-400" />
            </div>
            {isMissingCurriculum ? (
              <div className="space-y-1.5 pt-1">
                <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase tracking-wider">
                  CURRICULUM DATA MISSING — DO NOT INFER
                </span>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed pt-1">
                  Official prospectus curriculum data for this department's degree programme has not yet been published in the academic catalogue. Courses from other departments are strictly isolated and never inferred.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-200">
                  {profile.university && profile.programme
                    ? 'No courses found for your current semester.'
                    : 'Complete your academic profile to view your courses.'}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {profile.university && profile.programme
                    ? `No verified courses are currently listed for ${profile.universityShort || profile.university} • ${profile.programmeShort || profile.programme}${
                        profile.yearOfStudy
                          ? ` (${profile.yearOfStudy}${profile.semester ? `, ${profile.semester}` : ''})`
                          : ''
                      }.`
                    : 'Select your university, degree programme, year of study, and semester so VENUE can load your official curriculum.'}
                </p>
                {(!profile.university || !profile.programme) && (
                  <button
                    type="button"
                    onClick={() => onNavigate('onboarding')}
                    className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <span>Configure Academic Placement</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myCourses.map((course) => {
              const courseMetrics = metrics?.courseProgressMap?.[course.id];
              const realLecturerName =
                courseMetrics?.assignedLecturerName ||
                (course.instructor?.name &&
                course.instructor.name !== 'Faculty Academic Staff'
                  ? course.instructor.name
                  : null);
              const realProgressPercent =
                courseMetrics && courseMetrics.progressPercent !== null
                  ? courseMetrics.progressPercent
                  : null;
              const materialsCount = courseMetrics?.materialsAvailableCount || 0;
              const topicsStudied = courseMetrics?.topicsStudiedCount || 0;

              return (
                <div
                  key={course.id}
                  id={`home-course-${course.id}`}
                  onClick={() => {
                    onSelectCourse(course);
                    onNavigate('course-detail');
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/90 hover:border-blue-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${course.accentColor || '#38BDF8'}20`,
                          color: course.accentColor || '#38BDF8',
                        }}
                      >
                        {course.code}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
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
                      </div>
                    </div>

                    <h4 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-1">
                      {course.title}
                    </h4>

                    {/* Only display lecturer if a real lecturer is assigned in Firestore */}
                    {realLecturerName ? (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        Lecturer: <span className="text-slate-300">{realLecturerName}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        Year {course.year || course.yearOfStudy || 1} • Semester {course.semester || 1}
                      </p>
                    )}
                  </div>

                  {/* Real Course Study Progress or Clean Status Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/70">
                    {realProgressPercent !== null ? (
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>
                            {topicsStudied > 0
                              ? `${topicsStudied} ${topicsStudied === 1 ? 'Topic' : 'Topics'} Studied`
                              : 'Study Progress'}
                          </span>
                          <span className="font-semibold text-slate-200">{realProgressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${realProgressPercent}%`,
                              backgroundColor: course.accentColor || '#38BDF8',
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {materialsCount > 0
                            ? `${materialsCount} Course ${materialsCount === 1 ? 'Material' : 'Materials'}`
                            : 'Official Syllabus Course'}
                        </span>
                        <span className="text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                          <span>Open Course</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Quick Access Grid to Key Features */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-white tracking-tight">Academic Tools & Hubs</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {quickFeatureTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                id={`home-tile-${tile.id}`}
                onClick={() => onNavigate(tile.id)}
                className={`p-3 rounded-xl border text-left bg-gradient-to-br ${tile.color} hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between h-24 relative overflow-hidden group cursor-pointer`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <Icon className="w-4 h-4" />
                  </div>
                  {tile.isGlowing && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{tile.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{tile.count}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Today's Study Plan (Real Student Tasks — No Hardcoded MT 201 / ST 210 / ST 222 Tasks) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Today's Study Plan</h3>
            {todayTasks.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                {completedTasksCount} / {todayTasks.length} Done
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onAddTask && (
              <button
                type="button"
                id="home-quick-add-task-btn"
                onClick={() => setShowQuickTaskInput((prev) => !prev)}
                className="text-xs px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-sky-300 border border-blue-500/30 font-semibold inline-flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            )}
            <button
              id="home-view-planner-btn"
              onClick={() => onNavigate('planner')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
            >
              Open Planner
            </button>
          </div>
        </div>

        {/* Inline Quick Add Task Form */}
        {showQuickTaskInput && onAddTask && (
          <form
            onSubmit={handleQuickAddSubmit}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-2.5"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                placeholder={
                  myCourses[0]
                    ? `e.g. Revise ${myCourses[0].code} lecture notes`
                    : 'Enter study goal or revision task...'
                }
                required
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {myCourses.length > 0 && (
                <select
                  value={quickTaskCourse}
                  onChange={(e) => setQuickTaskCourse(e.target.value)}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {myCourses.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {(['high', 'medium', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setQuickTaskPriority(p)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase cursor-pointer ${
                      quickTaskPriority === p
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickTaskInput(false)}
                  className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Task</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {todayTasks.length === 0 ? (
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  No study tasks scheduled for today yet.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Create study blocks for your enrolled courses to track daily revision progress.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onAddTask ? setShowQuickTaskInput(true) : onNavigate('planner')
              }
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 shrink-0 cursor-pointer transition"
            >
              Add First Task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask?.(task.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  task.completed
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="truncate">
                    <p
                      className={`text-xs font-semibold leading-tight truncate ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {task.courseCode}
                      {task.timeSlot ? ` • ${task.timeSlot}` : ''}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[9px] px-2 py-0.5 rounded uppercase font-semibold shrink-0 ${
                    task.priority === 'high'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : task.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. Real Upcoming Academic Events / Notices & Real Student Activity */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Real Upcoming Events & Official Notices */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-blue-400" />
                Notices & Academic Events
              </h4>
              <button
                onClick={() => onNavigate('university-hub')}
                className="text-[10px] text-sky-400 font-semibold hover:underline cursor-pointer"
              >
                University Hub
              </button>
            </div>

            {isLoadingDashboardData ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 animate-pulse space-y-1.5"
                  >
                    <div className="h-3 w-20 bg-slate-800 rounded" />
                    <div className="h-3.5 w-3/4 bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            ) : upcomingNotices.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/70 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-300">
                  No upcoming events or announcements yet.
                </p>
                <p className="text-[11px] text-slate-500">
                  Official university and departmental notices published for your programme will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {upcomingNotices.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => onNavigate('university-hub')}
                    className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-blue-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-semibold ${
                          notice.type === 'Important'
                            ? 'text-amber-400'
                            : notice.type === 'Event'
                            ? 'text-emerald-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {notice.type}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatRelativeActivityTime(notice.publishedAt || notice.createdAt)}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-200 line-clamp-1 mt-0.5">
                      {notice.title}
                    </p>
                    {notice.summary && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {notice.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Real Recent Activity (Strictly Authenticated Student's Own Activity) */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Recent Activity
              </h4>
              {recentActivities.length > 0 && (
                <span className="text-[10px] text-slate-400">Your Learning Log</span>
              )}
            </div>

            {isLoadingDashboardData ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 animate-pulse flex items-center gap-2.5"
                  >
                    <div className="w-6 h-6 rounded bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-3/4 bg-slate-800 rounded" />
                      <div className="h-2.5 w-1/3 bg-slate-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/70 text-center space-y-1.5">
                <p className="text-xs font-semibold text-slate-300">
                  No recent academic activity yet.
                </p>
                <p className="text-[11px] text-slate-500">
                  Your AI Tutor sessions, quizzes, flashcard reviews, and course material views will be logged here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() =>
                      act.targetScreen ? onNavigate(act.targetScreen as ScreenId) : undefined
                    }
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-all cursor-pointer"
                  >
                    {renderActivityIcon(act.type)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-200 truncate">{act.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        {act.courseCode && (
                          <>
                            <span className="text-sky-400 font-semibold">{act.courseCode}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatRelativeActivityTime(act.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
