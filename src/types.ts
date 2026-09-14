export type ScreenId =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'signup'
  | 'auth'
  | 'verify-email'
  | 'onboarding'
  | 'home'
  | 'courses'
  | 'course-detail'
  | 'ai-tutor'
  | 'planner'
  | 'quiz'
  | 'flashcards'
  | 'scholarships'
  | 'career'
  | 'university-hub'
  | 'community'
  | 'profile'
  | 'edit-profile'
  | 'complete-profile'
  | 'financial-planner'
  | 'notifications'
  | 'settings'
  | 'resources'
  | 'browse-materials'
  | 'past-papers'
  | 'search'
  | 'gpa'
  | 'more';

export interface StudentProfile {
  uid?: string;
  name: string;
  fullName?: string;
  creatorTag: string;
  email: string;
  emailVerified?: boolean;
  avatar: string;
  profilePhoto?: string;
  photoURL?: string;
  country: string;
  university: string;
  universityName?: string;
  universityShort: string;
  universityId?: string;
  college: string;
  collegeId?: string;
  institutionId?: string;
  institutionName?: string;
  academicUnitId?: string;
  academicUnitType?: string;
  department?: string;
  departmentName?: string;
  departmentId?: string;
  programme: string;
  programmeName?: string;
  programmeShort: string;
  programmeId?: string;
  academicYear: string;
  yearOfStudy: string;
  semester: string;
  registrationNumber: string;
  gpa: number;
  gpaMax: number;
  creditsCompleted: number;
  totalCredits: number;
  studyStreakDays: number;
  studyHoursThisWeek: number;
  skills: string[];
  achievements: Achievement[];
  isProfileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  earnedDate: string;
  unlocked: boolean;
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'notes' | 'slides' | 'past-paper' | 'syllabus' | 'reference';
  fileSize: string;
  uploadDate: string;
  downloadUrl?: string;
  readTime?: string;
  summary?: string;
}

export interface SyllabusTopic {
  week: number;
  title: string;
  description: string;
  completed: boolean;
}

// -------------------------------------------------------------
// Official Academic Catalogue Architecture Models
// -------------------------------------------------------------

export interface UniversityRecord {
  id: string;
  name: string;
  shortName: string;
  country: string;
  status?: 'active' | 'inactive' | 'coming_soon';
  campus?: string;
  established?: string;
  badge?: string;
  academicYear?: string;
  verified: boolean;
  source: string;
  sourceType?: string;
  academicUnitCount?: number;
  programmeCount?: number;
}

export type AcademicUnitType =
  | 'College'
  | 'School'
  | 'Institute'
  | 'Centre'
  | 'Campus'
  | 'Constituent College';

export interface AcademicUnitRecord {
  id: string;
  universityId: string;
  name: string;
  type: AcademicUnitType;
  shortName?: string;
  abbreviation?: string;
  sourceType?: string;
  academicYear?: string;
  verified: boolean;
  source: string;
  departmentCount?: number;
}

export interface DepartmentRecord {
  id: string;
  universityId: string;
  academicUnitId: string;
  name: string;
  shortName?: string;
  verified: boolean;
  source: string;
  programmeCount?: number;
}

export interface ProgrammeRecord {
  id: string;
  universityId: string;
  academicUnitId: string;
  departmentId: string;
  name: string;
  shortName?: string;
  awardLevel: string;
  durationYears: number;
  studyMode: 'Full-Time' | 'Part-Time' | 'Evening' | 'Online';
  academicYear: string;
  verified: boolean;
  source: string;
}

export interface AcademicYearRecord {
  id: string;
  universityId: string;
  year: string; // e.g. '2023/2024'
  isCurrent: boolean;
  semesters: number[]; // [1, 2]
  verified: boolean;
  source: string;
}

export interface SemesterRecord {
  id: string;
  universityId: string;
  academicYearId?: string;
  semesterNumber: number; // 1 | 2
  label: string; // e.g. 'Semester 1'
  isCurrent?: boolean;
}

export type CourseStatus = 'Core' | 'Elective';

/**
 * Canonical Course: Single stable source of truth per accredited course code.
 * Reusable across multiple programmes without data duplication.
 */
