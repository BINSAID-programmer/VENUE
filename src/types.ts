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
  | 'material-viewer'
  | 'past-papers'
  | 'search'
  | 'gpa'
  | 'more'
  | 'admin'
  | 'lecturer';

export type UserRole =
  | 'super_admin'
  | 'university_admin'
  | 'college_admin'
  | 'department_moderator'
  | 'verified_lecturer'
  | 'lecturer'
  | 'student';

export interface AdminUserRecord {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  status: 'active' | 'suspended';
  universityId?: string;
  academicUnitId?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt?: string;
  assignedBy?: string;
}

export type AdminSectionId =
  | 'dashboard'
  | 'catalogue'
  | 'materials'
  | 'lecturers'
  | 'students'
  | 'announcements'
  | 'analytics'
  | 'audit-logs'
  | 'settings';

export interface AdminPlatformStats {
  universities: number;
  academicUnits: number;
  departments: number;
  programmes: number;
  courses: number;
  materials: number;
  students: number;
  lecturers: number;
  canonicalCourses: number;
  catalogueCourses: number;
  lastUpdated: string;
}

export interface CountryRecord {
  id: string;
  name: string;
  code: string;
  flag: string;
  dialCode: string;
  phoneFormatPlaceholder?: string;
  institutionCount?: number;
  currency?: string;
  region?: string;
  status?: 'active' | 'coming_soon';
  verified?: boolean;
}

