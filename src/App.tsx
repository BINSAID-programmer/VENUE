import React, { useState, useEffect } from 'react';
import {
  ScreenId,
  Course,
  StudentProfile,
  StudyTask,
  FinancialTransaction,
  CommunityPost,
  AcademicMaterialRecord,
} from './types';
import {
  mockStudentProfile,
  mockCourses,
  mockStudyTasks,
  mockWeeklyGoals,
  mockExams,
  mockQuizQuestions,
  mockFlashcardDecks,
  mockOpportunities,
  mockCareerPaths,
  mockAnnouncements,
  mockCalendarEvents,
  mockStudentServices,
  mockCommunityPosts,
  mockFinancials,
  mockNotifications,
} from './data/mockData';
import {
  loadStudentProfile,
  saveStudentProfile,
  getStudentUid,
} from './services/studentProfileService';
import {
  onAuthUserChanged,
  logoutUser,
  signInWithGoogle,
  checkGoogleRedirectResult,
  isVerifiedOwnerAccount,
} from './services/firebase';
import { firestoreCatalogueService } from './services/firestoreCatalogueService';
import { courseCurriculumService } from './services/courseCurriculumService';
import { degreeProgrammeService } from './services/degreeProgrammeService';
import { studentDashboardService } from './services/studentDashboardService';
import { communityService } from './services/communityService';

// Layout Components
import { DeviceWrapper } from './components/layout/DeviceWrapper';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';