export interface CanonicalCourseRecord {
  id: string; // e.g. 'st_113', 'cs_174', 'mt_100', 'ec_116'
  code: string; // e.g. 'ST 113'
  title: string;
  defaultCredits: number;
  universityId?: string;
  academicUnitId?: string;
  departmentId?: string;
  verified: boolean;
  source: string;
  sourceType?: string;
  academicYear?: string;
}

/**
 * ProgrammeCourse Relationship: Stores curriculum placement specific to a degree programme.
 */
export interface ProgrammeCourseRecord {
  id: string; // composite e.g. 'ba-stats_st-113'
  programmeId: string;
  courseId: string; // foreign key to canonical course
  code: string;
  title: string;
  credits: number;
  yearOfStudy: number;
  semester: number;
  status: CourseStatus;
  academicUnitId?: string;
  departmentId?: string;
  universityId: string;
  verified: boolean;
  source: string;
  sourceType?: string;
  academicYear?: string;
}

export interface CourseRecord {
  id: string; // Stable course id
  courseId?: string; // Stable alias to id
  universityId: string;
  institutionId?: string; // College/School/Institute identifier
  academicUnitId?: string;
  departmentId?: string;
  programmeId: string;
  canonicalCourseId?: string;
  code: string; // Official course code
  courseCode?: string; // Stable alias to code
  title: string; // Course name/title
  courseName?: string; // Stable alias to title
  credits: number;
  yearOfStudy: number | string;
  semester: number | string;
  status: CourseStatus;
  academicYear?: string;
  verified: boolean;
  source: string;
  sourceType?: string;
}

// ============================================================================
// REAL GPA SYSTEM & STUDENT RESULTS ARCHITECTURE
// ============================================================================

export interface StudentResult {
  id?: string; // Unique deterministic result identifier: res_{courseId}_{semester}_{academicYear}
  uid: string; // Authenticated Firebase user UID
  courseId: string; // Stable course ID from catalogue or custom ID
  courseCode: string; // e.g. MT 100
  courseName: string; // e.g. Basic Mathematics
  credits: number; // e.g. 12 or 3
  grade: string; // e.g. A, B+, B, C, D, E
  gradePoint: number; // e.g. 5.0, 4.0, 3.0, 2.0, 1.0, 0.0
  semester: string; // e.g. "Semester 1" or "1"
  academicYear: string; // e.g. "2025/2026"
  yearOfStudy?: string; // e.g. "Year 1" or "1"
  createdAt: string; // ISO 8601 creation timestamp
  updatedAt: string; // ISO 8601 update timestamp
}

export interface GradeScaleEntry {
  grade: string;
  gradePoint: number;
  description: string;
  percentageRange?: string;
  isPass: boolean;
}

export interface DegreeClassification {
  name: string; // e.g. "First Class Honours", "Upper Second Class"
  minGpa: number;
  maxGpa: number;
  badgeColor: string;
  description: string;
}

export interface UniversityGradingSystem {
  id: string;
  universityId: string;
  name: string;
  scaleType: '5.0' | '4.0';
  maxGpa: number;
  passGpa: number;
  grades: GradeScaleEntry[];
  classifications: DegreeClassification[];
}

export interface SemesterGpaSummary {
  key: string; // Composite key: e.g. "2025/2026_Semester 1"
  academicYear: string;
  semester: string;
  yearOfStudy?: string;
  totalCredits: number;
  totalWeightedPoints: number;
  gpa: number;
  resultsCount: number;
  results: StudentResult[];
}

export interface CumulativeGpaSummary {
  totalCredits: number;
  totalWeightedPoints: number;
  cgpa: number;
  maxGpa: number;
  scaleType: '5.0' | '4.0';
  classification: DegreeClassification;
  currentSemesterGpa: number;
  semesters: SemesterGpaSummary[];
  totalCoursesCount: number;
}

export interface CataloguePagination<T> {
  items: T[];
  hasMore: boolean;
  total?: number;
  lastDocId?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  year?: 1 | 2 | 3;
  semester?: 1 | 2;
  type?: 'Core' | 'Elective';
  department: string;
  universityId?: string;
  programmeId?: string;
  instructor: {
    name: string;
    title: string;
    office: string;
  };
  progress: number;
  gradeTarget: string;
  accentColor: string;
  overview: string;
  syllabus: SyllabusTopic[];
  materials: CourseMaterial[];
  pastPapersCount: number;
  recommendedResources: {
    title: string;
    author: string;
    edition?: string;
    type: string;
    description: string;
  }[];
}