export interface StudentProfile {
  uid?: string;
  name: string;
  fullName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phoneNumber?: string;
  creatorTag: string;
  email: string;
  emailVerified?: boolean;
  avatar: string;
  profilePhoto?: string;
  photoURL?: string;
  country: string;
  countryId?: string;
  countryName?: string;
  university: string;
  universityName?: string;
  universityShort: string;
  universityId?: string;
  college: string;
  collegeId?: string;
  institutionId?: string;
  institutionName?: string;
  academicUnitId?: string;
  academicUnitName?: string;
  academicUnitType?: string;
  department?: string;
  departmentName?: string;
  departmentId?: string;
  programme: string;
  programmeName?: string;
  programmeShort: string;
  programmeId?: string;
  programmeCode?: string;
  degreeLevel?: string;
  programmeDurationYears?: number;
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
  themePreference?: 'dark' | 'light' | 'system';
  isProfileComplete?: boolean;
  status?: 'active' | 'inactive';
  accountStatus?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  preferences?: Record<string, any>;
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
  countryId?: string;
  flag?: string;
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
  description?: string;
  status?: 'active' | 'archived' | 'inactive';
  active?: boolean;
  archived?: boolean;
  sourceType?: string;
  academicYear?: string;
  verified: boolean;
  source: string;
  departmentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentRecord {
  id: string;
  universityId: string;
  academicUnitId: string;
  name: string;
  shortName?: string;
  code?: string;
  description?: string;
  status?: 'active' | 'archived' | 'inactive';
  active?: boolean;
  archived?: boolean;
  verified: boolean;
  source: string;
  programmeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type DegreeLevel =
  | 'Certificate'
  | 'Diploma'
  | "Bachelor's Degree"
  | "Master's Degree"
  | 'PhD'
  | string;

export interface ProgrammeSemesterConfig {
  semesterNumber: number; // e.g. 1, 2, 3
  label: string; // e.g. 'Semester 1', 'Semester 2', 'Field Practical'
}

export interface ProgrammeYearConfig {
  yearNumber: number; // e.g. 1, 2, 3, 4, 5
  label: string; // e.g. 'Year 1'
  semesters: ProgrammeSemesterConfig[];
}

export interface ProgrammeRecord {
  id: string;
  universityId: string;
  academicUnitId: string;
  collegeId?: string; // Canonical alias to parent academic unit
  schoolId?: string; // Canonical alias to parent academic unit
  instituteId?: string; // Canonical alias to parent academic unit
  departmentId: string;
  name: string;
  code?: string;
  shortName?: string;
  description?: string;
  degreeLevel?: DegreeLevel;
  awardLevel?: string;
  durationYears: number;
  yearsStructure?: ProgrammeYearConfig[];
  status?: 'active' | 'archived' | 'inactive';
  active?: boolean;
  archived?: boolean;
  studyMode?: 'Full-Time' | 'Part-Time' | 'Evening' | 'Online' | string;
  academicYear?: string;
  verified?: boolean;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgrammeSemesterCurriculum {
  semesterNumber: number; // 1 | 2
  semesterLabel: string; // e.g. 'Semester 1'
  courses: CourseRecord[];
  totalCredits: number;
  coreCredits: number;
  electiveCredits: number;
}

export interface ProgrammeYearCurriculum {
  yearNumber: number; // 1, 2, 3, 4, 5
  yearLabel: string; // e.g. 'Year 1'
  semesters: ProgrammeSemesterCurriculum[];
  totalCredits: number;
}

export interface ProgrammeCurriculumStructure {
  programme: ProgrammeRecord;
  universityId: string;
  academicUnitId: string;
  departmentId: string;
  durationYears: number;
  degreeLevel: string;
  years: ProgrammeYearCurriculum[];
  totalCoursesCount: number;
  totalCredits: number;
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
  courseCode?: string;
  title: string;
  courseTitle?: string;
  defaultCredits: number;
  credits?: number;
  description?: string;
  status?: 'active' | 'archived' | 'inactive' | string;
  active?: boolean;
  archived?: boolean;
  universityId?: string;
  academicUnitId?: string;
  departmentId?: string;
  verified: boolean;
  source: string;
  sourceType?: string;
  academicYear?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ProgrammeCourse Relationship: Stores curriculum placement specific to a degree programme.
 */
export interface ProgrammeCourseRecord {
  id: string; // composite e.g. 'ba-stats_st-113'
  programmeId: string;
  courseId: string; // foreign key to canonical course
  code: string;
  courseCode?: string;
  title: string;
  courseTitle?: string;
  credits: number;
  yearOfStudy: number;
  year?: number | string;
  semester: number;
  status: CourseStatus;
  courseType?: string;
  academicUnitId?: string;
  departmentId?: string;
  offeringDepartmentId?: string;
  offeringDepartmentName?: string;
  universityId: string;
  verified: boolean;
  source: string;
  sourceType?: string;
  academicYear?: string;
  electiveRule?: string;
  choiceConstraint?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseRecord {
  id: string; // Stable course id
  courseId?: string; // Stable alias to id
  universityId: string;
  collegeId?: string; // Academic Unit / College identifier
  schoolId?: string; // School identifier
  instituteId?: string; // Institute identifier
  institutionId?: string; // College/School/Institute identifier
  academicUnitId?: string;
  departmentId?: string;
  offeringDepartmentId?: string;
  offeringDepartmentName?: string;
  programmeId: string;
  canonicalCourseId?: string;
  code: string; // Official course code
  courseCode?: string; // Stable alias to code
  title: string; // Course name/title
  courseTitle?: string; // Stable alias to title
  courseName?: string; // Stable alias to title
  description?: string;
  credits: number;
  yearOfStudy: number | string;
  year?: number | string;
  semester: number | string;
  status: CourseStatus;
  courseType?: 'Core' | 'Elective' | 'Optional' | string;
  recordStatus?: 'active' | 'archived' | 'inactive';
  active?: boolean;
  archived?: boolean;
  academicYear?: string;
  verified: boolean;
  source?: string;
  sourceType?: string;
  electiveRule?: string;
  choiceConstraint?: string;
  note?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// ACADEMIC MATERIALS MANAGEMENT ARCHITECTURE (STAGE 4A)
// ============================================================================

export type AcademicMaterialType =
  | 'Lecture Notes'
  | 'Handouts'
  | 'Slides'
  | 'Past Papers'
  | 'Assignments'
  | 'Solutions'
  | 'Tutorials'
  | 'Reference Materials'
  | 'Other';

export type MaterialStatus = 'active' | 'draft' | 'archived';

export interface MaterialUploaderInfo {
  uid: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface AcademicMaterialRecord {
  id: string;
  materialId?: string;
  title: string;
  description?: string;
  materialType: AcademicMaterialType;
  fileName: string;
  fileUrl: string; // URL, storage reference or cloud document link
  storagePath?: string; // Firebase Storage canonical reference path
  fileSize: string; // e.g. "2.4 MB"
  mimeType: string; // e.g. "application/pdf"
  uploadedBy: MaterialUploaderInfo | string;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  status: MaterialStatus;

  // Strict Academic Placement References (referencing existing catalogue records)
  universityId: string;
  academicUnitId: string;
  departmentId: string;
  programmeId: string;
  yearId: number | string;
  semesterId: number | string;
  courseId: string;
  canonicalCourseId?: string;
  uploadedByUid?: string;

  // Optional contextual display caches for performant UI rendering
  courseCode?: string;
  courseTitle?: string;
  programmeName?: string;
  departmentName?: string;
  academicUnitName?: string;
  universityName?: string;
  uploaderRole?: 'admin' | 'lecturer' | string;
  lecturerId?: string;
}

// ============================================================================
// LECTURER MANAGEMENT ARCHITECTURE (STAGE 5A)
// ============================================================================

export type LecturerStatus = 'active' | 'inactive';
export type LecturerVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface LecturerCreatorInfo {
  uid: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface LecturerRecord {
  id: string; // e.g. "lec_udsm_dept_12345"
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  staffId?: string; // Institutional payroll or employee identifier (e.g. "UDSM/ST/2023/042")
  title?: string; // Academic salutation (e.g. "Prof.", "Dr.", "Mr.", "Ms.", "Mrs.")
  position?: string; // Faculty rank (e.g. "Professor", "Associate Professor", "Senior Lecturer", "Lecturer", "Assistant Lecturer", "Tutorial Assistant")
  bio?: string;
  office?: string;
  status: LecturerStatus;
  verificationStatus: LecturerVerificationStatus;

  // Account identity & Auth linking (Stage 5B)
  userId?: string; // Firebase Authentication UID
  accountLinked?: boolean;
  linkedAt?: string;
  invitationCode?: string; // Secure invitation / linking token
  role?: 'lecturer';

  // Strict Academic Placement References (linking to existing catalogue records)
  universityId: string;
  academicUnitId: string;
  departmentId: string;

  // Optional contextual display caches for fast responsive rendering without N+1 queries
  universityName?: string;
  academicUnitName?: string;
  departmentName?: string;

  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  createdBy?: LecturerCreatorInfo | string;
}

// ============================================================================
// LECTURER COURSE ASSIGNMENT ARCHITECTURE (STAGE 5C)
// ============================================================================

export interface LecturerCourseAssignment {
  id: string; // e.g. "lca_lec123_st113_bcastat_y1_s1"
  lecturerId: string; // Foreign key to lecturers/{lecturerId}
  userId?: string; // Firebase Auth UID of the linked lecturer (if linked)
  courseId: string; // Foreign key to canonical course (e.g. "st_113")
  courseCode: string; // Canonical course code (e.g. "ST 113")
  courseTitle: string; // Canonical course title (e.g. "Basic Statistics")
  credits: number;

  // Teaching context placement
  universityId: string;
  academicUnitId?: string;
  academicUnitName?: string;
  departmentId?: string;
  departmentName?: string;
  programmeId?: string;
  programmeName?: string;
  yearOfStudy?: number;
  semester?: number;

  status: 'active' | 'inactive';
  assignedBy?: {
    uid: string;
    email?: string;
  } | string;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface AssignCourseInput {
  lecturerId: string;
  userId?: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  universityId: string;
  academicUnitId?: string;
  academicUnitName?: string;
  departmentId?: string;
  departmentName?: string;
  programmeId?: string;
  programmeName?: string;
  yearOfStudy?: number;
  semester?: number;
}

// ============================================================================
// REAL GPA SYSTEM & STUDENT RESULTS ARCHITECTURE
// ============================================================================

export interface StudentResult {
  id?: string; // Unique deterministic result identifier: res_{courseId}_{semester}_{academicYear}
  uid: string; // Authenticated Firebase user UID
  studentUid?: string; // Canonical alias to uid
  universityId?: string;
  programmeId?: string;
  courseId: string; // Stable course ID from catalogue or custom ID
  courseCode: string; // e.g. MT 100
  courseName: string; // e.g. Basic Mathematics
  credits: number; // e.g. 12 or 3
  grade: string; // e.g. A, B+, B, C, D, E
  gradePoint: number; // e.g. 5.0, 4.0, 3.0, 2.0, 1.0, 0.0
  qualityPoints: number; // Quality Points = credits * gradePoint
  semester: string; // e.g. "Semester 1" or "1"
  academicYear: string; // e.g. "2025/2026"
  yearOfStudy?: string; // e.g. "Year 1" or "1"
  attemptNumber?: number; // 1, 2, ... for repeated attempts
  isRepeated?: boolean;
  isIncludedInGpa?: boolean; // Whether active and counted towards GPA/CGPA
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
  totalCredits: number; // Sum of credits for graded courses included in GPA
  totalQualityPoints: number; // Sum of (credits * gradePoint)
  totalWeightedPoints: number; // Maintained for backwards compatibility
  gpa: number;
  isGraded: boolean;
  resultsCount: number;
  gradedCoursesCount: number;
  results: StudentResult[];
}

export interface CumulativeGpaSummary {
  totalCredits: number;
  totalQualityPoints: number;
  totalWeightedPoints: number; // Maintained for backwards compatibility
  cgpa: number;
  maxGpa: number;
  scaleType: '5.0' | '4.0';
  classification: DegreeClassification;
  currentSemesterGpa: number;
  semesters: SemesterGpaSummary[];
  totalCoursesCount: number;
  totalGradedCoursesCount: number;
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
  courseCode?: string;
  title: string;
  courseName?: string;
  credits: number;
  year?: number; // Flexible year of study (1, 2, 3, 4, 5+)
  yearOfStudy?: number | string;
  semester?: number; // 1, 2
  type?: 'Core' | 'Elective' | 'Optional' | string;
  courseType?: 'Core' | 'Elective' | 'Optional' | string;
  department: string;
  academicUnitId?: string;
  collegeId?: string;
  schoolId?: string;
  instituteId?: string;
  universityId?: string;
  programmeId?: string;
  programmeName?: string;
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
  active?: boolean;
  verified?: boolean;
  specialisation?: string;
  specialisationId?: string;
  subStream?: string;
  subStreamSlug?: string;
  electiveRule?: string;
  choiceConstraint?: string;
  note?: string;
  notes?: string;
  source?: string;
  sourceType?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface AIStudyTurnMetadata {
  lessonSection?: string;
  sectionIndex?: number;
  totalSections?: number;
  learningObjective?: string;
  checkpointQuestion?: string;
  adaptiveAdjustment?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  role?: 'user' | 'assistant';
  text: string;
  content?: string;
  timestamp: string;
  steps?: string[];
  formula?: string;
  courseContext?: string;
  suggestions?: string[];
  isError?: boolean;
  originalQuery?: string;
  imageUrl?: string;
  imageMimeType?: string;
  imageName?: string;
  imageSize?: string;
  imageAttachment?: {
    name?: string;
    size?: string;
    mimeType?: string;
    dataUrl?: string;
  };
  chart?: AIChartData;
  diagramSvg?: string;
  detectedLanguage?: string;
  isImageGeneration?: boolean;
  generatedImageUrl?: string;
  imageGenStatus?: 'loading' | 'success' | 'unavailable' | 'error';
  imageGenPrompt?: string;
  referencedMaterials?: Array<{
    materialId: string;
    title: string;
    materialType: string;
    courseCode: string;
    courseTitle?: string;
    uploaderRole?: string;
    uploaderName?: string;
    pageReferences?: number[];
    chunksCount?: number;
  }>;
  groundedInMaterials?: boolean;
  studyMetadata?: AIStudyTurnMetadata;
}

export interface AIChatConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: AIMessage[];
  lastMessagePreview?: string;
  messageCount: number;
  courseContext?: string;
  languagePreference?: string;
  pinned?: boolean;
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

// Stage 7A & 7B: Centralized VENUE Announcements System
export type AnnouncementType = 'General' | 'Academic' | 'Important' | 'Event' | 'Maintenance';
export type AnnouncementStatus = 'Draft' | 'Published' | 'Archived';
export type AnnouncementPriority = 'normal' | 'important';
export type AnnouncementAudienceType = 'everyone' | 'targeted';

export interface AnnouncementRecord {
  id: string;
  announcementId: string;
  title: string;
  content: string;
  summary?: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  priority?: AnnouncementPriority;

  // Stage 7B: Academic Audience Targeting
  audienceType?: AnnouncementAudienceType; // 'everyone' | 'targeted'
  targetUniversityId?: string;
  targetUniversityName?: string;
  targetAcademicUnitId?: string;
  targetAcademicUnitName?: string;
  targetDepartmentId?: string;
  targetDepartmentName?: string;
  targetProgrammeId?: string;
  targetProgrammeName?: string;
  targetYearOfStudy?: string;
  targetSemester?: string;

  // Stage 7B: Expiration
  expiresAt?: string | null;

  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  publishedAt?: string | null;
}

export interface AnnouncementReadRecord {
  id: string; // `${userId}_${announcementId}`
  userId: string;
  announcementId: string;
  readAt: string;
}

export interface AnnouncementFilterOptions {
  search?: string;
  type?: AnnouncementType | 'ALL';
  status?: AnnouncementStatus | 'ALL';
  priority?: AnnouncementPriority | 'ALL';
  audience?: 'ALL' | 'everyone' | 'targeted';
}

export interface UserTargetingContext {
  userId?: string;
  role?: 'student' | 'lecturer';
  universityId?: string;
  academicUnitId?: string;
  departmentId?: string;
  programmeId?: string;
  yearOfStudy?: string;
  semester?: string;
}

export interface PaginatedAnnouncementsResponse {
  announcements: AnnouncementRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore?: boolean;
}

// Stage 8A: Admin Analytics Foundation Types
export type AnalyticsDateRange = '7d' | '30d' | '90d' | 'all';

export interface UserGrowthDataPoint {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Oct 01"
  newUsers: number;
  cumulativeUsers: number;
}

export interface UserGrowthSummary {
  range: AnalyticsDateRange;
  totalUsers: number;
  periodNewUsers: number;
  timestampCoverageCount: number;
  timestampCoveragePercent: number;
  points: UserGrowthDataPoint[];
  hasTimestampLimitation: boolean;
  limitationNote?: string;
}

export interface MaterialsAnalyticsSummary {
  totalMaterials: number;
  byType: Record<string, number>;
  byUploaderRole: {
    admin: number;
    lecturer: number;
    other: number;
  };
  periodUploadedCount: number;
}

export interface AcademicCatalogueAnalyticsSummary {
  universities: number;
  academicUnits: number;
  departments: number;
  programmes: number;
  canonicalCourses: number;
  totalCurriculumOfferings: number;
}

export interface AITutorUsageRecord {
  id: string;
  userUid: string; // Anonymous or truncated UID for privacy
  timestamp: string;
  modelId: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  status: 'success' | 'error';
  approxCostUsd?: number;
}

export interface AITutorAnalyticsSummary {
  totalRequests: number;
  periodRequests: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  approxTotalCostUsd: number;
  modelDistribution: Record<string, number>;
  recentLogs: AITutorUsageRecord[];
}

export interface AdminAnalyticsOverview {
  allTime: {
    totalUsers: number;
    totalStudents: number;
    totalLecturers: number;
    totalAdministrators: number;
    totalAcademicUnits: number;
    totalDepartments: number;
    totalProgrammes: number;
    totalCourses: number;
    totalMaterials: number;
    totalPublishedAnnouncements: number;
  };
  period: {
    range: AnalyticsDateRange;
    startDate: string;
    endDate: string;
    newUsers: number;
    newStudents: number;
    newLecturers: number;
    newMaterials: number;
    newAnnouncements: number;
    aiRequests: number;
  };
  userGrowth: UserGrowthSummary;
  materials: MaterialsAnalyticsSummary;
  catalogue: AcademicCatalogueAnalyticsSummary;
  aiTutor: AITutorAnalyticsSummary;
  lastAggregatedAt: string;
}

// Stage 8B: Advanced Analytics & User Engagement
export type AnalyticsEventType =
  | 'ai_tutor_query'
  | 'material_view'
  | 'material_download'
  | 'quiz_attempt'
  | 'planner_task'
  | 'course_view'
  | 'announcement_read';

export type AnalyticsFeatureType =
  | 'all'
  | 'ai_tutor'
  | 'materials'
  | 'study_planner'
  | 'quizzes'
  | 'courses'
  | 'announcements';

export type AnalyticsRoleFilter = 'all' | 'student' | 'lecturer' | 'admin';

export interface AnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  userId: string;
  userRole: 'student' | 'lecturer' | 'admin';
  feature: AnalyticsFeatureType;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserEngagementMetrics {
  dau: number; // Daily Active Users
  wau: number; // Weekly Active Users
  mau: number; // Monthly Active Users
  stickinessRatio: number; // DAU / MAU * 100
  newRegistrationsInPeriod: number;
  returningUsersInPeriod: number;
  activeUsersTrend: {
    date: string;
    label: string;
    activeUsers: number;
    eventsCount: number;
  }[];
  activityDefinition: string;
}

export interface FeatureUsageMetric {
  feature: AnalyticsFeatureType;
  displayName: string;
  totalEvents: number;
  periodEvents: number;
  uniqueUsers: number;
  percentageOfTotal: number;
  primaryActionName: string;
}

export interface MaterialRankingItem {
  materialId: string;
  title: string;
  courseCode?: string;
  materialType: string;
  viewsCount: number;
  downloadsCount: number;
  totalInteractions: number;
}

export interface MaterialCourseUsageItem {
  courseCode: string;
  courseName?: string;
  materialsCount: number;
  totalViews: number;
  totalDownloads: number;
}

export interface MaterialEngagementSummary {
  totalViews: number;
  totalDownloads: number;
  mostViewed: MaterialRankingItem[];
  mostDownloaded: MaterialRankingItem[];
  byCourse: MaterialCourseUsageItem[];
  byType: Record<string, { views: number; downloads: number }>;
}

export interface RetentionCohortItem {
  cohortDate: string;
  cohortSize: number;
  day1Percentage: number | null;
  day7Percentage: number | null;
  day30Percentage: number | null;
  hasSufficientData: boolean;
}

export interface UserRetentionSummary {
  overallDay1: number | null;
  overallDay7: number | null;
  overallDay30: number | null;
  cohorts: RetentionCohortItem[];
  hasSufficientHistoricalData: boolean;
  explanationNote: string;
}

export interface ExtendedAITutorAnalytics extends AITutorAnalyticsSummary {
  dailyTrends: {
    date: string;
    label: string;
    requests: number;
    tokens: number;
    costUsd: number;
    successes: number;
    failures: number;
  }[];
  averageTokensPerRequest: number;
  averagePromptTokens: number;
  averageCompletionTokens: number;
}

export interface AdminAdvancedAnalytics extends AdminAnalyticsOverview {
  engagement: UserEngagementMetrics;
  featureUsage: {
    features: FeatureUsageMetric[];
    totalFeatureInteractions: number;
  };
  materialEngagement: MaterialEngagementSummary;
  retention: UserRetentionSummary;
  extendedAiTutor: ExtendedAITutorAnalytics;
}

// Stage 9A: Audit Logs Foundation Types
export type AuditLogAction =
  // Academic Catalogue
  | 'catalogue.university.create'
  | 'catalogue.university.update'
  | 'catalogue.university.delete'
  | 'catalogue.unit.create'
  | 'catalogue.unit.update'
  | 'catalogue.unit.delete'
  | 'catalogue.department.create'
  | 'catalogue.department.update'
  | 'catalogue.department.delete'
  | 'catalogue.programme.create'
  | 'catalogue.programme.update'
  | 'catalogue.programme.delete'
  | 'catalogue.course.create'
  | 'catalogue.course.update'
  | 'catalogue.course.delete'
  | 'catalogue.programme_course.assign'
  | 'catalogue.programme_course.remove'
  | 'catalogue.curriculum.update'
  // Academic Materials
  | 'material.upload'
  | 'material.update'
  | 'material.replace'
  | 'material.delete'
  // Announcements
  | 'announcement.create'
  | 'announcement.update'
  | 'announcement.publish'
  | 'announcement.archive'
  | 'announcement.delete'
  // Faculty Lecturers
  | 'lecturer.create'
  | 'lecturer.update'
  | 'lecturer.delete'
  | 'lecturer.status_change'
  | 'lecturer.course_assign'
  | 'lecturer.course_remove'
  // Students
  | 'student.profile_update'
  | 'student.status_change'
  // Roles & Security
  | 'security.role_change'
  | 'security.permission_change'
  | 'security.access_grant';

export type AuditLogActionCategory =
  | 'all'
  | 'catalogue'
  | 'materials'
  | 'announcements'
  | 'lecturers'
  | 'students'
  | 'security';

export type AuditLogEntityType =
  | 'university'
  | 'academic_unit'
  | 'department'
  | 'programme'
  | 'canonical_course'
  | 'catalogue_course'
  | 'programme_course'
  | 'academic_material'
  | 'announcement'
  | 'lecturer'
  | 'lecturer_course'
  | 'student'
  | 'admin_user'
  | 'permission';

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole | 'system' | 'super_admin' | 'faculty_admin';
  action: AuditLogAction | string;
  entityType: AuditLogEntityType | string;
  entityId: string;
  timestamp: string; // ISO 8601
  outcome: 'success' | 'failure';
  summary: string;
  metadata?: Record<string, any>;
  source?: 'trusted_server' | 'client_service';
}

export interface AuditLogStats {
  totalRecords: number;
  recent24hCount: number;
  byCategory: Record<string, number>;
  byActor: Record<string, { count: number; name: string; role: string }>;
  byOutcome: {
    success: number;
    failure: number;
  };
}

export interface AuditLogFilterOptions {
  search?: string;
  category?: AuditLogActionCategory;
  action?: string;
  actorRole?: 'all' | 'super_admin' | 'university_admin' | 'college_admin' | 'department_moderator' | 'verified_lecturer' | 'student' | 'system';
  dateRange?: AnalyticsDateRange;
  page?: number;
  pageSize?: number;
}

export interface PaginatedAuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
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

// ============================================================================
// AI TUTOR ADVANCED LEARNING FEATURES FOUNDATION (ARCHITECTURE & DATA MODELS)
// ============================================================================

/**
 * 1. AI Tutor Mode Architecture
 */
export type AITutorModeId =
  | 'CHAT'
  | 'STUDY'
  | 'HOMEWORK'
  | 'QUIZ'
  | 'PRACTICE'
  | 'EXAM_PREP'
  | 'SUMMARIZER'
  | 'FLASHCARDS'
  | 'PERSONAL_TUTOR'
  | 'VOICE'
  | 'MULTIMODAL_SOLVER';

export type AITutorModeImplementationStatus = 'active' | 'planned' | 'disabled';

export interface AITutorModeDefinition {
  id: AITutorModeId;
  label: string;
  shortLabel: string;
  description: string;
  status: AITutorModeImplementationStatus;
  implemented: boolean;
  requiresCourseSelection: boolean;
  supportsMaterialsGrounding: boolean;
  supportsMultimodalInput: boolean;
  supportsSessionTracking: boolean;
}

/**
 * 3. Shared AI Session Model
 */
export type AILearningSessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export type AILearningDifficulty =
  | 'foundational'
  | 'intermediate'
  | 'advanced'
  | 'adaptive';

export interface AILearningSessionProgress {
  currentStep: number;
  totalSteps: number;
  completedItems: number;
  percentComplete: number;
  score?: number;
  maxScore?: number;
}

export type AIStudyLearningGoal =
  | 'understand_concept'
  | 'prepare_exam'
  | 'learn_step_by_step'
  | 'review_quickly';

export interface AILearningSession {
  sessionId: string;
  userId: string;
  mode: AITutorModeId;
  courseId: string;
  courseCode?: string;
  courseTitle?: string;
  topicId?: string;
  topic?: string;
  learningGoal?: AIStudyLearningGoal;
  currentSectionTitle?: string;
  materialIds?: string[];
  startedAt: string;
  updatedAt: string;
  status: AILearningSessionStatus;
  difficulty: AILearningDifficulty;
  language: string;
  learningObjectives: string[];
  progress: AILearningSessionProgress;
  messages?: AIMessage[];
  metadata?: Record<string, string | number | boolean>;
}

/**
 * 4. Learning Progress Model
 */
export interface AIPracticeProgressSummary {
  sessionsCompleted: number;
  totalQuestionsSolved: number;
  accuracyPercent: number;
  lastPracticedAt?: string;
}

export interface AIQuizPerformanceSummary {
  quizzesCompleted: number;
  averageScorePercent: number;
  bestScorePercent: number;
  lastQuizAt?: string;
}

export interface AIExamPreparationProgressSummary {
  mockExamsCompleted: number;
  readinessScorePercent: number;
  targetTopicsCovered: number;
  lastExamPrepAt?: string;
}

export interface AIFlashcardReviewProgressSummary {
  cardsReviewed: number;
  cardsMastered: number;
  cardsDueForReview: number;
  lastReviewedAt?: string;
}

export interface AILearningProgressRecord {
  id: string; // `${userId}_${courseId}` or courseId under student subcollection
  userId: string;
  courseId: string;
  courseCode: string;
  topicsStudied: string[];
  questionsAttempted: number;
  questionsCorrect: number;
  questionsIncorrect: number;
  weakTopics: string[];
  strongTopics: string[];
  difficultyLevel: AILearningDifficulty;
  practiceProgress: AIPracticeProgressSummary;
  quizPerformance: AIQuizPerformanceSummary;
  examPreparationProgress: AIExamPreparationProgressSummary;
  flashcardReviewProgress: AIFlashcardReviewProgressSummary;
  updatedAt: string;
}

/**
 * 5. Personalized Tutor Memory Foundation & Stage 10M Model
 */
export type AIMasteryLevel =
  | 'not_assessed'
  | 'needs_review'
  | 'developing'
  | 'proficient'
  | 'strong'
  | 'novice'
  | 'mastered';

export type AIMemoryConfidenceLevel = 'low' | 'moderate' | 'high';

export type AIPreferredExplanationLevel =
  | 'very_simple'
  | 'beginner'
  | 'intermediate'
  | 'advanced';

export type AIExplanationStyle =
  | 'step_by_step'
  | 'visual_intuitive'
  | 'rigorous_proof'
  | 'concise_formula'
  | 'worked_examples';

export type AIMemoryScopeLevel = 'course' | 'topic' | 'concept';

export type AIMemorySignalSource =
  | 'practice'
  | 'quiz'
  | 'mock_exam'
  | 'study_mode'
  | 'homework'
  | 'flashcards'
  | 'explicit_feedback';

export interface AIPersonalizedTutorMemory {
  id: string; // `${courseId}_${topicSlug}` or `${courseId}_${topicSlug}_${conceptSlug}`
  memoryId?: string;
  schemaVersion?: number;
  userId: string;
  scope?: AIMemoryScopeLevel;
  courseId: string;
  courseCode?: string;
  topicId?: string;
  topic: string;
  concept?: string;
  masteryLevel: AIMasteryLevel;
  masteryScore: number; // 0 - 100
  confidence?: number; // 0.0 - 1.0
  confidenceLevel?: AIMemoryConfidenceLevel;
  attempts?: number;
  correctCount?: number;
  incorrectCount?: number;
  hintUsage?: number;
  simplerExplanationRequests?: number;
  commonMistakes: string[];
  preferredExplanationStyle: AIExplanationStyle;
  preferredExplanationLevel?: AIPreferredExplanationLevel;
  difficultyLevel: AILearningDifficulty;
  lastSignalSource?: AIMemorySignalSource;
  lastPracticedAt: string;
  strengths: string[];
  weaknesses: string[];
  updatedAt: string;
}

export interface AIPersonalizationPreferences {
  userId: string;
  personalizationEnabled: boolean;
  preferredExplanationLevel: AIPreferredExplanationLevel;
  preferredExplanationStyle: AIExplanationStyle;
  updatedAt: string;
}

export interface AIRelevantMemoryContextSummary {
  personalizationEnabled: boolean;
  explicitOverrideDetected: boolean;
  effectiveExplanationLevel: AIPreferredExplanationLevel;
  effectiveExplanationStyle: AIExplanationStyle;
  courseCode: string;
  strongAreas: string[];
  needsReviewAreas: string[];
  developingAreas: string[];
  recurringMistakes: string[];
  relevantTopicMemories: AIPersonalizedTutorMemory[];
  compactPromptGuidance: string;
  humanReadableSummary: {
    strongAreas: string[];
    needsPractice: string[];
    preferredExplanationLabel: string;
    totalTopicsTracked: number;
    recentObservationNote?: string;
  };
}

/**
 * 6. Question / Assessment Model
 */
export type AIAssessmentQuestionType =
  | 'multiple_choice'
  | 'short_answer'
  | 'numerical'
  | 'true_false'
  | 'worked_problem'
  | 'mixed';

export interface AIAssessmentQuestionSourceRef {
  materialId: string;
  title: string;
  materialType: string;
  courseCode: string;
  courseTitle?: string;
  uploaderRole?: string;
  uploaderName?: string;
  pageReferences?: number[];
}

export interface AIAssessmentQuestion {
  questionId: string;
  courseId: string;
  courseCode?: string;
  topic: string;
  learningObjective?: string;
  difficulty: AILearningDifficulty;
  questionType: AIAssessmentQuestionType;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  numericalTolerance?: number;
  solutionSteps?: string[];
  explanation: string;
  hints?: string[];
  structuredSolution?: {
    given?: string;
    formula?: string;
    substitution?: string;
    calculation?: string;
    answer?: string;
  };
  sourceMaterialIds?: string[];
  sourcePageReferences?: number[];
  referencedMaterials?: AIAssessmentQuestionSourceRef[];
  groundedInMaterials?: boolean;
}

export interface AIAssessmentQuestionAttempt {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  hintsUsedCount?: number;
  timeSpentSeconds?: number;
  attemptedAt: string;
  feedbackTitle?: string;
  feedbackExplanation?: string;
  whatWentWrong?: string;
  correctApproach?: string;
}

export interface AIPracticeSessionData {
  practiceSessionId: string;
  userId: string;
  courseId: string;
  courseCode: string;
  courseTitle?: string;
  topic: string;
  difficultyMode: AILearningDifficulty;
  currentDifficulty: 'foundational' | 'intermediate' | 'advanced';
  questionType: AIAssessmentQuestionType;
  targetQuestionCount: number;
  language: string;
  useCourseMaterials: boolean;
  selectedMaterialId?: string;
  questionsAttempted: number;
  correctCount: number;
  incorrectCount: number;
  recentPerformance: Array<{
    questionId: string;
    topic: string;
    difficulty: 'foundational' | 'intermediate' | 'advanced';
    isCorrect: boolean;
    hintsUsed: number;
    timeSpentSeconds?: number;
  }>;
  conceptsPracticed: string[];
  conceptsNeedingReview: string[];
  conceptsAnsweredCorrectly: string[];
  hintsUsed: number;
  currentQuestion: AIAssessmentQuestion | null;
  currentAttempt?: AIAssessmentQuestionAttempt | null;
  history: Array<{
    question: AIAssessmentQuestion;
    attempt: AIAssessmentQuestionAttempt;
  }>;
  sessionStatus: 'active' | 'completed';
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  groundedInMaterials?: boolean;
  referencedMaterials?: AIAssessmentQuestionSourceRef[];
}

export interface AIQuizSessionData {
  quizId: string;
  userId: string;
  courseId: string;
  courseCode: string;
  courseTitle?: string;
  topic: string;
  quizTitle?: string;
  difficulty: AILearningDifficulty;
  language: string;
  questionCount: number;
  questionType: AIAssessmentQuestionType;
  customInstruction?: string;
  optionalInstruction?: string;
  createdAt: string;
  completedAt?: string;
  status: 'active' | 'in_progress' | 'completed';
  currentQuestionIndex: number;
  questions: AIAssessmentQuestion[];
  attempts: Record<string, AIAssessmentQuestionAttempt>;
  score?: number;
  percentage?: number;
  performanceSummary?: string;
  groundedInMaterials?: boolean;
  referencedMaterials?: AIAssessmentQuestionSourceRef[];
}

export type AIExamType = 'Final Exam' | 'Midterm' | 'Test' | 'Custom';
export type AIExamConfidenceLevel = 'low' | 'medium' | 'high';

export interface AIExamPriorityTopic {
  id: string;
  topic: string;
  subtopics: string[];
  priority: 'high' | 'medium' | 'low';
  whyItMatters: string;
  recommendedPreparationLevel: 'foundational' | 'intermediate' | 'advanced';
  keyDefinitionsAndFormulas?: string[];
  status: 'to_review' | 'in_progress' | 'completed';
  sourceReferences?: AIAssessmentQuestionSourceRef[];
}

export interface AIExamRevisionPlanDay {
  dayIndex: number;
  label: string; // e.g. "Day 1" or "Session 1"
  dateLabel?: string;
  focusTopic: string;
  subtopics: string[];
  activities: string[];
  estimatedMinutes: number;
  completed?: boolean;
}

export interface AIMockExamRecord {
  mockExamId: string;
  createdAt: string;
  completedAt?: string;
  durationMinutes: number;
  questionCount: number;
  difficulty: AILearningDifficulty;
  questionType: AIAssessmentQuestionType;
  topics: string[];
  questions: AIAssessmentQuestion[];
  answers: Record<string, string>; // questionId -> user raw answer during exam
  attempts?: Record<string, AIAssessmentQuestionAttempt>; // populated upon submission
  status: 'in_progress' | 'completed';
  score?: number;
  percentage?: number;
  strongAreas?: string[];
  needsReviewAreas?: string[];
  recommendedNextStep?: string;
  groundedInMaterials?: boolean;
  referencedMaterials?: AIAssessmentQuestionSourceRef[];
}

export interface AIExamPrepPlanData {
  examPrepId: string;
  userId: string;
  courseId: string;
  courseCode: string;
  courseTitle?: string;
  examType: AIExamType;
  customExamName?: string;
  examDate?: string; // YYYY-MM-DD optional
  confidenceLevel: AIExamConfidenceLevel;
  dailyStudyMinutes: number;
  preparationGoal: string;
  language: string;
  overviewSummary: string;
  pastPaperInsights?: string;
  adaptiveRecommendationNote?: string;
  priorityTopics: AIExamPriorityTopic[];
  revisionPlan: AIExamRevisionPlanDay[];
  mockExams: AIMockExamRecord[];
  topicsReviewed: string[];
  topicsPracticed: string[];
  quizzesCompletedCount: number;
  groundedInMaterials: boolean;
  referencedMaterials?: AIAssessmentQuestionSourceRef[];
  createdAt: string;
  updatedAt: string;
}

/**
 * STAGE 10L: AI FLASHCARDS TYPES
 */
export type AIFlashcardCardStyle =
  | 'definitions'
  | 'concepts'
  | 'formulas'
  | 'qa'
  | 'mixed';

export type AIFlashcardMasteryStatus =
  | 'unreviewed'
  | 'known'
  | 'review_again';

export interface AIFlashcardItem {
  cardId: string;
  cardNumber: number;
  style: Exclude<AIFlashcardCardStyle, 'mixed'>;
  topic: string;
  difficulty: Exclude<AILearningDifficulty, 'adaptive' | 'mixed'>;
  front: string;
  back: string;
  formulaBlock?: string;
  variableMeaning?: string;
  whenToUse?: string;
  exampleNote?: string;
  status: AIFlashcardMasteryStatus;
  reviewCount: number;
  lastReviewedAt?: string;
  sourceMaterialIds?: string[];
  sourcePageReferences?: number[];
  referencedMaterials?: AIAssessmentQuestionSourceRef[];
  groundedInMaterials?: boolean;
}

export interface AIFlashcardDeckData {
  deckId: string;
  userId: string;
  courseId: string;
  courseCode: string;
  courseTitle?: string;
  topic: string;
  deckTitle: string;
  difficulty: AILearningDifficulty;
  cardStyle: AIFlashcardCardStyle;
  language: string;
  sourceType: 'course_topic' | 'single_material' | 'multiple_materials' | 'summary';
  selectedMaterialIds?: string[];
  summarySourceText?: string;
  cards: AIFlashcardItem[];
  knownCount: number;
  reviewAgainCount: number;
  unreviewedCount: number;
  groundedInMaterials: boolean;
  referencedMaterials?: AIAssessmentQuestionSourceRef[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 7. Material-Based AI Operations
 */
export type AIMaterialOperationType =
  | 'summarize_material'
  | 'extract_key_concepts'
  | 'extract_definitions'
  | 'extract_formulas'
  | 'generate_questions'
  | 'generate_flashcards'
  | 'create_revision_plan'
  | 'create_mock_exam';

export interface AIMaterialOperationRequest {
  operation: AIMaterialOperationType;
  userId: string;
  courseId: string;
  courseCode: string;
  materialIds: string[];
  topicFocus?: string;
  difficulty?: AILearningDifficulty;
  language?: string;
  itemCount?: number;
}

export interface AIMaterialOperationResult<T = any> {
  operation: AIMaterialOperationType;
  courseId: string;
  courseCode: string;
  groundedInMaterials: boolean;
  insufficientMaterialNotice?: string;
  referencedMaterials: Array<{
    materialId: string;
    title: string;
    materialType: string;
    courseCode: string;
    pageReferences?: number[];
  }>;
  data: T;
  generatedAt: string;
}

/**
 * 8. Multimodal Input Foundation
 */
export type AIMultimodalContentType =
  | 'text'
  | 'image'
  | 'document_reference'
  | 'handwritten_math'
  | 'graph'
  | 'table'
  | 'diagram';

export interface AIMultimodalInputItem {
  id: string;
  type: AIMultimodalContentType;
  text?: string;
  mimeType?: string;
  dataUrl?: string;
  materialId?: string;
  pageNumber?: number;
  caption?: string;
}

export interface AIMultimodalInputPayload {
  mode: AITutorModeId;
  courseCode: string;
  language: string;
  items: AIMultimodalInputItem[];
}

/**
 * 9. Voice Interaction Foundation (Provider-Agnostic Abstraction)
 */
export interface AIVoiceCapabilityStatus {
  speechToTextSupported: boolean;
  textToSpeechSupported: boolean;
  isImplemented: boolean;
  providerName: string;
  unavailabilityReason?: string;
}

export interface AISpeechToTextRequest {
  audioBlob: Blob;
  mimeType: string;
  languageCode?: string;
}

export interface AISpeechToTextResult {
  transcript: string;
  confidence?: number;
  languageDetected?: string;
}

export interface AITextToSpeechRequest {
  text: string;
  languageCode?: string;
  speakingRate?: number;
}

export interface AITextToSpeechResult {
  audioUrl?: string;
  supported: boolean;
  errorMessage?: string;
}

/**
 * 14. Error / Fallback Architecture
 */
export type AITutorErrorCode =
  | 'AI_TIMEOUT'
  | 'API_FAILURE'
  | 'UNAVAILABLE_MATERIAL'
  | 'UNSUPPORTED_FILE'
  | 'UNSUPPORTED_VOICE_CAPABILITY'
  | 'MALFORMED_AI_RESPONSE'
  | 'INSUFFICIENT_CONTEXT'
  | 'UNAUTHORIZED_COURSE_ACCESS'
  | 'RATE_LIMITED'
  | 'ABORTED';

export interface AITutorNormalizedError {
  code: AITutorErrorCode;
  userMessage: string;
  retryable: boolean;
  mode?: AITutorModeId;
}

// ============================================================================
// STAGE 11B: REAL COURSE-BASED CAREER HUB + AI CAREER ADVISOR DATA MODEL
// ============================================================================

export type CareerMatchLabel =
  | 'Strong Match'
  | 'Good Match'
  | 'Possible Path'
  | 'Explore';

export type CareerDemandLevel =
  | 'Very High'
  | 'High'
  | 'Moderate'
  | 'Emerging'
  | 'Unknown';

export type CareerDataStatus =
  | 'Verified'
  | 'Curated'
  | 'General guidance'
  | 'Data unavailable';

export type CareerDisciplineClusterId =
  | 'math_statistics_quantitative'
  | 'computing_software_ict'
  | 'engineering_construction_geoscience'
  | 'business_finance_economics'
  | 'natural_health_agriculture'
  | 'law_education_humanities_media';

export interface CareerCourseMappingRule {
  keywords: string[];
  codePrefixes?: string[];
  whyItMatters: string;
  skillsDeveloped: string[];
  careersSupported: string[];
}

export interface CareerCourseMapping {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  yearOfStudy?: number;
  semester?: number;
  credits?: number;
  coreOrElective?: string;
  whyItMatters: string;
  skillsDeveloped: string[];
  careersSupported: string[];
}

export interface CareerCertification {
  id: string;
  name: string;
  issuingBody: string;
  relevanceNote: string;
  requirementStatus:
    | 'Commonly valued (not mandatory)'
    | 'Professional pathway credential'
    | 'Optional technical credential';
  officialUrl?: string;
  dataStatus: CareerDataStatus;
}

export interface CareerCompensationGuide {
  tanzaniaRange?: string | null;
  regionalAfricaRange?: string | null;
  internationalRemoteRange?: string | null;
  lastUpdated?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  dataStatus: CareerDataStatus;
  unavailableReason: string;
}

export interface CareerProgressionStep {
  stepIndex: number;
  stageLabel: string;
  roleTitle: string;
  typicalFocus: string;
}

export interface CareerProjectRecommendation {
  id: string;
  title: string;
  academicLevel: 'Year 1 / Foundational' | 'Year 2 / Intermediate' | 'Year 3+ / Advanced';
  minYearOfStudy: number;
  description: string;
  skillsPracticed: string[];
}

export type StudentSkillAssessmentStatus =
  | 'developing'
  | 'needs_development'
  | 'not_assessed';

export interface CareerSkillAssessmentItem {
  skill: string;
  status: StudentSkillAssessmentStatus;
  evidenceNote: string;
}

export interface CareerSkillGapAnalysis {
  existingOrDeveloping: CareerSkillAssessmentItem[];
  needsDevelopment: CareerSkillAssessmentItem[];
  notYetAssessed: CareerSkillAssessmentItem[];
  nextRecommendedSkills: string[];
}

export interface CareerPathProfile {
  id: string;
  title: string;
  disciplineCluster: CareerDisciplineClusterId;
  secondaryClusters?: CareerDisciplineClusterId[];
  programmeKeywords: string[];
  departmentKeywords: string[];
  shortDescription: string;
  aboutCareer: string;
  typicalResponsibilities: string[];
  topSkillsRequired: string[];
  recommendedAdditionalSkills: string[];
  courseMappingRules: CareerCourseMappingRule[];
  certifications: CareerCertification[];
  compensation: CareerCompensationGuide;
  demandLevel: CareerDemandLevel;
  demandNote: string;
  demandSource?: string | null;
  demandDataStatus: CareerDataStatus;
  typicalIndustries: string[];
  careerProgression: CareerProgressionStep[];
  entryRequirements: string[];
  furtherStudyOptions: string[];
  projectRecommendations: CareerProjectRecommendation[];
  source: string;
  sourceUrl?: string;
  lastUpdated: string;
  region: string;
  dataStatus: CareerDataStatus;
}

export interface MatchedCareerRecommendation {
  career: CareerPathProfile;
  matchLabel: CareerMatchLabel;
  matchFactors: string[];
  matchedDegreeCourses: CareerCourseMapping[];
  skillGap: CareerSkillGapAnalysis;
  levelAppropriateProjects: CareerProjectRecommendation[];
  isPrimaryDisciplineMatch: boolean;
}

export interface StudentCareerPreference {
  userId: string;
  careerInterests: string[];
  preferredIndustries: string[];
  preferredLocation: string;
  workArrangement: 'On-site' | 'Remote' | 'Hybrid' | 'Flexible';
  targetCareerId?: string;
  targetCareerTitle?: string;
  knownSkills: string[];
  careerGoals: string;
  preferredPostgraduateDirection: string;
  savedCareerIds: string[];
  updatedAt: string;
}

export interface StudentCareerRoadmapYear {
  yearNumber: number;
  yearLabel: string;
  isCurrentYear: boolean;
  isCompletedYear: boolean;
  academicFocus: string[];
  relevantDegreeCourses: string[];
  technicalSkillsFocus: string[];
  recommendedProjects: string[];
  careerPreparationMilestones: string[];
}

export interface StudentCareerRoadmap {
  id: string;
  userId: string;
  careerId: string;
  careerTitle: string;
  programmeId: string;
  programmeName: string;
  durationYears: number;
  currentYearOfStudy: number;
  targetLocation: string;
  years: StudentCareerRoadmapYear[];
  createdAt: string;
  updatedAt: string;
}

export type OpportunityCategoryType =
  | 'Scholarship'
  | 'Internship'
  | 'Fellowship'
  | 'Competition'
  | 'Graduate Programme'
  | 'Training';

export type OpportunityRegionScope = 'Tanzania' | 'Africa' | 'International';

export type OpportunityStudyLevel = 'Undergraduate' | 'Postgraduate' | 'All Levels';

export type OpportunityFundingType =
  | 'Fully Funded'
  | 'Partially Funded'
  | 'Paid / Stipend'
  | 'Loan / Grant'
  | 'Training / Certificate';

export interface CareerOpportunityRecord {
  id: string;
  title: string;
  organization: string;
  type: OpportunityCategoryType;
  eligibleProgrammesOrFields: string[];
  eligibleDisciplineClusters: CareerDisciplineClusterId[] | ['ALL'];
  eligibleStudyLevels: OpportunityStudyLevel[];
  location: string;
  regionScope: OpportunityRegionScope;
  fundingType: OpportunityFundingType;
  fundingBenefitSummary: string;
  deadline: string;
  isRecurringAnnual: boolean;
  description: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  officialApplicationUrl: string;
  source: string;
  lastVerifiedDate: string;
  dataStatus: CareerDataStatus;
}

export interface EvaluatedCareerOpportunity {
  opportunity: CareerOpportunityRecord;
  eligibilityStatus: 'Eligible Match' | 'Check Specific Criteria' | 'Future / Next Level';
  eligibilityReasons: string[];
}

export interface AICareerAdvisorMessage {
  id: string;
  sender: 'user' | 'advisor';
  text: string;
  timestamp: string;
  epistemicTags?: Array<'Known Academic Context' | 'General Career Guidance' | 'Market Data Unavailable'>;
  suggestedFollowUps?: string[];
  reported?: boolean;
}

export type AICareerReportCategory =
  | 'Incorrect information'
  | 'Misleading career advice'
  | 'Offensive content'
  | 'Other';

export interface AICareerReportRecord {
  id: string;
  userId: string;
  messageId: string;
  messageExcerpt: string;
  category: AICareerReportCategory;
  details?: string;
  careerContext?: string;
  programmeName?: string;
  createdAt: string;
}

// ============================================================================
// STAGE 11C & 11C-B: REAL COMMUNITY, LECTURER CHANNELS & IN-APP CHAT DATA MODELS
// ============================================================================

export type CommunityScopeType =
  | 'university'
  | 'academic_unit'
  | 'department'
  | 'programme'
  | 'course';

export type CommunityPostCategory =
  | 'Academic Discussion'
  | 'Question'
  | 'Study Group'
  | 'Exam Prep'
  | 'Announcement'
  | 'Resource Share';

export type CommunityPostType =
  | 'TEXT'
  | 'QUESTION'
  | 'IMAGE'
  | 'FILE'
  | 'LINK'
  | 'POLL'
  | 'EVENT';

export type CommunityPostStatus = 'active' | 'deleted' | 'hidden';

export type ReactionEmojiKey = '👍' | '❤️' | '🎓' | '🔥' | '✅' | '💡';

export interface CommunityPollOption {
  id: string;
  text: string;
  voteCount: number;
}

export interface CommunityPollData {
  question: string;
  options: CommunityPollOption[];
  allowMultipleChoice: boolean;
  closesAt?: string | null;
  showResultsBeforeVoting: boolean;
  totalVotes: number;
}

export interface CommunityPollVoteRecord {
  id: string; // `${postId}_${userId}`
  postId: string;
  communityId: string;
  userId: string;
  userName?: string;
  selectedOptionIds: string[];
  votedAt: string;
}

export interface CommunityEventData {
  title: string;
  description: string;
  courseId?: string;
  courseCode?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  locationType: 'physical' | 'online';
  locationOrLink: string;
  goingCount: number;
  interestedCount: number;
  notGoingCount: number;
}

export type CommunityEventRsvpStatus = 'going' | 'interested' | 'not_going';

export interface CommunityEventRsvpRecord {
  id: string; // `${postId}_${userId}`
  postId: string;
  communityId: string;
  userId: string;
  userName: string;
  status: CommunityEventRsvpStatus;
  updatedAt: string;
}

export type StudyGroupVisibility = 'open' | 'request_to_join' | 'private';

export interface CommunityStudyGroupRecord {
  groupId: string;
  name: string;
  description: string;
  communityId: string;
  communityName: string;
  universityId: string;
  academicUnitId?: string;
  departmentId?: string;
  programmeId?: string;
  programmeName?: string;
  courseId?: string;
  courseCode?: string;
  courseTitle?: string;
  visibility: StudyGroupVisibility;
  ownerUid: string;
  ownerName: string;
  adminUids: string[];
  memberUids: string[];
  pendingRequestUids: string[];
  pendingRequests?: Record<
    string,
    {
      uid: string;
      name: string;
      roleLabel?: string;
      requestedAt: string;
    }
  >;
  conversationId?: string;
  memberCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CommunitySavedItemRecord {
  id: string; // `${userId}_${itemType}_${targetId}`
  userId: string;
  itemType: 'post' | 'message' | 'file' | 'announcement' | 'event';
  targetId: string;
  communityId?: string;
  conversationId?: string;
  courseCode?: string;
  title: string;
  excerpt: string;
  authorName: string;
  fileUrl?: string;
  fileName?: string;
  fileSizeLabel?: string;
  imageUrl?: string;
  linkUrl?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  createdAt: string;
}

export interface CommunitySpace {
  communityId: string;
  communityType: CommunityScopeType;
  name: string;
  shortLabel: string;
  description: string;
  universityId: string;
  universityName?: string;
  academicUnitId?: string;
  academicUnitName?: string;
  departmentId?: string;
  departmentName?: string;
  programmeId?: string;
  programmeName?: string;
  courseId?: string;
  courseCode?: string;
  courseTitle?: string;
  isOfficialAnnouncementOnly?: boolean;
  assignedLecturers?: Array<{
    lecturerId: string;
    userId?: string;
    name: string;
    title?: string;
  }>;
}

export interface RealCommunityPost {
  postId: string;
  authorUid: string;
  authorName: string;
  authorPhoto?: string;
  authorRoleLabel?: string;
  authorRole?: 'student' | 'lecturer' | 'admin';
  isVerifiedAuthor?: boolean;
  communityId: string;
  communityType: CommunityScopeType;
  communityName: string;
  universityId: string;
  academicUnitId?: string;
  departmentId?: string;
  programmeId?: string;
  courseId?: string;
  courseCode?: string;
  category: CommunityPostCategory;
  postType?: CommunityPostType;
  title: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentSizeLabel?: string;
  attachmentMimeType?: string;
  externalLink?: string;
  linkPreview?: ChatLinkPreview | null;
  poll?: CommunityPollData | null;
  event?: CommunityEventData | null;
  mentions?: string[];
  mentionNames?: string[];
  isAnnouncementOnly?: boolean;
  pinned?: boolean;
  pinnedByUid?: string | null;
  pinnedByName?: string | null;
  pinnedAt?: string | null;
  commentsLocked?: boolean;
  lockedByUid?: string | null;
  lockedByName?: string | null;
  bestAnswerCommentId?: string | null;
  bestAnswerMarkedByUid?: string | null;
  bestAnswerMarkedByName?: string | null;
  bestAnswerMarkedByRole?: 'author' | 'lecturer' | 'admin' | null;
  createdAt: string;
  updatedAt: string;
  editedAt?: string | null;
  status: CommunityPostStatus;
  likeCount: number;
  commentCount: number;
  reactionCounts?: Record<string, number>;
  ackCount?: number;
}

export type LecturerCourseNoticeType =
  | 'Announcement'
  | 'Lecture Reminder'
  | 'Assignment Instruction'
  | 'Timetable / Room Change'
  | 'Academic Notice';

export interface LecturerCourseAnnouncement {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  universityId: string;
  academicUnitId?: string;
  departmentId?: string;
  programmeId?: string;
  lecturerId: string;
  lecturerUid: string;
  lecturerName: string;
  lecturerTitle?: string;
  lecturerPhoto?: string;
  noticeType: LecturerCourseNoticeType;
  title: string;
  content: string;
  externalLink?: string;
  imageUrl?: string;
  attachmentName?: string;
  pinned: boolean;
  reactionCounts?: Record<string, number>;
  ackCount: number;
  status: 'active' | 'deleted';
  createdAt: string;
  updatedAt: string;
  editedAt?: string | null;
}

export interface CommunityReactionRecord {
  id: string; // `${targetId}_${userId}`
  targetId: string;
  targetType: 'post' | 'comment' | 'lecturer_announcement' | 'official_announcement' | 'chat_message';
  userId: string;
  userName?: string;
  emoji: string;
  createdAt: string;
}

export interface CommunityAcknowledgementRecord {
  id: string; // `${targetId}_${userId}`
  targetId: string;
  targetType: 'lecturer_announcement' | 'official_announcement';
  courseCode?: string;
  userId: string;
  userName: string;
  registrationNumber?: string;
  acknowledgedAt: string;
}

export interface CommunityReadStateRecord {
  id: string; // `${userId}_${communityId}`
  userId: string;
  communityId: string;
  lastReadAt: string;
}

export interface UserBlockedPeersRecord {
  userId: string;
  blockedUids: string[];
  updatedAt: string;
}

export interface RealCommunityComment {
  commentId: string;
  postId: string;
  parentCommentId?: string | null;
  authorUid: string;
  authorName: string;
  authorPhoto?: string;
  authorRoleLabel?: string;
  authorRole?: 'student' | 'lecturer' | 'admin';
  isVerifiedAuthor?: boolean;
  content: string;
  mentions?: string[];
  mentionNames?: string[];
  isBestAnswer?: boolean;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  reactionCounts?: Record<string, number>;
  status: 'active' | 'deleted' | 'hidden';
}

export interface CommunityLikeRecord {
  id: string; // `${targetId}_${userId}`
  targetId: string;
  targetType: 'post' | 'comment';
  userId: string;
  createdAt: string;
}

export interface CommunityBookmarkRecord {
  id: string; // `${userId}_${postId}`
  userId: string;
  postId: string;
  communityId: string;
  createdAt: string;
}

export type CommunityReportCategory =
  | 'Spam or misleading'
  | 'Harassment or abusive behavior'
  | 'Academic dishonesty / exam leak'
  | 'Off-topic or inappropriate content'
  | 'Other';

export interface CommunityReportRecord {
  reportId: string;
  reporterUid: string;
  reporterName?: string;
  targetType: 'post' | 'comment' | 'message' | 'lecturer_announcement';
  targetId: string;
  targetAuthorUid?: string;
  targetExcerpt: string;
  communityId?: string;
  conversationId?: string;
  category: CommunityReportCategory;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export type ChatConversationType = 'direct' | 'community_group' | 'private_group';

export type GroupMemberRole = 'owner' | 'admin' | 'member';

export type MessageAttachmentType = 'text' | 'image' | 'file' | 'voice';

export interface ChatLinkPreview {
  url: string;
  domain: string;
  title: string;
  description?: string;
  isAcademicOrTrusted?: boolean;
  isInternalVenue?: boolean;
}

export interface ChatParticipantInfo {
  uid: string;
  name: string;
  photo?: string;
  programmeName?: string;
  yearOfStudy?: string;
  universityShort?: string;
  roleLabel?: string;
  accountRole?: 'student' | 'lecturer' | 'admin';
  groupRole?: GroupMemberRole;
}

export interface UserPresenceRecord {
  uid: string;
  name?: string;
  status: 'online' | 'recently_active' | 'offline';
  isOnline?: boolean;
  lastActiveAt: string;
  hideActivityStatus?: boolean;
}

export interface ConversationTypingStateRecord {
  conversationId: string;
  typingUsers: Record<
    string,
    {
      uid: string;
      name: string;
      updatedAt: number;
    }
  >;
  updatedAt: string;
}

export interface UserMutedConversationsRecord {
  userId: string;
  mutedConversationIds: string[];
  updatedAt: string;
}

export interface RealChatConversation {
  conversationId: string;
  type: ChatConversationType;
  participantIds: string[];
  participants: Record<string, ChatParticipantInfo>;
  ownerUid?: string;
  adminUids?: string[];
  memberRoles?: Record<string, GroupMemberRole>;
  groupDescription?: string;
  communityId?: string;
  communityName?: string;
  universityId?: string;
  programmeId?: string;
  courseCode?: string;
  title?: string;
  lastMessage: string;
  lastSenderUid?: string;
  lastSenderName?: string;
  lastMessageAt: string;
  unreadCountByUser?: Record<string, number>;
  lastReadAtByUser?: Record<string, string>;
  pinnedMessageIds?: string[];
  isAnnouncementOnly?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RealChatMessage {
  messageId: string;
  conversationId: string;
  senderUid: string;
  senderName: string;
  senderPhoto?: string;
  senderRoleLabel?: string;
  senderAccountRole?: 'student' | 'lecturer' | 'admin';
  text: string;
  messageType?: MessageAttachmentType;
  imageUrl?: string;
  imageStoragePath?: string;
  fileUrl?: string;
  fileStoragePath?: string;
  fileName?: string;
  fileSize?: number;
  fileSizeLabel?: string;
  fileContentType?: string;
  fileMimeType?: string;
  voiceUrl?: string;
  voiceStoragePath?: string;
  voiceDurationSec?: number;
  voiceContentType?: string;
  replyToMessageId?: string | null;
  replyToSenderName?: string | null;
  replyToExcerpt?: string | null;
  isForwarded?: boolean;
  forwardedFromSenderName?: string | null;
  forwardedFromConversationType?: ChatConversationType | null;
  pinned?: boolean;
  isPinned?: boolean;
  pinnedByUid?: string | null;
  pinnedByName?: string | null;
  pinnedAt?: string | null;
  mentions?: string[]; // array of mentioned uids or 'everyone'
  mentionNames?: string[];
  extractedLinks?: string[];
  linkPreview?: ChatLinkPreview | null;
  reactions?: Record<string, string[]>; // emoji -> array of uids (bounded)
  reactionCounts?: Record<string, number>;
  isAnnouncementOnly?: boolean;
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
  deletedByUid?: string | null;
  status: 'sent' | 'deleted';
  isDeleted?: boolean;
}

// ============================================================================
// STAGE 11C-F: AI COMMUNITY INTELLIGENCE TYPES
// ============================================================================

export type CommunityAISummaryScope = '24h' | '7d' | 'since_last_visit' | 'selected_messages';

export interface CommunityAISourceReference {
  sourceId: string;
  sourceType: 'course_material' | 'community_discussion' | 'lecturer_announcement' | 'official_announcement' | 'shared_file';
  label: string; // e.g. "MT 120 — Lecture Notes", "Community discussion — Oct 8", "Lecturer Announcement — Assignment 2"
  courseCode?: string;
  materialId?: string;
  pageReferences?: number[];
  targetId?: string; // postId, messageId, or announcementId
  timestampLabel?: string;
  authorName?: string;
}

export interface CommunityAIDiscussionSummary {
  scope: CommunityAISummaryScope;
  scopeLabel: string;
  keyPoints: string[];
  questionsRaised: string[];
  answersGiven: string[];
  unresolvedQuestions: Array<{
    questionText: string;
    authorName?: string;
    referenceId?: string;
    referenceType?: 'post' | 'message';
    timestamp?: string;
  }>;
  importantAnnouncements: string[];
  usefulResources: string[];
  sources: CommunityAISourceReference[];
  emptyReason?: string;
  generatedAt: string;
}

export interface CommunityAIUnansweredQuestion {
  referenceId: string;
  referenceType: 'post' | 'message';
  questionText: string;
  authorName: string;
  createdAt: string;
  timestampLabel: string;
  reasonUnresolved: string;
  topicHint?: string;
}

export interface CommunityAIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  formula?: string;
  steps?: string[];
  suggestions?: string[];
  sources?: CommunityAISourceReference[];
  summaryData?: CommunityAIDiscussionSummary;
  unansweredQuestions?: CommunityAIUnansweredQuestion[];
  detectedLanguage?: string;
  isError?: boolean;
  isAccessDenied?: boolean;
  isRateLimited?: boolean;
  feedback?: 'helpful' | 'not_helpful' | null;
  reported?: boolean;
  timestamp: string;
}

export interface CommunityAIConversation {
  id: string;
  communityId: string;
  communityName: string;
  userId: string;
  courseId?: string;
  courseCode?: string;
  title: string;
  lastMessagePreview: string;
  messageCount: number;
  languagePreference?: string;
  messages?: CommunityAIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityAIFeedbackRecord {
  id: string;
  userId: string;
  communityId: string;
  courseId?: string;
  messageId: string;
  rating: 'helpful' | 'not_helpful' | 'report';
  reason?: string;
  comment?: string;
  createdAt: string;
}