// Screen Components
import { SplashScreen } from './components/screens/SplashScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { CreateAccountScreen } from './components/screens/CreateAccountScreen';
import { VerifyEmailScreen } from './components/screens/VerifyEmailScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { CoursesScreen } from './components/screens/CoursesScreen';
import { CourseDetailScreen } from './components/screens/CourseDetailScreen';
import { AITutorScreen } from './components/screens/AITutorScreen';
import { ResourcesScreen } from './components/screens/ResourcesScreen';
import { BrowseMaterialsScreen } from './components/screens/BrowseMaterialsScreen';
import { MaterialViewerScreen } from './components/screens/MaterialViewerScreen';
import { PastPapersScreen } from './components/screens/PastPapersScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { MoreScreen } from './components/screens/MoreScreen';
import { StudyPlannerScreen } from './components/screens/StudyPlannerScreen';
import { QuizScreen } from './components/screens/QuizScreen';
import { FlashcardsScreen } from './components/screens/FlashcardsScreen';
import { ScholarshipsScreen } from './components/screens/ScholarshipsScreen';
import { CareerHubScreen } from './components/screens/CareerHubScreen';
import { UniversityHubScreen } from './components/screens/UniversityHubScreen';
import { CommunityScreen } from './components/screens/CommunityScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { EditProfileScreen } from './components/screens/EditProfileScreen';
import { FinancialPlannerScreen } from './components/screens/FinancialPlannerScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AdminGuard } from './components/admin';
import { LecturerGuard } from './components/lecturer';
import { lecturerAuthService } from './services/lecturerAuthService';
import { ThemeProvider } from './context/ThemeContext';
import { ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('splash');
  const [navigationHistory, setNavigationHistory] = useState<ScreenId[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<AcademicMaterialRecord | null>(null);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [activeMaterialInitialPage, setActiveMaterialInitialPage] = useState<number | undefined>(
    undefined
  );
  const [showInactiveNoticeModal, setShowInactiveNoticeModal] = useState<boolean>(false);

  // Application Data State
  const [profile, setProfile] = useState<StudentProfile>(mockStudentProfile);
  // Strictly loaded from authenticated user profile and curriculum; never default to math
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState(mockQuizQuestions);
  const [decks, setDecks] = useState(mockFlashcardDecks);
  const [opportunities, setOpportunities] = useState(mockOpportunities);
  const [careerPaths, setCareerPaths] = useState(mockCareerPaths);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [calendarEvents, setCalendarEvents] = useState(mockCalendarEvents);
  const [services, setServices] = useState(mockStudentServices);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(mockCommunityPosts);
  const [financials, setFinancials] = useState(mockFinancials);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Subscribe to real Firestore community notifications for the authenticated user
  useEffect(() => {
    if (!profile?.uid) {
      setNotifications([]);
      return;
    }
    if (typeof communityService.subscribeToUserNotifications !== 'function') {
      return;
    }
    const unsub = communityService.subscribeToUserNotifications(profile.uid, (liveNotifs) => {
      setNotifications(liveNotifs);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [profile?.uid]);
  const [initialVerificationStatus, setInitialVerificationStatus] = useState<{
    sent?: boolean;
    error?: string | null;
  } | null>(null);

  // Dynamically load verified courses strictly for the authenticated student's profile:
  // UID -> Profile -> institutionId -> academicUnitId -> departmentId -> programmeId -> yearOfStudy -> semester
  useEffect(() => {
    let isMounted = true;

    const loadStudentCourses = async () => {
      const pid = profile?.programmeId;
      const deptId = profile?.departmentId;
      const unitId = profile?.academicUnitId || profile?.institutionId;

      const rawYear = profile?.yearOfStudy || '';
      const rawSem = profile?.semester || '';
      const yr = rawYear ? parseInt(rawYear.replace(/\D/g, ''), 10) : 0;
      const sem = rawSem ? parseInt(rawSem.replace(/\D/g, ''), 10) : 0;

      // Absolute rule: Never fallback to math or any other default if profile is incomplete
      if (!pid || !yr || !sem) {
        if (isMounted) setCourses([]);
        return;
      }

      try {
        const result = await courseCurriculumService.getCoursesByProgrammeAndTerm({
          programmeId: pid,
          departmentId: deptId,
          academicUnitId: unitId,
          yearOfStudy: yr,
          semester: sem,
          universityId: profile?.universityId,
          userId: profile?.uid,
        });

        if (isMounted) {
          const liveMetaMap = await courseCurriculumService.getCourseLiveMetadataMap({
            universityId: profile?.universityId,
            programmeId: pid,
            courseRecords: result.courses,
          });
          if (isMounted) {
            const mapped = result.courses.map((rec, idx) => {
              const codeNorm = (rec.code || '').replace(/\s+/g, '').toUpperCase();
              const liveMeta =
                liveMetaMap.get(rec.id) ||
                (rec.canonicalCourseId ? liveMetaMap.get(rec.canonicalCourseId) : undefined) ||
                liveMetaMap.get(codeNorm);
              return courseCurriculumService.mapRecordToCourse(rec, idx, liveMeta);
            });
            setCourses(mapped);
          }
        }
      } catch (err) {
        console.warn('App: Error loading profile-specific courses:', err);
        if (isMounted) setCourses([]);
      }
    };

    loadStudentCourses();
    return () => {
      isMounted = false;
    };
  }, [
    profile?.programmeId,
    profile?.departmentId,
    profile?.academicUnitId,
    profile?.institutionId,
    profile?.yearOfStudy,
    profile?.semester,
    profile?.universityId,
    profile?.uid,
  ]);

  // Dynamically load authenticated student's real study tasks, exams, and weekly goals
  useEffect(() => {
    let isMounted = true;
    const uid = profile?.uid;
    if (!uid) {
      setTasks([]);
      setExams([]);
      setWeeklyGoals([]);
      return;
    }

    Promise.all([
      studentDashboardService.getStudentTasks(uid),
      studentDashboardService.getStudentExams(uid),
    ])
      .then(([loadedTasks, loadedExams]) => {
        if (!isMounted) return;
        setTasks(loadedTasks);
        setExams(loadedExams);
        setWeeklyGoals(studentDashboardService.getStudentWeeklyGoals(uid));
      })
      .catch(() => {
        if (!isMounted) return;
        setTasks([]);
        setExams([]);
      });

    return () => {
      isMounted = false;
    };
  }, [profile?.uid]);

  // Restore persistent student profile & sync Firebase Auth session for returning users
  useEffect(() => {
    let isMounted = true;

    // 1. Instant check from local cache for fluid initial UI
    const restoreSavedStudent = async () => {
      try {
        const storedUid = localStorage.getItem('venue_current_student_uid');
        if (storedUid) {
          const loaded = await loadStudentProfile(storedUid);
          if (loaded && isMounted) {
            setProfile(loaded);
          }
        }
      } catch (err) {
        console.warn('Error restoring cached student session:', err);
      }
    };
    restoreSavedStudent();

    // 1b. Check if user is returning from a Google signInWithRedirect flow
    checkGoogleRedirectResult().then(async (redirectUser) => {
      if (!isMounted || !redirectUser) return;
      try {
        const uid = redirectUser.uid;
        const email = redirectUser.email || '';
        const isVerified = Boolean(redirectUser.emailVerified);
        localStorage.setItem('venue_current_student_uid', uid);

        const savedProfile = await loadStudentProfile(uid, email);
        if (savedProfile && savedProfile.isProfileComplete) {
          setProfile({
            ...savedProfile,
            uid,
            emailVerified: isVerified,
          });
          setCurrentScreen('home');
        } else {
          const emailPrefix = email.split('@')[0];
          const defaultName = redirectUser.displayName ||
            (emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'Student');

          const initialNewProfile: StudentProfile = {
            ...(savedProfile || profile),
            uid,
            email,
            name: (savedProfile?.name && savedProfile.name !== 'Student') ? savedProfile.name : defaultName,
            emailVerified: isVerified,
            isProfileComplete: false,
          };
          const savedInitial = await saveStudentProfile(initialNewProfile);
          if (isMounted) {
            setProfile(savedInitial);
            setCurrentScreen('onboarding');
          }
        }
      } catch (err) {
        console.warn('Error processing Google redirect result in App:', err);
      }
    });

    // 2. Persistent Firebase Auth listener: keeps returning users logged in
    const unsubscribe = onAuthUserChanged(async (firebaseUser) => {
      if (!isMounted) return;
      if (firebaseUser) {
        try {
          const uid = firebaseUser.uid;
          const email = firebaseUser.email || '';
          const isVerified = Boolean(firebaseUser.emailVerified);
          localStorage.setItem('venue_current_student_uid', uid);
          const loaded = await loadStudentProfile(uid, email);
          if (loaded && isMounted) {
            setProfile({
              ...loaded,
              uid,
              email: email || loaded.email,
              emailVerified: isVerified,
              ...(isVerifiedOwnerAccount(uid, email)
                ? { status: 'active', accountStatus: 'active' }
                : {}),
            });
          } else if (isMounted) {
            const emailPrefix = email.split('@')[0];
            const cleanName = firebaseUser.displayName ||
              (emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'Student');
            setProfile((prev) => ({
              ...prev,
              uid,
              email,
              name: prev.name && prev.name !== 'Student' ? prev.name : cleanName,
              emailVerified: isVerified,
            }));
          }

          // Check if user is an accredited faculty lecturer (Requirement 8)
          let isLinkedLecturer = false;
          try {
            const lecturerRec = await lecturerAuthService.getLecturerByUid(uid);
            if (lecturerRec && lecturerRec.status === 'active') {
              isLinkedLecturer = true;
            }
          } catch {
            isLinkedLecturer = false;
          }

          // Requirements 3, 9, 10: Check real verification status for returning users
          // Do NOT allow an unverified user to access the main VENUE Dashboard.
          setCurrentScreen((prevScreen) => {
            if (!isVerified) {
              // Redirect unverified users to verify-email
              const screensToIntercept: ScreenId[] = [
                'splash',
                'welcome',
                'login',
                'signup',
                'auth',
                'home',
                'courses',
                'course-detail',
                'ai-tutor',
                'planner',
                'quiz',
                'flashcards',
                'scholarships',
                'career',
                'university-hub',
                'community',
                'profile',
                'edit-profile',
                'complete-profile',
                'financial-planner',
                'notifications',
                'settings',
                'resources',
                'browse-materials',
                'past-papers',
                'search',
                'more',
              ];
              if (screensToIntercept.includes(prevScreen)) {
                return 'verify-email';
              }
              return prevScreen;
            }

            // If verified, advance returning user from landing/auth/verify screens
            if (['splash', 'welcome', 'login', 'signup', 'auth', 'verify-email'].includes(prevScreen)) {
              if (isLinkedLecturer) {
                return 'lecturer';
              }
              return loaded?.isProfileComplete ? 'home' : 'onboarding';
            }
            return prevScreen;
          });
        } catch (err) {
          console.warn('Error syncing Firebase Auth user session:', err);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Initialize verified official academic catalogue & curriculum in Firestore (Steps 2 & 3)
  useEffect(() => {
    firestoreCatalogueService.bootstrapOfficialCatalogueIfEmpty().catch((err) => {
      console.warn('Academic catalogue Firestore initialization note:', err);
    });
    courseCurriculumService.bootstrapOfficialCurriculumCoursesIfEmpty().catch((err) => {
      console.warn('Curriculum courses Firestore initialization note:', err);
    });
  }, []);

  // Direct URL and hash listener for /admin, #admin, /lecturer, and #lecturer navigation
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path === '/admin' ||
        path.startsWith('/admin') ||
        hash === '#admin' ||
        hash.startsWith('#admin') ||
        hash === '#announcements' ||
        search.includes('screen=admin') ||
        search.includes('view=admin')
      ) {
        setCurrentScreen('admin');
      } else if (
        path === '/lecturer' ||
        path.startsWith('/lecturer/') ||
        hash === '#lecturer' ||
        search.includes('screen=lecturer') ||
        search.includes('view=lecturer')
      ) {
        setCurrentScreen('lecturer');
      } else {
        const matMatch =
          path.match(/^\/materials\/([^/]+)\/view\/?$/i) ||
          hash.match(/^#\/?materials\/([^/]+)\/view\/?$/i);
        if (matMatch && matMatch[1]) {
          setActiveMaterialId(decodeURIComponent(matMatch[1]));
          setCurrentScreen('material-viewer');
        }
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Navigation Handlers
  const handleNavigate = (screen: ScreenId) => {
    if (screen === 'admin') {
      if (currentScreen !== 'admin') {
        setNavigationHistory((prev) => [...prev, currentScreen]);
        setCurrentScreen('admin');
        window.history.pushState(null, '', '#admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (screen === 'lecturer') {
      if (currentScreen !== 'lecturer') {
        setNavigationHistory((prev) => [...prev, currentScreen]);
        setCurrentScreen('lecturer');
        window.history.pushState(null, '', '#lecturer');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (currentScreen === 'admin' && window.location.hash === '#admin') {
      window.history.pushState(null, '', window.location.pathname);
    }
    if (currentScreen === 'lecturer' && window.location.hash === '#lecturer') {
      window.history.pushState(null, '', window.location.pathname);
    }

    // Requirements 3 & 10: Guard dashboard and feature screens against unverified access
    const protectedScreens: ScreenId[] = [
      'home',
      'courses',
      'course-detail',
      'ai-tutor',
      'planner',
      'quiz',
      'flashcards',
      'scholarships',
      'career',
      'university-hub',
      'community',
      'profile',
      'edit-profile',
      'complete-profile',
      'financial-planner',
      'notifications',
      'settings',
      'resources',
      'browse-materials',
      'past-papers',
      'search',
      'more',
    ];

    if (profile.email && profile.emailVerified === false && protectedScreens.includes(screen)) {
      if (currentScreen !== 'verify-email') {
        setCurrentScreen('verify-email');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Stage 6D: Guard protected interactive student features against deactivated accounts (never restrict verified owner)
    const isAccountInactive =
      !isVerifiedOwnerAccount(profile.uid, profile.email) &&
      (profile.status === 'inactive' || profile.accountStatus === 'inactive');
    const interactiveScreens: ScreenId[] = [
      'ai-tutor',
      'quiz',
      'flashcards',
      'community',
      'financial-planner',
    ];
    if (isAccountInactive && interactiveScreens.includes(screen)) {
      setShowInactiveNoticeModal(true);
      return;
    }

    if (screen !== currentScreen) {
      setNavigationHistory((prev) => [...prev, currentScreen]);
      setCurrentScreen(screen);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentScreen === 'lecturer' && window.location.hash === '#lecturer') {
      window.history.pushState(null, '', window.location.pathname);
    }
    if (
      currentScreen === 'material-viewer' &&
      (window.location.pathname.startsWith('/materials/') ||
        window.location.hash.startsWith('#/materials/'))
    ) {
      window.history.pushState(null, '', '/');
    }
    if (navigationHistory.length > 0) {
      const prevScreen = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, prev.length - 1));
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('home');
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    handleNavigate('course-detail');
  };

  const handleOpenMaterialViewer = (material: AcademicMaterialRecord, initialPage?: number) => {
    setActiveMaterial(material);
    setActiveMaterialId(material.id);
    setActiveMaterialInitialPage(
      typeof initialPage === 'number' && Number.isFinite(initialPage) && initialPage >= 1
        ? Math.round(initialPage)
        : undefined
    );
    if (currentScreen !== 'material-viewer') {
      setNavigationHistory((prev) => [...prev, currentScreen]);
      setCurrentScreen('material-viewer');
      try {
        const pageParam =
          typeof initialPage === 'number' && Number.isFinite(initialPage) && initialPage >= 1
            ? `?page=${Math.round(initialPage)}`
            : '';
        window.history.pushState(
          null,
          '',
          `/materials/${encodeURIComponent(material.id)}/view${pageParam}`
        );
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAskAITutor = (course: Course) => {
    setSelectedCourse(course);
    handleNavigate('ai-tutor');
  };

  // State Mutators (persisted to real student database via studentDashboardService)
  const handleToggleTask = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    try {
      const updated = await studentDashboardService.toggleStudentTask(taskId, profile?.uid);
      setTasks(updated);
    } catch (err) {
      console.warn('Failed to toggle study task:', err);
    }
  };

  const handleAddTask = async (newTask: StudyTask) => {
    setTasks((prev) => [newTask, ...prev]);
    try {
      const updated = await studentDashboardService.saveStudentTask(newTask, profile?.uid);
      setTasks(updated);
    } catch (err) {
      console.warn('Failed to save study task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      const updated = await studentDashboardService.deleteStudentTask(taskId, profile?.uid);
      setTasks(updated);
    } catch (err) {
      console.warn('Failed to delete study task:', err);
    }
  };

  const handleAddCommunityPost = (newPost: CommunityPost) => {
    setCommunityPosts((prev) => [newPost, ...prev]);
  };

  const handleAddTransaction = (newTxn: FinancialTransaction) => {
    setFinancials((prev) => ({
      ...prev,
      spentTotal: prev.spentTotal + newTxn.amount,
      transactions: [newTxn, ...prev.transactions],
    }));
  };

  const handleUpdateProfile = async (updated: Partial<StudentProfile>) => {
    const merged: StudentProfile = { ...profile, ...updated };
    setProfile(merged);
    try {
      const saved = await saveStudentProfile(merged);
      setProfile(saved);
    } catch (err) {
      console.warn('Failed to persist profile:', err);
    }
  };

  const handleResetData = () => {
    setProfile(mockStudentProfile);
    setCourses([]);
    courseCurriculumService.clearCache();
    degreeProgrammeService.clearCache();
    studentDashboardService.clearCache();
    setTasks([]);
    setExams([]);
    setWeeklyGoals([]);
    setFinancials(mockFinancials);
    setCommunityPosts(mockCommunityPosts);
    setNotifications(mockNotifications);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('venue_current_student_uid');
      localStorage.removeItem('venue_active_user_uid');
      sessionStorage.removeItem('venue_current_email');
      courseCurriculumService.clearCache();
      degreeProgrammeService.clearCache();
      studentDashboardService.clearCache();
      setCourses([]);
      setTasks([]);
      setExams([]);
      setWeeklyGoals([]);
      setInitialVerificationStatus(null);
      setProfile(mockStudentProfile);
    } catch (err) {
      console.warn('Error during logout:', err);
    }
    setNavigationHistory([]);
    setCurrentScreen('welcome');
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.redirected) {
        // Redirection initiated to Google login; browser will navigate
        return;
      }
      const googleUser = result.user;
      if (!googleUser || !googleUser.uid) return;

      const uid = googleUser.uid;
      const email = googleUser.email || '';
      const isVerified = Boolean(googleUser.emailVerified);

      localStorage.setItem('venue_current_student_uid', uid);

      // Requirement 8: Check if account is an accredited lecturer
      try {
        const lecturerRec = await lecturerAuthService.getLecturerByUid(uid);
        if (lecturerRec && lecturerRec.status === 'active') {
          handleNavigate('lecturer');
          return;
        }
      } catch (err) {
        console.warn('Error checking lecturer status in Google sign-in:', err);
      }

      // Check if profile exists for this Firebase UID
      const savedProfile = await loadStudentProfile(uid, email);

      if (savedProfile && savedProfile.isProfileComplete) {
        // Returning user with completed academic profile: go directly to saved Dashboard
        setProfile({
          ...savedProfile,
          uid,
          emailVerified: isVerified,
        });
        handleNavigate('home');
      } else {
        // New Google user: complete academic profile setup once
        const emailPrefix = email.split('@')[0];
        const defaultName = googleUser.displayName ||
          (emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'Student');

        const initialNewProfile: StudentProfile = {
          ...(savedProfile || profile),
          uid,
          email,
          name: (savedProfile?.name && savedProfile.name !== 'Student') ? savedProfile.name : defaultName,
          emailVerified: isVerified,
          isProfileComplete: false,
        };

        const savedInitial = await saveStudentProfile(initialNewProfile);
        setProfile(savedInitial);
        handleNavigate('onboarding');
      }
    } catch (error: any) {
      console.warn('Google sign-in flow error:', error);
      throw error;
    }
  };

  // Header & BottomNav display conditions
  const authScreens = [
    'splash',
    'welcome',
    'login',
    'signup',
    'auth',
    'verify-email',
    'onboarding',
    'admin',
    'lecturer',
    'material-viewer',
  ];
  const showHeader = !authScreens.includes(currentScreen);
  const showBottomNav = !authScreens.includes(currentScreen);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <ThemeProvider initialTheme={profile.themePreference}>
      <DeviceWrapper
        fullWidth={
          currentScreen === 'admin' ||
          currentScreen === 'lecturer' ||
          currentScreen === 'material-viewer'
        }
      >
        {/* App Header for Authenticated Screens */}
      {showHeader && (
        <Header
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          unreadCount={unreadNotifsCount}
          onBack={handleBack}
          title={
            currentScreen === 'courses'
              ? 'My Courses'
              : currentScreen === 'course-detail' && selectedCourse
              ? selectedCourse.code
              : currentScreen === 'ai-tutor'
              ? 'AI Tutor'
              : currentScreen === 'resources'
              ? 'Resources'
              : currentScreen === 'past-papers'
              ? 'Past Papers'
              : currentScreen === 'search'
              ? 'Search VENUE'
              : currentScreen === 'more'
              ? 'More Hubs'
              : currentScreen === 'planner'
              ? 'Study Planner'
              : currentScreen === 'quiz'
              ? 'Quizzes'
              : currentScreen === 'flashcards'
              ? 'Flashcards'
              : currentScreen === 'scholarships'
              ? 'Scholarships'
              : currentScreen === 'career'
              ? 'Career Hub'
              : currentScreen === 'university-hub'
              ? 'University Hub'
              : currentScreen === 'community'
              ? 'Student Community'
              : currentScreen === 'profile'
              ? 'Student Profile'
              : currentScreen === 'edit-profile'
              ? 'Edit Profile'
              : currentScreen === 'complete-profile'
              ? 'Academic Profile Setup'
              : currentScreen === 'financial-planner'
              ? 'Student Budget'
              : currentScreen === 'notifications'
              ? 'Notifications'
              : currentScreen === 'settings'
              ? 'Settings'
              : undefined
          }
          subtitle={
            currentScreen === 'course-detail' && selectedCourse
              ? selectedCourse.title
              : undefined
          }
          universityShort={profile.universityShort}
        />
      )}

      {/* Stage 6D: Persistent Account Deactivation Alert Banner for Inactive Students */}
      {showHeader &&
        !isVerifiedOwnerAccount(profile.uid, profile.email) &&
        (profile.status === 'inactive' || profile.accountStatus === 'inactive') && (
        <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/70 border-b border-rose-500/40 px-4 py-3 sm:px-6 shadow-lg backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-rose-300">
                  Account Inactive:
                </span>{' '}
                <span className="text-slate-300">
                  Interactive learning services (AI Tutor, Quizzes, Flashcards, Community) are temporarily paused. Your degree program enrollment, course syllabi, past papers, notes, and grades remain completely preserved.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNavigate('profile')}
              className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold shrink-0 cursor-pointer transition text-[11px]"
            >
              View Profile
            </button>
          </div>
        </div>
      )}

      {/* Screen Router View */}
      <main className="flex-1 w-full relative">
        {/* Step 1: Splash Screen */}
        {currentScreen === 'splash' && (
          <SplashScreen onContinue={() => handleNavigate('welcome')} />
        )}

        {/* Step 2: Welcome Screen */}
        {currentScreen === 'welcome' && (
          <WelcomeScreen
            onGetStarted={() => handleNavigate('signup')}
            onLogin={() => handleNavigate('login')}
            onGoogleSignIn={handleGoogleSignIn}
          />
        )}

        {/* Step 3: Login Screen */}
        {currentScreen === 'login' && (
          <LoginScreen
            onGoogleSignIn={handleGoogleSignIn}
            onSuccess={async (data) => {
              if (data?.email) {
                const uid = getStudentUid(data.email, data?.uid);
                const isVerified = Boolean(data.emailVerified);
                // Attempt to load existing saved student profile from server storage
                const saved = await loadStudentProfile(uid, data.email);
                if (saved) {
                  setProfile({ ...saved, emailVerified: isVerified });
                } else {
                  const emailPrefix = data.email.split('@')[0];
                  const cleanName = emailPrefix
                    ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
                    : 'Student';
                  const newProfile: StudentProfile = {
                    ...profile,
                    uid,
                    email: data.email,
                    name: profile.name && profile.name !== 'Student' ? profile.name : cleanName,
                    registrationNumber: '',
                    profilePhoto: '',
                    avatar: '',
                    isProfileComplete: false,
                    emailVerified: isVerified,
                  };
                  const savedNew = await saveStudentProfile(newProfile);
                  setProfile(savedNew);
                }

                // Requirements 3 & 10: If unverified, keep user on verify-email screen
                if (!isVerified) {
                  handleNavigate('verify-email');
                  return;
                }

                // Requirement 8: Check if user is an accredited lecturer
                try {
                  const lecturerRec = await lecturerAuthService.getLecturerByUid(uid);
                  if (lecturerRec && lecturerRec.status === 'active') {
                    handleNavigate('lecturer');
                    return;
                  }
                } catch (err) {
                  console.warn('Error checking lecturer status in login:', err);
                }

                if (saved && saved.isProfileComplete) {
                  handleNavigate('home');
                } else {
                  handleNavigate('onboarding');
                }
              }
            }}
            onGoToSignup={() => handleNavigate('signup')}
          />
        )}

        {/* Step 4: Create Account Screen */}
        {(currentScreen === 'signup' || currentScreen === 'auth') && (
          <CreateAccountScreen
            onGoogleSignIn={handleGoogleSignIn}
            onSuccess={async (data) => {
              const uid = getStudentUid(data.email, data?.uid);
              const isVerified = Boolean(data.emailVerified);
              const newProfile: StudentProfile = {
                ...profile,
                uid,
                name: data.fullName,
                email: data.email,
                registrationNumber: '',
                profilePhoto: '',
                avatar: '',
                isProfileComplete: false,
                emailVerified: isVerified,
              };
              const savedNew = await saveStudentProfile(newProfile);
              setProfile(savedNew);
              setInitialVerificationStatus({
                sent: data.verificationSent,
                error: data.verificationError,
              });
              // Requirements 1, 3, 4: Send to real verification screen
              handleNavigate('verify-email');
            }}
            onGoToLogin={() => handleNavigate('login')}
          />
        )}

        {/* Step 4.5: Real Firebase Email Verification Screen */}
        {currentScreen === 'verify-email' && (
          <VerifyEmailScreen
            email={profile.email}
            initialSent={initialVerificationStatus?.sent}
            initialError={initialVerificationStatus?.error}
            onVerified={async () => {
              const updated = { ...profile, emailVerified: true };
              setProfile(updated);
              try {
                await saveStudentProfile(updated);
              } catch (err) {
                console.warn('Failed to persist verified profile state:', err);
              }
              // Requirement 9: Allow user to continue to next part of VENUE account setup
              if (updated.isProfileComplete) {
                handleNavigate('home');
              } else {
                handleNavigate('onboarding');
              }
            }}
            onLogout={async () => {
              await handleLogout();
            }}
          />
        )}

        {/* Step 5 - 7: Multi-Step University, Programme & Year Onboarding */}
        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            initialProfile={profile}
            onComplete={async (updated) => {
              const merged = { ...profile, ...updated };
              const saved = await saveStudentProfile(merged);
              setProfile(saved);
              if (!saved.registrationNumber || !saved.profilePhoto) {
                handleNavigate('complete-profile');
              } else {
                handleNavigate('home');
              }
            }}
            onBackToAuth={() => handleNavigate('welcome')}
          />
        )}

        {/* Step: Complete / Edit Student Academic Profile */}
        {(currentScreen === 'edit-profile' || currentScreen === 'complete-profile') && (
          <EditProfileScreen
            profile={profile}
            onSave={async (updated) => {
              const saved = await saveStudentProfile(updated);
              setProfile(saved);
              handleNavigate('profile');
            }}
            onCancel={() => {
              if (currentScreen === 'complete-profile' || !profile.isProfileComplete) {
                const completed = { ...profile, isProfileComplete: true };
                saveStudentProfile(completed).then((s) => setProfile(s));
                handleNavigate('home');
              } else if (navigationHistory.length > 0) {
                handleBack();
              } else {
                handleNavigate('profile');
              }
            }}
            isInitialSetup={currentScreen === 'complete-profile' || !profile.isProfileComplete}
          />
        )}

        {/* Step 8: Student Dashboard */}
        {currentScreen === 'home' && (
          <HomeScreen
            profile={profile}
            courses={courses}
            todayTasks={tasks}
            upcomingExams={exams}
            onNavigate={handleNavigate}
            onSelectCourse={handleSelectCourse}
          />
        )}

        {/* BottomNav Tab 2: Courses */}
        {currentScreen === 'courses' && (
          <CoursesScreen
            courses={courses}
            onSelectCourse={handleSelectCourse}
            onBackToHome={() => handleNavigate('home')}
            profile={profile}
          />
        )}

        {/* Course Detail View */}
        {currentScreen === 'course-detail' && selectedCourse && (
          <CourseDetailScreen
            course={selectedCourse}
            profile={profile}
            onBack={handleBack}
            onAskAITutor={handleAskAITutor}
            onNavigateToResources={() => handleNavigate('resources')}
            onOpenMaterialViewer={handleOpenMaterialViewer}
          />
        )}

        {/* Dedicated Full-Width In-App Material Viewer (/materials/:materialId/view) */}
        {currentScreen === 'material-viewer' && (
          <MaterialViewerScreen
            material={activeMaterial}
            materialId={activeMaterialId}
            initialPage={activeMaterialInitialPage}
            profile={profile}
            onBack={handleBack}
            onAskAITutor={(courseOrCode) => {
              if (typeof courseOrCode === 'string' && courseOrCode) {
                const found = courses.find(
                  (c) => (c.code || '').toUpperCase() === courseOrCode.toUpperCase()
                );
                if (found) setSelectedCourse(found);
              } else if (courseOrCode && typeof courseOrCode === 'object') {
                setSelectedCourse(courseOrCode);
              }
              handleNavigate('ai-tutor');
            }}
          />
        )}

        {/* BottomNav Tab 3: AI Tutor */}
        {currentScreen === 'ai-tutor' && (
          <AITutorScreen
            initialCourse={selectedCourse}
            courses={courses}
            profile={profile}
            studentName={profile.name}
            userId={profile.uid || undefined}
            onOpenMaterialViewer={handleOpenMaterialViewer}
          />
        )}

        {/* BottomNav Tab 4: Search */}
        {currentScreen === 'search' && (
          <SearchScreen
            courses={courses}
            profile={profile}
            onNavigate={handleNavigate}
            onSelectCourse={handleSelectCourse}
            onBack={handleBack}
            onOpenMaterialViewer={handleOpenMaterialViewer}
          />
        )}

        {/* BottomNav Tab 5: More Hubs */}
        {currentScreen === 'more' && (
          <MoreScreen
            profile={profile}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}

        {/* Core Dashboard Card: Resources */}
        {currentScreen === 'resources' && (
          <ResourcesScreen
            courses={courses}
            profile={profile}
            onSelectCourse={handleSelectCourse}
            onOpenMaterialViewer={handleOpenMaterialViewer}
          />
        )}

        {/* Explore / Browse Academic Materials (Temporary Session — Decoupled from Student Profile) */}
        {currentScreen === 'browse-materials' && (
          <BrowseMaterialsScreen
            profile={profile}
            onNavigate={handleNavigate}
            onSelectCourse={handleSelectCourse}
            onBack={() => {
              if (navigationHistory.length > 0) {
                handleBack();
              } else {
                handleNavigate('home');
              }
            }}
          />
        )}

        {/* Core Dashboard Card: Past Papers */}
        {currentScreen === 'past-papers' && (
          <PastPapersScreen
            profile={profile}
            courses={courses}
            onNavigate={handleNavigate}
            onBack={handleBack}
            onOpenMaterialViewer={handleOpenMaterialViewer}
          />
        )}

        {/* Core Dashboard Card: Study Planner */}
        {currentScreen === 'planner' && (
          <StudyPlannerScreen
            tasks={tasks}
            weeklyGoals={weeklyGoals}
            exams={exams}
            courses={courses}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {/* Core Dashboard Card: Quizzes */}
        {currentScreen === 'quiz' && (
          <QuizScreen questions={questions} />
        )}

        {/* Core Dashboard Card: Flashcards */}
        {currentScreen === 'flashcards' && (
          <FlashcardsScreen decks={decks} />
        )}

        {/* Core Dashboard Card: Scholarships */}
        {currentScreen === 'scholarships' && (
          <ScholarshipsScreen
            opportunities={opportunities}
            profile={profile}
            courses={courses}
          />
        )}

        {/* Core Dashboard Card: Career */}
        {currentScreen === 'career' && (
          <CareerHubScreen
            careerPaths={careerPaths}
            profile={profile}
            courses={courses}
            onNavigateToProfile={() =>
              handleNavigate(
                !profile.universityId || !profile.programmeId ? 'onboarding' : 'edit-profile'
              )
            }
          />
        )}

        {/* Core Dashboard Card: University Hub */}
        {currentScreen === 'university-hub' && (
          <UniversityHubScreen
            announcements={announcements}
            calendarEvents={calendarEvents}
            services={services}
            profile={profile}
          />
        )}

        {/* Core Dashboard Card: Community */}
        {currentScreen === 'community' && (
          <CommunityScreen
            posts={communityPosts}
            profile={profile}
            courses={courses}
            onAddPost={handleAddCommunityPost}
            onNavigateToProfile={() =>
              handleNavigate(
                !profile.universityId || !profile.programmeId ? 'onboarding' : 'edit-profile'
              )
            }
          />
        )}

        {/* Core Dashboard Card: Financial Planner */}
        {currentScreen === 'financial-planner' && (
          <FinancialPlannerScreen
            financials={financials}
            onAddTransaction={handleAddTransaction}
          />
        )}

        {/* Account Screens */}
        {currentScreen === 'profile' && (
          <ProfileScreen
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onEditProfile={() => handleNavigate('edit-profile')}
          />
        )}

        {currentScreen === 'notifications' && (
          <NotificationsScreen notifications={notifications} />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            onLogout={handleLogout}
            onResetData={handleResetData}
          />
        )}

        {/* Step: Faculty & Lecturer Profile & Identity */}
        {currentScreen === 'lecturer' && (
          <LecturerGuard
            onExitToStudent={() => {
              if (window.location.hash === '#lecturer') {
                window.history.pushState(null, '', window.location.pathname);
              }
              if (navigationHistory.length > 0) {
                handleBack();
              } else {
                handleNavigate('home');
              }
            }}
            onNavigateToAuth={() => handleNavigate('login')}
            onLogout={handleLogout}
          />
        )}

        {/* Step: VENUE Platform Administration (Super Admin Control Center) */}
        {currentScreen === 'admin' && (
          <AdminGuard
            onExitToStudent={() => {
              if (window.location.hash.startsWith('#admin')) {
                window.history.pushState(null, '', window.location.pathname);
              }
              handleNavigate('home');
            }}
            onNavigateToAuth={() => handleNavigate('login')}
            onNavigateToLecturer={() => handleNavigate('lecturer')}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      {showBottomNav && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
        />
      )}

      {/* Stage 6D: Inactive Account Interactive Access Notice Modal */}
      {showInactiveNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Interactive Learning Paused
                </h3>
                <p className="text-xs text-rose-300 font-medium">
                  Student Account Status: Inactive
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your student account has been marked as Inactive by institutional administration. While inactive, interactive study tools such as the AI Tutor, Quizzes, Flashcards, and Student Community are paused.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Data Preservation Guarantee:
              </div>
              <p className="text-[11px] leading-relaxed">
                All your enrolled courses, syllabus progress, past papers, notes, and academic GPA records are safely preserved in Firestore. Contact your university administration for reactivation.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowInactiveNoticeModal(false);
                  handleNavigate('profile');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition cursor-pointer"
              >
                View Academic Profile
              </button>
              <button
                type="button"
                onClick={() => setShowInactiveNoticeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </DeviceWrapper>
  </ThemeProvider>
  );
};

export default App;
