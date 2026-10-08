import {
  Course,
  StudentProfile,
  StudyTask,
  WeeklyGoal,
  ExamCountdown,
  QuizQuestion,
  FlashcardDeck,
  Opportunity,
  CareerPath,
  Announcement,
  CalendarEvent,
  CampusEvent,
  StudentService,
  UniversityService,
  CommunityPost,
  FinancialOverview,
  AppNotification,
  StudyDocument,
  AIQuizSession,
} from '../types';

/**
 * Clean fallback defaults — all mock course data, fabricated lecturer names,
 * fake material counts, and old Mathematics & Statistics demo objects have been removed.
 * Real course, lecturer, and material data is loaded from the canonical catalogue and Firestore.
 */
export const SAMPLE_COURSES: Course[] = [];

export const mockCourses: Course[] = [];

export const mockStudentProfile: StudentProfile = {
  uid: '',
  name: '',
  email: '',
  registrationNumber: '',
  university: '',
  universityShort: '',
  universityId: '',
  college: '',
  academicUnitId: '',
  department: '',
  departmentId: '',
  programme: '',
  programmeId: '',
  yearOfStudy: '',
  semester: '',
  gpa: 0,
  targetGpa: 4.5,
  creditsCompleted: 0,
  totalCreditsRequired: 360,
  streakDays: 0,
  studyHoursThisWeek: 0,
  avatarUrl: '',
  onboardingCompleted: false,
};

export const mockStudyTasks: StudyTask[] = [];
export const mockTasks: StudyTask[] = [];

export const mockWeeklyGoals: WeeklyGoal[] = [];

export const mockExams: ExamCountdown[] = [];

export const mockQuizQuestions: QuizQuestion[] = [];

export const mockFlashcardDecks: FlashcardDeck[] = [];

export const mockOpportunities: Opportunity[] = [];

export const mockCareerPaths: CareerPath[] = [];

export const mockAnnouncements: Announcement[] = [];

export const mockCalendarEvents: CalendarEvent[] = [];
export const mockEvents: CampusEvent[] = [];

export const mockStudentServices: StudentService[] = [
  {
    id: '1',
    name: 'ARIS 3 Portal',
    category: 'Academic Registration',
    description: 'Course registration, examination results, tuition fee status, and official academic records.',
    contact: 'aris@udsm.ac.tz',
    location: 'Online Portal (aris3.udsm.ac.tz)',
    hours: '24/7 Online',
    url: 'https://aris3.udsm.ac.tz/',
  },
  {
    id: '2',
    name: 'UDSM LMS (Moodle)',
    category: 'E-Learning',
    description: 'Access official course pages, lecture slides, assignments, and online assessments.',
    contact: 'lms@udsm.ac.tz',
    location: 'Online Portal (lms.udsm.ac.tz)',
    hours: '24/7 Online',
    url: 'https://lms.udsm.ac.tz/',
  },
  {
    id: '3',
    name: 'Dr. Wilbert Chagula Library',
    category: 'Library & Research',
    description: 'Digital repository, e-journals, past examination papers, and study space booking.',
    contact: 'library@udsm.ac.tz',
    location: 'Mlimani Main Campus',
    hours: 'Mon–Sat: 08:00 – 22:00',
    url: 'https://library.udsm.ac.tz/',
  },
];

export const mockServices: UniversityService[] = [
  {
    id: '1',
    name: 'ARIS 3 Portal',
    description: 'Course registration, examination results, tuition fee status, and official academic records.',
    iconName: 'GraduationCap',
    url: 'https://aris3.udsm.ac.tz/',
  },
  {
    id: '2',
    name: 'UDSM LMS (Moodle)',
    description: 'Access official course pages, lecture slides, assignments, and online assessments.',
    iconName: 'BookOpen',
    url: 'https://lms.udsm.ac.tz/',
  },
  {
    id: '3',
    name: 'Dr. Wilbert Chagula Library',
    description: 'Digital repository, e-journals, past examination papers, and study space booking.',
    iconName: 'Library',
    url: 'https://library.udsm.ac.tz/',
  },
];

export const mockCommunityPosts: CommunityPost[] = [];

export const mockFinancials: FinancialOverview = {
  semesterBudget: 0,
  spentTotal: 0,
  currency: 'TZS',
  categories: [],
  transactions: [],
  savingTips: [],
};

export const mockNotifications: AppNotification[] = [];

export const mockStudyDocuments: StudyDocument[] = [];

export const mockAIQuizzes: AIQuizSession[] = [];
