import React from 'react';
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
} from 'lucide-react';
import { Course, StudentProfile, StudyTask, ExamCountdown, ScreenId } from '../../types';
import { getVerifiedStudentCourses } from '../../data/udsmCatalogue';

interface HomeScreenProps {
  profile: StudentProfile;
  courses: Course[];
  todayTasks: StudyTask[];
  upcomingExams: ExamCountdown[];
  onNavigate: (screen: ScreenId) => void;
  onSelectCourse: (course: Course) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  courses,
  todayTasks,
  upcomingExams,
  onNavigate,
  onSelectCourse,
}) => {
  const nextExam = upcomingExams[0];
  const pendingTasks = todayTasks.filter((t) => !t.completed);

  // Dynamic verified courses strictly matching currently authenticated student's profile:
  // university + programme + yearOfStudy + semester
  // VENUE MUST NEVER ASSUME THAT A USER IS A MATHEMATICS & STATISTICS STUDENT.
  const myCourses = courses || [];
  const pid = (profile?.programmeId || '').toLowerCase().trim();
  const isMissingCurriculum = pid.startsWith('bsc-ed-') && pid !== 'bsc-ed';

  const quickFeatureTiles = [
    {
      id: 'courses' as ScreenId,
      title: 'My Courses',
      count: myCourses.length > 0 ? `${myCourses.length} Active` : 'Coursework',
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
      count: 'Academic Help',
      icon: Sparkles,
      color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30 text-sky-400',
      isGlowing: true,
    },
    {
      id: 'planner' as ScreenId,
      title: 'Study Planner',
      count: `${pendingTasks.length} Due Today`,
      icon: Calendar,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      id: 'resources' as ScreenId,
      title: 'Resources',
      count: 'Notes & Books',
      icon: FileText,
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-sky-400',
    },
    {
      id: 'past-papers' as ScreenId,
      title: 'Past Papers',
      count: 'Exam Archive',
      icon: FileText,
      color: 'from-indigo-600/20 to-blue-500/10 border-indigo-500/30 text-indigo-400',
    },
    {
      id: 'quiz' as ScreenId,
      title: 'Quizzes',
      count: 'Practice & Test',
      icon: HelpCircle,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    },
    {
      id: 'flashcards' as ScreenId,
      title: 'Flashcards',
      count: 'Study Decks',
      icon: Layers,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
    },
    {
      id: 'scholarships' as ScreenId,
      title: 'Scholarships',
      count: 'Opportunities',
      icon: Award,
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
    },
    {
      id: 'career' as ScreenId,
      title: 'Career',
      count: 'Career Paths',
      icon: Briefcase,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    },
    {
      id: 'university-hub' as ScreenId,
      title: 'University Hub',
      count: profile.universityShort ? `${profile.universityShort} Notices` : 'Campus Notices',
      icon: Building2,
      color: 'from-blue-600/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
    },
    {
      id: 'community' as ScreenId,
      title: 'Community',
      count: 'Student Forum',
      icon: Users,
      color: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30 text-indigo-400',
    },
    {
      id: 'financial-planner' as ScreenId,
      title: 'Financial Planner',
      count: 'HESLB & Budget',
      icon: Wallet,
      color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-400',
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* If profile is incomplete, show prominent Complete Academic Profile notification */}
      {(!profile.isProfileComplete || !profile.registrationNumber) && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-sky-950/40 to-slate-900 border border-sky-500/30 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-sky-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">Setup Student Academic Profile</h4>
              <p className="text-[11px] text-slate-300 truncate">
                Upload your photo and record your Registration Number, University & Degree.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="home-complete-profile-btn"
            onClick={() => onNavigate('edit-profile')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:brightness-110 shrink-0 cursor-pointer"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* 1. Welcome Card with Student Greeting, Photo & Academic Details */}
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
                {profile.profilePhoto || profile.avatar ? (
                  <img
                    src={profile.profilePhoto || profile.avatar}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-2xl object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center font-bold text-lg text-sky-400 font-['Space_Grotesk']">
                    {(profile.name || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs text-sky-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Student
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{profile.yearOfStudy || 'Year 1'}</span>
                {profile.registrationNumber && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] font-mono font-semibold text-sky-300/90">{profile.registrationNumber}</span>
                  </>
                )}
              </div>

              {/* Welcome message: "Hello, [student's name]" */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                Hello, {profile.name || 'Student'}
              </h2>

              {/* University & Degree Badge */}
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {(profile.universityShort || profile.university) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold text-xs border border-blue-500/30">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {profile.universityShort || profile.university}
                  </span>
                )}
                {profile.programme && (
                  <span className="text-xs text-slate-300 font-medium truncate">
                    {profile.programme}
                  </span>
                )}
                {profile.semester && (
                  <span className="text-xs text-slate-500">({profile.semester})</span>
                )}
              </div>
            </div>
          </div>

          {/* Streak Counter Badge */}
          <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner min-w-[70px] shrink-0">
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400 animate-bounce" />
              <span className="font-extrabold text-sm">{profile.studyStreakDays}</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
              Day Streak
            </span>
          </div>
        </div>

        {/* GPA & Progress quick snapshot */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-slate-950/50">
            <p className="text-[10px] text-slate-400">Current GPA</p>
            <p className="text-sm font-bold text-white mt-0.5">{profile.gpa} <span className="text-[10px] text-slate-500">/ {profile.gpaMax}</span></p>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/50">
            <p className="text-[10px] text-slate-400">Week Study</p>
            <p className="text-sm font-bold text-sky-400 mt-0.5">{profile.studyHoursThisWeek} hrs</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/50">
            <p className="text-[10px] text-slate-400">Credits Earned</p>
            <p className="text-sm font-bold text-white mt-0.5">{profile.creditsCompleted} <span className="text-[10px] text-slate-500">/ {profile.totalCredits}</span></p>
          </div>
        </div>
      </section>

      {/* 2. Exam Countdown Banner */}
      {nextExam && (
        <section className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/25 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
                  Exam Countdown
                </span>
                <span className="text-xs text-slate-400">{nextExam.courseCode}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 mt-0.5 leading-snug">
                {nextExam.examName}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{nextExam.venue}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-amber-400 font-['Space_Grotesk'] leading-none">
              {nextExam.daysRemaining}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Days Left</div>
          </div>
        </section>
      )}

      {/* 3. AI Tutor Interactive Prompt Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 text-[10px] font-semibold">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>VENUE Academic AI Assistant</span>
            </div>
            <h3 className="text-sm font-bold text-white">
              {profile?.programme ? `Need help with ${profile.programmeShort || profile.programme}?` : 'Academic Study Assistant'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Get explanations, lecture summaries, problem breakdowns, and revision guidance for your courses.
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

        {/* Quick prompt chips */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
          <button
            onClick={() => onNavigate('ai-tutor')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
          >
            "Explain core concept"
          </button>
          <button
            onClick={() => onNavigate('ai-tutor')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
          >
            "Generate practice quiz"
          </button>
          <button
            onClick={() => onNavigate('ai-tutor')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
          >
            "Summarize lecture notes"
          </button>
        </div>
      </section>

      {/* 4. My Courses Dynamic Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">My Courses</h3>
            <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
              {profile.programme
                ? `${profile.programme}${profile.yearOfStudy ? ` • ${profile.yearOfStudy}` : ''}${profile.semester ? ` • ${profile.semester}` : ''}`
                : 'Enrolled Academic Coursework'}
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

        {myCourses.length === 0 ? (
          <div
            id="home-no-verified-courses"
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-2"
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
                  No verified courses available yet.
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {profile.university && profile.programme
                    ? `No verified courses matching ${profile.universityShort || profile.university} • ${profile.programmeShort || profile.programme}${profile.yearOfStudy ? ` (${profile.yearOfStudy}${profile.semester ? `, ${profile.semester}` : ''})` : ''}.`
                    : 'Save your university, programme, year of study, and semester in your profile to view verified courses.'}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myCourses.map((course) => (
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
                  {course.instructor?.name && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {course.instructor.name}
                    </p>
                  )}
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Syllabus Progress</span>
                    <span className="font-semibold text-slate-200">{course.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${course.progress || 0}%`,
                        backgroundColor: course.accentColor || '#38BDF8',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
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

      {/* 6. Today's Study Tasks */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Today's Study Plan</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
              {todayTasks.filter((t) => t.completed).length} / {todayTasks.length} Done
            </span>
          </div>
          <button
            id="home-view-planner-btn"
            onClick={() => onNavigate('planner')}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
          >
            Open Planner
          </button>
        </div>

        <div className="space-y-2">
          {todayTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                task.completed
                  ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200'
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
                    {task.courseCode} • {task.timeSlot}
                  </p>
                </div>
              </div>

              <span
                className={`text-[9px] px-2 py-0.5 rounded uppercase font-semibold shrink-0 ${
                  task.priority === 'high'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Upcoming Academic Events & Recent Activity */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Academic Events */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Upcoming Events
            </h4>
            <button
              onClick={() => onNavigate('university-hub')}
              className="text-[10px] text-sky-400 font-semibold hover:underline"
            >
              Full Calendar
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-blue-400 font-semibold block">June 26, 2026</span>
              <p className="font-semibold text-slate-200">End of Semester II Lectures</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Formal conclusion of all CoNAS lab practicals</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-amber-400 font-semibold block">July 06, 2026</span>
              <p className="font-semibold text-slate-200">Semester II University Examinations (UE)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">3-week examination window</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Recent Activity
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <FileText className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="truncate">
                <p className="font-medium text-slate-200 truncate">Downloaded MT 201 Heine-Borel Notes</p>
                <p className="text-[10px] text-slate-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <p className="font-medium text-slate-200 truncate">Scored 100% on Probability MGF Quiz</p>
                <p className="text-[10px] text-slate-500">Yesterday at 20:15</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="truncate">
                <p className="font-medium text-slate-200 truncate">Joined Dr. Wilbert Chagula Study Group</p>
                <p className="text-[10px] text-slate-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
