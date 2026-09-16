import React, { useState, useEffect } from 'react';
import { ScreenId, Course, StudentProfile, StudyTask, FinancialTransaction, CommunityPost } from './types';
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
} from './services/firebase';
import { firestoreCatalogueService } from './services/firestoreCatalogueService';
import { courseCurriculumService } from './services/courseCurriculumService';

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
import { ThemeProvider } from './context/ThemeContext';

export const App: React.FC = () => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('splash');
  const [navigationHistory, setNavigationHistory] = useState<ScreenId[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Application Data State
  const [profile, setProfile] = useState<StudentProfile>(mockStudentProfile);
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [tasks, setTasks] = useState<StudyTask[]>(mockStudyTasks);
  const [weeklyGoals, setWeeklyGoals] = useState(mockWeeklyGoals);
  const [exams, setExams] = useState(mockExams);
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
  const [initialVerificationStatus, setInitialVerificationStatus] = useState<{
    sent?: boolean;
    error?: string | null;
  } | null>(null);

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
            setProfile({ ...loaded, emailVerified: isVerified });
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

  // Navigation Handlers
  const handleNavigate = (screen: ScreenId) => {
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

    if (screen !== currentScreen) {
      setNavigationHistory((prev) => [...prev, currentScreen]);
      setCurrentScreen(screen);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
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

  const handleAskAITutor = (course: Course) => {
    setSelectedCourse(course);
    handleNavigate('ai-tutor');
  };

  // State Mutators
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (newTask: StudyTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
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
    setCourses(mockCourses);
    setTasks(mockStudyTasks);
    setFinancials(mockFinancials);
    setCommunityPosts(mockCommunityPosts);
    setNotifications(mockNotifications);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('venue_current_student_uid');
      sessionStorage.removeItem('venue_current_email');
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
  const authScreens = ['splash', 'welcome', 'login', 'signup', 'auth', 'verify-email', 'onboarding'];
  const showHeader = !authScreens.includes(currentScreen);
  const showBottomNav = !authScreens.includes(currentScreen);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <ThemeProvider initialTheme={profile.themePreference}>
      <DeviceWrapper>
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
            onBack={handleBack}
            onAskAITutor={handleAskAITutor}
          />
        )}

        {/* BottomNav Tab 3: AI Tutor */}
        {currentScreen === 'ai-tutor' && (
          <AITutorScreen
            initialCourse={selectedCourse}
            courses={courses}
            studentName={profile.name}
            userId={profile.uid || undefined}
          />
        )}

        {/* BottomNav Tab 4: Search */}
        {currentScreen === 'search' && (
          <SearchScreen
            courses={courses}
            onNavigate={handleNavigate}
            onSelectCourse={handleSelectCourse}
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
            onSelectCourse={handleSelectCourse}
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
            onNavigate={handleNavigate}
            onAskAITutor={(topic) => handleNavigate('ai-tutor')}
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
          <ScholarshipsScreen opportunities={opportunities} />
        )}

        {/* Core Dashboard Card: Career */}
        {currentScreen === 'career' && (
          <CareerHubScreen careerPaths={careerPaths} />
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
            onAddPost={handleAddCommunityPost}
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
      </main>

      {/* Persistent Bottom Navigation Bar */}
      {showBottomNav && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
        />
      )}
    </DeviceWrapper>
  </ThemeProvider>
  );
};

export default App;