export interface StudyTask {
  id: string;
  title: string;
  courseCode: string;
  date: string;
  timeSlot: string;
  estimatedMinutes: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface WeeklyGoal {
  id: string;
  title: string;
  targetHours: number;
  currentHours: number;
  category: string;
}

export interface ExamCountdown {
  id: string;
  examName: string;
  courseCode: string;
  date: string;
  daysRemaining: number;
  venue: string;
  sessionTime: string;
}

export interface AIChartData {
  type: 'line' | 'bar' | 'scatter' | 'area' | 'pie';
  title: string;
  description?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: Array<Record<string, any>>;
  series?: Array<{ dataKey: string; name: string; color?: string }>;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  steps?: string[];
  formula?: string;
  courseContext?: string;
  suggestions?: string[];
  isError?: boolean;
  originalQuery?: string;
  imageUrl?: string;
  imageMimeType?: string;
  chart?: AIChartData;
  diagramSvg?: string;
  detectedLanguage?: string;
  isImageGeneration?: boolean;
  generatedImageUrl?: string;
  imageGenStatus?: 'loading' | 'success' | 'unavailable' | 'error';
  imageGenPrompt?: string;
}

export interface QuizQuestion {
  id: string;
  courseCode: string;
  topic: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  concept: string;
  difficultyRating?: 'easy' | 'medium' | 'hard';
}

export interface FlashcardDeck {
  id: string;
  title: string;
  courseCode: string;
  cardsCount: number;
  color: string;
  cards: Flashcard[];
}

export interface OpportunityItem {
  id: string;
  title: string;
  organization: string;
  type: 'Scholarship' | 'Internship' | 'Fellowship';
  coverage: string;
  location: string;
  deadline: string;
  daysRemaining: number;
  eligibility: string;
  description: string;
  tags: string[];
  applyUrl: string;
  isSampleData: boolean;
}

export interface CareerPath {
  id: string;
  title: string;
  matchScore: number;
  overview: string;
  averageSalaryRange: string;
  keyResponsibilities: string[];
  topSkillsRequired: string[];
  recommendedElectives: string[];
  certifications: string[];
  industryDemand: 'Very High' | 'High' | 'Growing';
}

export interface UniversityAnnouncement {
  id: string;
  title: string;
  department: string;
  date: string;
  urgent: boolean;
  content: string;
  targetGroup: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  category: 'Examination' | 'Registration' | 'Holiday' | 'Lecture';
  description: string;
}

export interface StudentService {
  id: string;
  name: string;
  location: string;
  contactEmail: string;
  hours: string;
  description: string;
  category: 'Academic' | 'Welfare' | 'Health' | 'Library';
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorRole: string;
  isVerifiedStudent: boolean;
  timestamp: string;
  category: 'Course Doubts' | 'Study Groups' | 'Exam Prep' | 'Career & Tech' | 'General';
  title: string;
  content: string;
  courseTag?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  repliesCount: number;
  replies: {
    id: string;
    authorName: string;
    authorRole: string;
    timestamp: string;
    text: string;
    upvotes: number;
  }[];
}

export interface FinancialTransaction {
  id: string;
  title: string;
  amount: number;
  category: 'Meals' | 'Accommodation' | 'Books & Print' | 'Data Bundles' | 'Transport' | 'Personal';
  date: string;
  type: 'expense' | 'income';
}

export interface FinancialCategory {
  name: string;
  spent: number;
  color: string;
}

export interface FinancialRecord {
  totalStipend: number;
  spentTotal: number;
  currency: string;
  categories: FinancialCategory[];
  transactions: FinancialTransaction[];
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: 'Accommodation' | 'Food & Groceries' | 'Books & Stationery' | 'Transport' | 'Data & Internet' | 'Other';
  date: string;
  type: 'expense' | 'income';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category?: 'academic' | 'exam' | 'community' | 'scholarship' | 'system';
  type?: 'academic' | 'deadline' | 'community' | 'system';
  targetScreen?: ScreenId;
}
