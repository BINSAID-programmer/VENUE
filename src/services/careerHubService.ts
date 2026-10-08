import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  limit,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  Course,
  CourseRecord,
  StudentProfile,
  CareerDisciplineClusterId,
  CareerPathProfile,
  CareerCourseMapping,
  CareerMatchLabel,
  CareerSkillGapAnalysis,
  CareerSkillAssessmentItem,
  MatchedCareerRecommendation,
  StudentCareerPreference,
  StudentCareerRoadmap,
  StudentCareerRoadmapYear,
  CareerOpportunityRecord,
  EvaluatedCareerOpportunity,
  AICareerAdvisorMessage,
  AICareerReportCategory,
  AICareerReportRecord,
} from '../types';
import {
  CURATED_CAREER_PROFILES,
  VERIFIED_CAREER_OPPORTUNITIES,
} from '../data/careerKnowledgeCatalogue';
import { courseCurriculumService } from './courseCurriculumService';
import { aiTutorFoundationService } from './aiTutorFoundationService';

// ============================================================================
// STAGE 11B: REAL COURSE-BASED CAREER HUB & AI CAREER ADVISOR SERVICE
// ============================================================================

export interface AcademicCareerAlignmentSummary {
  programmeTitle: string;
  departmentTitle: string;
  academicUnitTitle: string;
  yearLabel: string;
  semesterLabel: string;
  disciplineCluster: CareerDisciplineClusterId;
  dynamicSubtitle: string;
  currentAcademicFocus: string[];
  potentialCareerAreas: string[];
  alignmentHeadline: string;
  alignmentExplanation: string;
  isProfileConfigured: boolean;
}

const PREF_CACHE_PREFIX = 'venue_student_career_pref_';
const ROADMAP_CACHE_PREFIX = 'venue_student_career_roadmaps_';

// In-memory cache to avoid redundant curriculum & career evaluations (Section 35 Performance)
const programmeRoadmapCoursesCache = new Map<string, CourseRecord[]>();

function getEffectiveUid(providedUid?: string): string {
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  if (providedUid && providedUid.trim()) return providedUid.trim();
  try {
    const stored = localStorage.getItem('venue_current_student_uid');
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // ignore
  }
  return '';
}

/**
 * Infers the primary academic discipline cluster from the student's real
 * programme, department, academic unit, and enrolled courses.
 */
export function inferDisciplineCluster(
  profile: StudentProfile,
  courses: Course[] = []
): CareerDisciplineClusterId {
  const prog = (profile.programmeName || profile.programme || '').toLowerCase();
  const dept = (profile.departmentName || profile.department || '').toLowerCase();
  const unit = (profile.academicUnitName || profile.college || '').toLowerCase();
  const courseCodes = courses.map((c) => (c.code || c.courseCode || '').toUpperCase());
  const combined = `${prog} ${dept} ${unit}`;

  // 1. Mathematics, Statistics, Actuarial
  if (
    prog.includes('mathematics') ||
    prog.includes('statistics') ||
    prog.includes('actuarial') ||
    dept.includes('mathematics') ||
    dept.includes('statistics') ||
    courseCodes.some((c) => c.startsWith('MT') || c.startsWith('ST'))
  ) {
    // Check if it's primarily Computer Science that just happens to have 1 math course
    if (
      prog.includes('computer') ||
      prog.includes('software') ||
      prog.includes('information') ||
      prog.includes('telecommunication')
    ) {
      return 'computing_software_ict';
    }
    return 'math_statistics_quantitative';
  }

  // 2. Computing, Software, IT, Telecommunications
  if (
    combined.includes('computer') ||
    combined.includes('software') ||
    combined.includes('information technology') ||
    combined.includes('information system') ||
    combined.includes('informatics') ||
    combined.includes('telecommunication') ||
    combined.includes('coict') ||
    combined.includes('multimedia') ||
    combined.includes('cyber')
  ) {
    return 'computing_software_ict';
  }

  // 3. Engineering, Construction, Geosciences
  if (
    combined.includes('engineering') ||
    combined.includes('civil') ||
    combined.includes('mechanical') ||
    combined.includes('electrical') ||
    combined.includes('chemical') ||
    combined.includes('mining') ||
    combined.includes('geology') ||
    combined.includes('geomatics') ||
    combined.includes('petroleum') ||
    combined.includes('metallurgy') ||
    combined.includes('architecture') ||
    combined.includes('quantity surveying') ||
    combined.includes('coet') ||
    combined.includes('somg')
  ) {
    return 'engineering_construction_geoscience';
  }

  // 4. Business, Accounting, Finance, Economics
  if (
    combined.includes('accounting') ||
    combined.includes('finance') ||
    combined.includes('banking') ||
    combined.includes('commerce') ||
    combined.includes('business') ||
    combined.includes('economics') ||
    combined.includes('marketing') ||
    combined.includes('procurement') ||
    combined.includes('human resource') ||
    combined.includes('taxation') ||
    combined.includes('udbs') ||
    combined.includes('udse')
  ) {
    return 'business_finance_economics';
  }

  // 5. Natural Sciences, Health, Agriculture, Food
  if (
    combined.includes('biology') ||
    combined.includes('chemistry') ||
    combined.includes('physics') ||
    combined.includes('botany') ||
    combined.includes('zoology') ||
    combined.includes('wildlife') ||
    combined.includes('aquatic') ||
    combined.includes('microbiology') ||
    combined.includes('biotechnology') ||
    combined.includes('agriculture') ||
    combined.includes('food') ||
    combined.includes('medicine') ||
    combined.includes('health') ||
    combined.includes('nursing') ||
    combined.includes('pharmacy') ||
    combined.includes('conas') ||
    combined.includes('coaf') ||
    combined.includes('mchas')
  ) {
    return 'natural_health_agriculture';
  }

  // 6. Law, Education, Humanities, Social Sciences, Journalism
  return 'law_education_humanities_media';
}

class CareerHubService {
  /**
   * Builds the dynamic Academic Profile Summary & Academic-to-Career Alignment Card
   * strictly from the student's real academic profile and courses (Sections 2, 3, 4).
   */
  public buildAcademicCareerAlignment(
    profile: StudentProfile,
    courses: Course[],
    preferences?: StudentCareerPreference | null
  ): AcademicCareerAlignmentSummary {
    const programmeTitle = (profile.programmeName || profile.programme || '').trim();
    const departmentTitle = (profile.departmentName || profile.department || '').trim();
    const academicUnitTitle = (profile.academicUnitName || profile.college || '').trim();
    const yearLabel = (profile.yearOfStudy || '').trim();
    const semesterLabel = (profile.semester || '').trim();
    const isProfileConfigured = Boolean(programmeTitle && profile.programmeId);

    const cluster = inferDisciplineCluster(profile, courses);

    // Derive current academic focus from real current courses or department/programme
    const courseFocusAreas = courses
      .slice(0, 4)
      .map((c) => c.title || c.courseTitle || c.code)
      .filter(Boolean);

    let defaultFocus: string[] = [];
    let potentialAreas: string[] = [];
    let alignmentHeadline = 'Academic-to-Career Alignment';
    let alignmentExplanation = '';
    let dynamicSubtitle = 'Career paths and opportunities matched to your academic journey';

    const cleanProgShort = programmeTitle
      ? programmeTitle.replace(/^Bachelor of Science in\s+/i, '').replace(/^Bachelor of\s+/i, '')
      : '';

    if (!isProfileConfigured) {
      dynamicSubtitle = 'Complete your academic profile to unlock programme-matched career paths';
      alignmentExplanation =
        'Complete your university, department, and degree programme placement so VENUE can map your canonical degree courses to relevant career paths and skill requirements.';
    } else if (cluster === 'math_statistics_quantitative') {
      dynamicSubtitle = `Career paths matched to your ${cleanProgShort || programmeTitle} journey`;
      defaultFocus = ['Mathematics', 'Statistics', 'Quantitative Modeling'];
      potentialAreas = ['Data Science', 'Statistical Research', 'Actuarial & Risk', 'Quantitative Finance', 'Operations Research'];
      alignmentExplanation = `Your ${programmeTitle} programme develops quantitative, statistical, and mathematical modeling skills that transfer directly into data science, statistical research, actuarial valuation, risk analytics, and decision science roles.`;
    } else if (cluster === 'computing_software_ict') {
      dynamicSubtitle = `Technology career paths matched to your ${cleanProgShort || programmeTitle} journey`;
      defaultFocus = ['Software Engineering', 'Algorithms & Systems', 'Databases & Networks'];
      potentialAreas = ['Software Engineering', 'Cloud & Cybersecurity', 'Data & AI Systems', 'Digital Product & ICT Analysis'];
      alignmentExplanation = `Your ${programmeTitle} programme develops software engineering, algorithmic problem-solving, database architecture, and network systems skills that transfer into software development, cybersecurity, telecommunications, cloud infrastructure, and digital product roles.`;
    } else if (cluster === 'engineering_construction_geoscience') {
      dynamicSubtitle = `Engineering & technical career paths matched to your ${cleanProgShort || programmeTitle} journey`;
      defaultFocus = ['Engineering Design', 'Applied Mechanics & Systems', 'Project Execution'];
      potentialAreas = ['Infrastructure & Construction', 'Industrial & Process Systems', 'Energy & Power', 'Mining & Geosciences', 'Project Engineering'];
      alignmentExplanation = `Your ${programmeTitle} programme develops rigorous engineering design, technical calculation, systems analysis, and project execution capabilities aligned with infrastructure development, industrial operations, energy, and statutory professional engineering practice.`;
    } else if (cluster === 'business_finance_economics') {
      dynamicSubtitle = `Finance, economics & business career paths matched to your ${cleanProgShort || programmeTitle} journey`;
      defaultFocus = ['Financial & Economic Analysis', 'Accounting & Governance', 'Market Strategy'];
      potentialAreas = ['Corporate Finance & Banking', 'Audit & Taxation', 'Economic Policy & Research', 'Investment & Risk', 'Operations & Strategy'];
      alignmentExplanation = `Your ${programmeTitle} programme develops financial analysis, accounting governance, econometric reasoning, and strategic management capabilities that transfer into banking, audit and advisory, economic policy research, and corporate leadership.`;
    } else if (cluster === 'natural_health_agriculture') {
      dynamicSubtitle = `Scientific, health & research career paths matched to your ${cleanProgShort || programmeTitle} journey`;
      defaultFocus = ['Laboratory & Field Science', 'Experimental Design', 'Quality & Biosafety'];
      potentialAreas = ['Scientific Research', 'Quality Assurance & Standards', 'Biotechnology & Health', 'Environmental & Agricultural Systems'];
      alignmentExplanation = `Your ${programmeTitle} programme develops empirical laboratory competence, experimental design, quality control, and scientific analysis skills applicable across research institutes, regulatory standards authorities, healthcare, biotechnology, and agribusiness.`;
    } else {
      dynamicSubtitle = `Professional career paths matched to your ${cleanProgShort || programmeTitle} journey`;
      defaultFocus = ['Critical Research & Analysis', 'Policy & Regulatory Frameworks', 'Professional Communication'];
      potentialAreas = ['Legal & Regulatory Compliance', 'Education & Curriculum', 'Public Policy & Administration', 'Media & Strategic Communications'];
      alignmentExplanation = `Your ${programmeTitle} programme develops critical analysis, regulatory/pedagogical reasoning, research synthesis, and professional communication skills essential across legal practice, education, public administration, development agencies, and media.`;
    }

    if (preferences?.careerInterests && preferences.careerInterests.length > 0) {
      potentialAreas = Array.from(new Set([...preferences.careerInterests, ...potentialAreas])).slice(0, 6);
    }

    return {
      programmeTitle,
      departmentTitle,
      academicUnitTitle,
      yearLabel,
      semesterLabel,
      disciplineCluster: cluster,
      dynamicSubtitle,
      currentAcademicFocus: courseFocusAreas.length > 0 ? courseFocusAreas : defaultFocus,
      potentialCareerAreas: potentialAreas,
      alignmentHeadline,
      alignmentExplanation,
      isProfileConfigured,
    };
  }

  /**
   * Retrieves all real canonical courses belonging to the student's programme
   * across all years/semesters so Career Hub can map real degree courses to careers.
   */
  public async getStudentProgrammeCatalogueCourses(
    profile: StudentProfile,
    currentSemesterCourses: Course[]
  ): Promise<CourseRecord[]> {
    const pid = (profile.programmeId || '').trim().toLowerCase();
    if (!pid) {
      return [];
    }

    if (programmeRoadmapCoursesCache.has(pid)) {
      return programmeRoadmapCoursesCache.get(pid)!;
    }

    const collected = new Map<string, CourseRecord>();

    // Include current semester courses first
    currentSemesterCourses.forEach((c) => {
      const code = (c.code || c.courseCode || '').trim().toUpperCase();
      if (code) {
        collected.set(code, {
          id: c.id,
          universityId: profile.universityId || 'udsm',
          academicUnitId: profile.academicUnitId || '',
          departmentId: profile.departmentId || '',
          programmeId: pid,
          courseCode: code,
          courseTitle: c.title || c.courseTitle || code,
          yearOfStudy: c.yearOfStudy || 1,
          semester: typeof c.semester === 'number' ? c.semester : 1,
          credits: c.credits || 0,
          coreOrElective: c.coreOrElective || 'Core',
          status: 'Core',
        });
      }
    });

    try {
      const roadmap = await courseCurriculumService.getProgrammeCurriculumRoadmap(pid);
      if (roadmap && Array.isArray(roadmap.years)) {
        for (const yr of roadmap.years) {
          for (const sem of yr.semesters) {
            for (const c of [...sem.coreCourses, ...sem.electiveCourses]) {
              const code = (c.courseCode || '').trim().toUpperCase();
              if (code && !collected.has(code)) {
                collected.set(code, c);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('CareerHubService: Could not load full programme roadmap:', err);
    }

    const result = Array.from(collected.values());
    programmeRoadmapCoursesCache.set(pid, result);
    return result;
  }

  /**
   * Matches real canonical courses from the student's actual programme against a career path.
   * NEVER invents course codes (Sections 10, 11, 33).
   */
  public mapProgrammeCoursesToCareer(
    career: CareerPathProfile,
    programmeCourses: CourseRecord[]
  ): CareerCourseMapping[] {
    if (!programmeCourses || programmeCourses.length === 0) return [];

    const matched: CareerCourseMapping[] = [];
    const seenCodes = new Set<string>();

    for (const course of programmeCourses) {
      const code = (course.courseCode || '').trim().toUpperCase();
      const title = (course.courseTitle || '').trim();
      const titleLower = title.toLowerCase();
      if (!code || !title || seenCodes.has(code)) continue;

      for (const rule of career.courseMappingRules) {
        const keywordMatch = rule.keywords.some((kw) => titleLower.includes(kw.toLowerCase()));
        const prefixMatch =
          !rule.codePrefixes ||
          rule.codePrefixes.length === 0 ||
          rule.codePrefixes.some((pref) => code.startsWith(pref.toUpperCase()));

        if (keywordMatch && prefixMatch) {
          seenCodes.add(code);
          matched.push({
            courseId: course.id || code,
            courseCode: code,
            courseTitle: title,
            yearOfStudy: course.yearOfStudy,
            semester: course.semester,
            credits: course.credits,
            coreOrElective: course.coreOrElective || course.status,
            whyItMatters: rule.whyItMatters,
            skillsDeveloped: rule.skillsDeveloped,
            careersSupported: rule.careersSupported,
          });
          break;
        }
      }
    }

    // Sort by Year of Study then Course Code, limit to top 8 relevant real courses
    matched.sort((a, b) => (a.yearOfStudy || 1) - (b.yearOfStudy || 1) || a.courseCode.localeCompare(b.courseCode));
    return matched.slice(0, 8);
  }

  /**
   * Computes real Skill Gap Analysis for a career path using:
   * 1. Student's declared skills in StudentCareerPreference
   * 2. Real Personalized Tutor Memory & AI Learning Progress signals
   * 3. Enrolled/matched degree courses in the student's current or completed years
   * Never claims mastery without real evidence (Sections 8 & 9).
   */
  public computeSkillGapAnalysis(
    career: CareerPathProfile,
    profile: StudentProfile,
    currentCourses: Course[],
    matchedDegreeCourses: CareerCourseMapping[],
    preferences: StudentCareerPreference | null,
    tutorMemoryTopics: Array<{ topic: string; courseCode: string; masteryLevel: string }>
  ): CareerSkillGapAnalysis {
    const existingOrDeveloping: CareerSkillAssessmentItem[] = [];
    const needsDevelopment: CareerSkillAssessmentItem[] = [];
    const notYetAssessed: CareerSkillAssessmentItem[] = [];

    const currentYearNum = parseInt(String(profile.yearOfStudy || '1').replace(/\D/g, ''), 10) || 1;
    const knownSkillsLower = (preferences?.knownSkills || []).map((s) => s.toLowerCase().trim());
    const currentCourseTitlesLower = currentCourses.map((c) => ({
      code: c.code || c.courseCode || '',
      title: (c.title || c.courseTitle || '').toLowerCase(),
    }));

    for (const reqSkill of career.topSkillsRequired) {
      const skillLower = reqSkill.toLowerCase();
      const skillTokens = skillLower
        .split(/[\s,/()&-]+/)
        .filter((t) => t.length >= 3 && !['and', 'for', 'the', 'with'].includes(t));

      // 1. Check declared skills in Student Career Profile
      const declaredMatch = knownSkillsLower.find(
        (k) => k && (skillLower.includes(k) || k.includes(skillLower) || skillTokens.some((tok) => k === tok))
      );

      // 2. Check real Personalized Tutor Memory / Learning Progress
      const memoryMatch = tutorMemoryTopics.find((m) => {
        const tLower = m.topic.toLowerCase();
        return skillTokens.some((tok) => tLower.includes(tok));
      });

      // 3. Check current/completed semester degree courses
      const currentCourseMatch = currentCourseTitlesLower.find((c) =>
        skillTokens.some((tok) => c.title.includes(tok))
      );

      // 4. Check matched degree courses up to current year of study
      const degreeMappingMatch = matchedDegreeCourses.find(
        (mc) =>
          (mc.yearOfStudy || 1) <= currentYearNum &&
          mc.skillsDeveloped.some((sd) => sd.toLowerCase() === skillLower || skillTokens.some((tok) => sd.toLowerCase().includes(tok)))
      );

      if (memoryMatch && ['proficient', 'strong', 'developing'].includes(memoryMatch.masteryLevel)) {
        existingOrDeveloping.push({
          skill: reqSkill,
          status: 'developing',
          evidenceNote: `Developing via AI Tutor (${memoryMatch.courseCode}: ${memoryMatch.topic})`,
        });
      } else if (memoryMatch && memoryMatch.masteryLevel === 'needs_review') {
        needsDevelopment.push({
          skill: reqSkill,
          status: 'needs_development',
          evidenceNote: `Flagged for reinforcement in ${memoryMatch.courseCode} (${memoryMatch.topic})`,
        });
      } else if (declaredMatch) {
        existingOrDeveloping.push({
          skill: reqSkill,
          status: 'developing',
          evidenceNote: 'Listed in your Career Profile skills',
        });
      } else if (currentCourseMatch) {
        existingOrDeveloping.push({
          skill: reqSkill,
          status: 'developing',
          evidenceNote: `Currently developing in ${currentCourseMatch.code}`,
        });
      } else if (degreeMappingMatch) {
        existingOrDeveloping.push({
          skill: reqSkill,
          status: 'developing',
          evidenceNote: `Supported by programme course ${degreeMappingMatch.courseCode}`,
        });
      } else {
        // Check if covered in a future year of the student's degree programme
        const futureDegreeCourse = matchedDegreeCourses.find(
          (mc) =>
            (mc.yearOfStudy || 1) > currentYearNum &&
            mc.skillsDeveloped.some((sd) => sd.toLowerCase() === skillLower || skillTokens.some((tok) => sd.toLowerCase().includes(tok)))
        );

        if (futureDegreeCourse) {
          needsDevelopment.push({
            skill: reqSkill,
            status: 'needs_development',
            evidenceNote: `Scheduled in Year ${futureDegreeCourse.yearOfStudy} (${futureDegreeCourse.courseCode})`,
          });
        } else {
          notYetAssessed.push({
            skill: reqSkill,
            status: 'not_assessed',
            evidenceNote: 'Not yet assessed — build via self-study or practical projects',
          });
        }
      }
    }

    const nextRecommendedSkills = [
      ...needsDevelopment.map((i) => i.skill),
      ...notYetAssessed.map((i) => i.skill),
      ...career.recommendedAdditionalSkills,
    ].slice(0, 5);

    return {
      existingOrDeveloping,
      needsDevelopment,
      notYetAssessed,
      nextRecommendedSkills,
    };
  }

  /**
   * Main Career Matching Engine (Sections 5, 6, 33, 39).
   * Dynamically evaluates career paths against the student's real academic discipline,
   * programme courses, learning signals, and preferences.
   */
  public async getCareerRecommendations(
    profile: StudentProfile,
    currentCourses: Course[],
    includeAllExplorationPaths = false
  ): Promise<{
    alignment: AcademicCareerAlignmentSummary;
    recommendations: MatchedCareerRecommendation[];
    preferences: StudentCareerPreference;
  }> {
    const uid = getEffectiveUid(profile.uid);
    const preferences = await this.getStudentCareerPreferences(uid);
    const alignment = this.buildAcademicCareerAlignment(profile, currentCourses, preferences);

    if (!alignment.isProfileConfigured && !includeAllExplorationPaths) {
      return {
        alignment,
        recommendations: [],
        preferences,
      };
    }

    const programmeCourses = await this.getStudentProgrammeCatalogueCourses(profile, currentCourses);

    // Retrieve minimal learning signals from Personalized Tutor Memory (Section 30)
    const tutorMemoryTopics: Array<{ topic: string; courseCode: string; masteryLevel: string }> = [];
    if (uid) {
      try {
        const memories = await aiTutorFoundationService.listUserTutorMemories(uid);
        memories.slice(0, 20).forEach((m) => {
          if (m.topic && m.masteryLevel && m.masteryLevel !== 'not_assessed') {
            tutorMemoryTopics.push({
              topic: m.topic,
              courseCode: m.courseCode || '',
              masteryLevel: m.masteryLevel,
            });
          }
        });
      } catch {
        // ignore
      }
    }

    const progLower = alignment.programmeTitle.toLowerCase();
    const deptLower = alignment.departmentTitle.toLowerCase();
    const currentYearNum = parseInt(String(profile.yearOfStudy || '1').replace(/\D/g, ''), 10) || 1;
    const interestLower = (preferences.careerInterests || []).map((i) => i.toLowerCase());
    const targetCareerId = preferences.targetCareerId || '';

    const evaluated: MatchedCareerRecommendation[] = [];

    for (const career of CURATED_CAREER_PROFILES) {
      const isPrimaryCluster = career.disciplineCluster === alignment.disciplineCluster;
      const isSecondaryCluster = Boolean(
        career.secondaryClusters?.includes(alignment.disciplineCluster)
      );
      const progKeywordMatch = career.programmeKeywords.some((kw) => progLower.includes(kw));
      const deptKeywordMatch = career.departmentKeywords.some((kw) => deptLower.includes(kw));
      const interestMatch = interestLower.some(
        (i) =>
          career.title.toLowerCase().includes(i) ||
          career.typicalIndustries.some((ind) => ind.toLowerCase().includes(i))
      );
      const isTargetCareer = targetCareerId === career.id;

      if (!includeAllExplorationPaths && !isPrimaryCluster && !isSecondaryCluster && !progKeywordMatch && !deptKeywordMatch && !interestMatch && !isTargetCareer && matchedDegreeCourses.length === 0) {
        continue;
      }

      const matchedDegreeCourses = this.mapProgrammeCoursesToCareer(career, programmeCourses);
      const skillGap = this.computeSkillGapAnalysis(
        career,
        profile,
        currentCourses,
        matchedDegreeCourses,
        preferences,
        tutorMemoryTopics
      );

      // Transparent qualitative match determination (Section 5: No fabricated percentages!)
      const matchFactors: string[] = [];
      if (isPrimaryCluster || progKeywordMatch) {
        matchFactors.push(`Direct alignment with ${alignment.programmeTitle || 'your degree discipline'}`);
      } else if (isSecondaryCluster || deptKeywordMatch) {
        matchFactors.push(`Cross-disciplinary fit with ${alignment.departmentTitle || alignment.programmeTitle}`);
      }
      if (matchedDegreeCourses.length > 0) {
        matchFactors.push(`${matchedDegreeCourses.length} canonical course(s) in your programme support this path`);
      }
      if (isTargetCareer || interestMatch) {
        matchFactors.push('Matches your declared career preferences');
      }
      if (skillGap.existingOrDeveloping.length > 0) {
        matchFactors.push(`${skillGap.existingOrDeveloping.length} required skill(s) already developing`);
      }

      let matchLabel: CareerMatchLabel = 'Explore';
      if ((isPrimaryCluster && (progKeywordMatch || matchedDegreeCourses.length >= 2)) || isTargetCareer) {
        matchLabel = 'Strong Match';
      } else if (isPrimaryCluster || (isSecondaryCluster && matchedDegreeCourses.length >= 1) || interestMatch) {
        matchLabel = 'Good Match';
      } else if (isSecondaryCluster || deptKeywordMatch || matchedDegreeCourses.length >= 1) {
        matchLabel = 'Possible Path';
      }

      // Filter project recommendations appropriate for student's academic year (Section 18)
      const levelAppropriateProjects = career.projectRecommendations.filter(
        (p) => p.minYearOfStudy <= Math.max(2, currentYearNum + 1)
      );

      evaluated.push({
        career,
        matchLabel,
        matchFactors: matchFactors.length > 0 ? matchFactors : ['General cross-disciplinary career exploration'],
        matchedDegreeCourses,
        skillGap,
        levelAppropriateProjects:
          levelAppropriateProjects.length > 0
            ? levelAppropriateProjects
            : career.projectRecommendations,
        isPrimaryDisciplineMatch: isPrimaryCluster,
      });
    }

    const labelOrder: Record<CareerMatchLabel, number> = {
      'Strong Match': 4,
      'Good Match': 3,
      'Possible Path': 2,
      Explore: 1,
    };

    evaluated.sort((a, b) => {
      const diffLabel = labelOrder[b.matchLabel] - labelOrder[a.matchLabel];
      if (diffLabel !== 0) return diffLabel;
      if (a.isPrimaryDisciplineMatch !== b.isPrimaryDisciplineMatch) {
        return a.isPrimaryDisciplineMatch ? -1 : 1;
      }
      return b.matchedDegreeCourses.length - a.matchedDegreeCourses.length;
    });

    // Guarantee at least 15 career paths are available for exploration even for specialized programmes
    if (!includeAllExplorationPaths && evaluated.length < 15) {
      const existingIds = new Set(evaluated.map((e) => e.career.id));
      for (const career of CURATED_CAREER_PROFILES) {
        if (evaluated.length >= 16) break;
        if (existingIds.has(career.id)) continue;
        const matchedDegreeCourses = this.mapProgrammeCoursesToCareer(career, programmeCourses);
        const skillGap = this.computeSkillGapAnalysis(
          career,
          profile,
          currentCourses,
          matchedDegreeCourses,
          preferences,
          tutorMemoryTopics
        );
        evaluated.push({
          career,
          matchLabel: matchedDegreeCourses.length > 0 ? 'Possible Path' : 'Explore',
          matchFactors: [
            matchedDegreeCourses.length > 0
              ? `${matchedDegreeCourses.length} transferable course(s) in your programme`
              : 'Transferable graduate & analytical career path',
          ],
          matchedDegreeCourses,
          skillGap,
          levelAppropriateProjects: career.projectRecommendations,
          isPrimaryDisciplineMatch: false,
        });
      }
    }

    return {
      alignment,
      recommendations: evaluated,
      preferences,
    };
  }

  /**
   * Generates a dynamic Personal Career Roadmap adapted to the student's actual
   * programme duration (e.g., 3 years vs 4 years) and real programme courses (Section 19).
   */
  public async generatePersonalCareerRoadmap(
    profile: StudentProfile,
    recommendation: MatchedCareerRecommendation,
    preferences: StudentCareerPreference
  ): Promise<StudentCareerRoadmap> {
    const uid = getEffectiveUid(profile.uid);
    const durationYears = Math.max(
      1,
      Math.min(6, Number(profile.programmeDurationYears) || 3)
    );
    const currentYearOfStudy = Math.max(
      1,
      Math.min(
        durationYears,
        parseInt(String(profile.yearOfStudy || '1').replace(/\D/g, ''), 10) || 1
      )
    );

    const programmeCourses = await this.getStudentProgrammeCatalogueCourses(profile, []);
    const career = recommendation.career;
    const years: StudentCareerRoadmapYear[] = [];

    for (let yr = 1; yr <= durationYears; yr++) {
      const isCurrentYear = yr === currentYearOfStudy;
      const isCompletedYear = yr < currentYearOfStudy;
      const isFinalYear = yr === durationYears;

      // Real courses from the student's programme in this specific year
      const yearMatchedCourses = recommendation.matchedDegreeCourses
        .filter((mc) => mc.yearOfStudy === yr)
        .map((mc) => `${mc.courseCode} — ${mc.courseTitle}`);

      const fallbackYearCourses =
        yearMatchedCourses.length > 0
          ? yearMatchedCourses
          : programmeCourses
              .filter((c) => c.yearOfStudy === yr)
              .slice(0, 4)
              .map((c) => `${c.courseCode} — ${c.courseTitle}`);

      // Distribute required + additional skills progressively across the actual programme years
      const allSkills = [...career.topSkillsRequired, ...career.recommendedAdditionalSkills];
      const skillsPerYear = Math.max(2, Math.ceil(allSkills.length / durationYears));
      const startIdx = (yr - 1) * skillsPerYear;
      const yearSkills = allSkills.slice(startIdx, startIdx + skillsPerYear);

      const yearProjects = career.projectRecommendations
        .filter((p) =>
          yr === 1
            ? p.minYearOfStudy === 1
            : isFinalYear
            ? p.minYearOfStudy >= 2
            : p.minYearOfStudy <= yr
        )
        .map((p) => p.title);

      const academicFocus: string[] = [];
      const careerMilestones: string[] = [];

      if (yr === 1) {
        academicFocus.push(
          `Build strong foundational mastery in Year 1 ${profile.programmeName || 'degree'} core courses`
        );
        academicFocus.push('Develop structured problem-solving and technical documentation habits');
        careerMilestones.push('Complete foundational skill exercises and set up a clean project portfolio');
        careerMilestones.push('Prepare for first Industrial Practical Training (PT1) / field attachment');
      } else if (isFinalYear) {
        academicFocus.push('Complete advanced specialization courses and Final Year Project / Dissertation');
        academicFocus.push(`Synthesize domain coursework toward ${career.title} entry requirements`);
        careerMilestones.push('Tailor CV, academic transcripts, and portfolio for graduate schemes & entry roles');
        careerMilestones.push(
          preferences.preferredPostgraduateDirection
            ? `Prepare applications for postgraduate study (${preferences.preferredPostgraduateDirection}) or professional accreditation`
            : 'Practice technical interviews and apply for graduate trainee / professional registration pathways'
        );
      } else {
        academicFocus.push(`Deepen intermediate analytical and applied coursework in Year ${yr}`);
        academicFocus.push('Connect theoretical models from lectures to real-world datasets or systems');
        careerMilestones.push(`Secure and excel in Year ${yr} Industrial Practical Training / Internship`);
        careerMilestones.push('Build 1–2 intermediate portfolio projects demonstrating core career skills');
      }

      years.push({
        yearNumber: yr,
        yearLabel: `Year ${yr}${isFinalYear ? ' (Final Year)' : ''}`,
        isCurrentYear,
        isCompletedYear,
        academicFocus,
        relevantDegreeCourses: fallbackYearCourses,
        technicalSkillsFocus: yearSkills.length > 0 ? yearSkills : career.topSkillsRequired.slice(0, 3),
        recommendedProjects:
          yearProjects.length > 0
            ? yearProjects
            : [`Year ${yr} applied project in ${career.title}`],
        careerPreparationMilestones: careerMilestones,
      });
    }

    const nowIso = new Date().toISOString();
    const roadmap: StudentCareerRoadmap = {
      id: `roadmap_${career.id}`,
      userId: uid || 'anonymous',
      careerId: career.id,
      careerTitle: career.title,
      programmeId: profile.programmeId || '',
      programmeName: profile.programmeName || profile.programme || 'Degree Programme',
      durationYears,
      currentYearOfStudy,
      targetLocation: preferences.preferredLocation || profile.country || 'Tanzania',
      years,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (uid) {
      await this.saveStudentCareerRoadmap(roadmap, uid);
    }

    return roadmap;
  }

  // ==========================================================================
  // STUDENT CAREER PREFERENCES & ROADMAP PERSISTENCE (Sections 28, 29, 36)
  // ==========================================================================

  public async getStudentCareerPreferences(providedUid?: string): Promise<StudentCareerPreference> {
    const uid = getEffectiveUid(providedUid);
    const defaultPref: StudentCareerPreference = {
      userId: uid,
      careerInterests: [],
      preferredIndustries: [],
      preferredLocation: 'Tanzania',
      workArrangement: 'Flexible',
      targetCareerId: '',
      targetCareerTitle: '',
      knownSkills: [],
      careerGoals: '',
      preferredPostgraduateDirection: '',
      savedCareerIds: [],
      updatedAt: '',
    };

    if (!uid) return defaultPref;

    const cacheKey = `${PREF_CACHE_PREFIX}${uid}`;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.userId === uid) {
          return { ...defaultPref, ...parsed };
        }
      }
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        const snap = await getDoc(doc(db, 'students', uid, 'career_preferences', 'main'));
        if (snap.exists()) {
          const data = snap.data() as StudentCareerPreference;
          const merged = { ...defaultPref, ...data, userId: uid };
          try {
            localStorage.setItem(cacheKey, JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        }
      } catch {
        // ignore
      }
    }

    return defaultPref;
  }

  public async saveStudentCareerPreferences(
    updates: Partial<StudentCareerPreference>,
    providedUid?: string
  ): Promise<StudentCareerPreference> {
    const uid = getEffectiveUid(providedUid);
    const current = await this.getStudentCareerPreferences(uid);
    const updated: StudentCareerPreference = {
      ...current,
      ...updates,
      userId: uid,
      updatedAt: new Date().toISOString(),
    };

    if (!uid) return updated;

    try {
      localStorage.setItem(`${PREF_CACHE_PREFIX}${uid}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await setDoc(doc(db, 'students', uid, 'career_preferences', 'main'), updated, {
          merge: true,
        });
      } catch (err) {
        console.warn('CareerHubService: Saved career preferences locally:', err);
      }
    }

    return updated;
  }

  public async getSavedCareerRoadmaps(providedUid?: string): Promise<StudentCareerRoadmap[]> {
    const uid = getEffectiveUid(providedUid);
    if (!uid) return [];

    const cacheKey = `${ROADMAP_CACHE_PREFIX}${uid}`;
    let cached: StudentCareerRoadmap[] = [];
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) cached = parsed;
      }
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        const snap = await getDocs(
          query(collection(db, 'students', uid, 'career_roadmaps'), limit(20))
        );
        if (!snap.empty) {
          const list: StudentCareerRoadmap[] = [];
          snap.forEach((d) => {
            const data = d.data() as StudentCareerRoadmap;
            if (data && data.careerTitle) list.push(data);
          });
          try {
            localStorage.setItem(cacheKey, JSON.stringify(list));
          } catch {
            // ignore
          }
          return list;
        }
      } catch {
        // ignore
      }
    }

    return cached;
  }

  public async saveStudentCareerRoadmap(
    roadmap: StudentCareerRoadmap,
    providedUid?: string
  ): Promise<void> {
    const uid = getEffectiveUid(providedUid);
    if (!uid) return;

    const existing = await this.getSavedCareerRoadmaps(uid);
    const updated = [roadmap, ...existing.filter((r) => r.id !== roadmap.id)];

    try {
      localStorage.setItem(`${ROADMAP_CACHE_PREFIX}${uid}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await setDoc(
          doc(db, 'students', uid, 'career_roadmaps', roadmap.id),
          { ...roadmap, userId: uid },
          { merge: true }
        );
      } catch {
        // ignore
      }
    }
  }

  public async deleteStudentCareerRoadmap(
    roadmapId: string,
    providedUid?: string
  ): Promise<StudentCareerRoadmap[]> {
    const uid = getEffectiveUid(providedUid);
    if (!uid) return [];

    const existing = await this.getSavedCareerRoadmaps(uid);
    const updated = existing.filter((r) => r.id !== roadmapId);

    try {
      localStorage.setItem(`${ROADMAP_CACHE_PREFIX}${uid}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await deleteDoc(doc(db, 'students', uid, 'career_roadmaps', roadmapId));
      } catch {
        // ignore
      }
    }
    return updated;
  }

  // ==========================================================================
  // ELIGIBILITY-AWARE SCHOLARSHIPS & OPPORTUNITIES (Sections 24, 25, 26, 27)
  // ==========================================================================

  public evaluateOpportunitiesForStudent(
    profile: StudentProfile,
    courses: Course[] = []
  ): EvaluatedCareerOpportunity[] {
    const studentCluster = inferDisciplineCluster(profile, courses);
    const degLevelRaw = (profile.degreeLevel || "Bachelor's Degree").toLowerCase();
    const isUndergrad =
      degLevelRaw.includes('bachelor') ||
      degLevelRaw.includes('diploma') ||
      degLevelRaw.includes('certificate');
    const yearNum = parseInt(String(profile.yearOfStudy || '1').replace(/\D/g, ''), 10) || 1;
    const durationNum = Number(profile.programmeDurationYears) || 3;
    const isFinalYear = yearNum >= durationNum;

    return VERIFIED_CAREER_OPPORTUNITIES.map((opp) => {
      const clusterMatches =
        opp.eligibleDisciplineClusters[0] === 'ALL' ||
        (opp.eligibleDisciplineClusters as CareerDisciplineClusterId[]).includes(studentCluster);

      const levelMatches =
        opp.eligibleStudyLevels.includes('All Levels') ||
        (isUndergrad && opp.eligibleStudyLevels.includes('Undergraduate')) ||
        (!isUndergrad && opp.eligibleStudyLevels.includes('Postgraduate'));

      const reasons: string[] = [];
      let status: EvaluatedCareerOpportunity['eligibilityStatus'] = 'Check Specific Criteria';

      if (clusterMatches && levelMatches) {
        status = 'Eligible Match';
        reasons.push(
          `Aligned with your ${profile.programmeName || 'academic discipline'} and ${
            isUndergrad ? 'Undergraduate' : 'Postgraduate'
          } study level`
        );
      } else if (clusterMatches && !levelMatches && opp.eligibleStudyLevels.includes('Postgraduate')) {
        status = isFinalYear ? 'Eligible Match' : 'Future / Next Level';
        reasons.push(
          isFinalYear
            ? 'Final-year undergraduate students can prepare applications for upcoming postgraduate intake'
            : 'Postgraduate opportunity — bookmark for final-year preparation after completing your first degree'
        );
      } else {
        status = 'Check Specific Criteria';
        reasons.push(
          `Targeted primarily to ${opp.eligibleProgrammesOrFields.join(', ')}`
        );
      }

      return {
        opportunity: opp,
        eligibilityStatus: status,
        eligibilityReasons: reasons,
      };
    });
  }

  // ==========================================================================
  // DEDICATED AI CAREER ADVISOR & PLAY STORE SAFETY REPORTING (Sections 20-22, 37)
  // ==========================================================================

  public async askAICareerAdvisor(params: {
    question: string;
    profile: StudentProfile;
    courses: Course[];
    selectedCareer?: MatchedCareerRecommendation | null;
    preferences?: StudentCareerPreference | null;
    savedRoadmap?: StudentCareerRoadmap | null;
    conversationHistory?: Array<{ role: 'user' | 'advisor'; text: string }>;
  }): Promise<{
    answer: string;
    epistemicTags: Array<'Known Academic Context' | 'General Career Guidance' | 'Market Data Unavailable'>;
    suggestedFollowUps: string[];
  }> {
    const uid = getEffectiveUid(params.profile.uid);

    // Send ONLY minimum required academic & career context (Section 21)
    const minimalContext = {
      programme: params.profile.programmeName || params.profile.programme || 'Not set',
      department: params.profile.departmentName || params.profile.department || 'Not set',
      university: params.profile.universityName || params.profile.university || 'Not set',
      yearOfStudy: params.profile.yearOfStudy || 'Not set',
      semester: params.profile.semester || 'Not set',
      programmeDurationYears: params.profile.programmeDurationYears || 3,
      currentCourses: params.courses.slice(0, 8).map((c) => ({
        code: c.code || c.courseCode,
        title: c.title || c.courseTitle,
      })),
      declaredPreferences: params.preferences
        ? {
            careerInterests: params.preferences.careerInterests,
            preferredIndustries: params.preferences.preferredIndustries,
            preferredLocation: params.preferences.preferredLocation,
            workArrangement: params.preferences.workArrangement,
            knownSkills: params.preferences.knownSkills,
            careerGoals: params.preferences.careerGoals,
            preferredPostgraduateDirection: params.preferences.preferredPostgraduateDirection,
          }
        : null,
      selectedCareer: params.selectedCareer
        ? {
            title: params.selectedCareer.career.title,
            matchLabel: params.selectedCareer.matchLabel,
            topSkillsRequired: params.selectedCareer.career.topSkillsRequired,
            existingOrDevelopingSkills: params.selectedCareer.skillGap.existingOrDeveloping.map(
              (s) => s.skill
            ),
            needsDevelopmentSkills: params.selectedCareer.skillGap.needsDevelopment.map(
              (s) => s.skill
            ),
            nextRecommendedSkills: params.selectedCareer.skillGap.nextRecommendedSkills,
            matchedProgrammeCourses: params.selectedCareer.matchedDegreeCourses.map(
              (c) => `${c.courseCode} (${c.courseTitle})`
            ),
          }
        : null,
      savedRoadmapSummary: params.savedRoadmap
        ? {
            careerTitle: params.savedRoadmap.careerTitle,
            durationYears: params.savedRoadmap.durationYears,
            currentYearOfStudy: params.savedRoadmap.currentYearOfStudy,
          }
        : null,
    };

    const res = await fetch('/api/career/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: params.question,
        studentCareerContext: minimalContext,
        conversationHistory: (params.conversationHistory || []).slice(-6),
        callerUid: uid || 'student_user',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Could not reach VENUE AI Career Advisor.');
    }

    return {
      answer: data.answer,
      epistemicTags: Array.isArray(data.epistemicTags)
        ? data.epistemicTags
        : ['Known Academic Context', 'General Career Guidance'],
      suggestedFollowUps: Array.isArray(data.suggestedFollowUps) ? data.suggestedFollowUps : [],
    };
  }

  public async reportAdvisorResponse(params: {
    messageId: string;
    messageExcerpt: string;
    category: AICareerReportCategory;
    details?: string;
    careerContext?: string;
    programmeName?: string;
    userId?: string;
  }): Promise<void> {
    const uid = getEffectiveUid(params.userId);
    const report: AICareerReportRecord = {
      id: `career_rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: uid || 'anonymous',
      messageId: params.messageId,
      messageExcerpt: (params.messageExcerpt || '').slice(0, 400),
      category: params.category,
      details: (params.details || '').trim().slice(0, 500),
      careerContext: params.careerContext || '',
      programmeName: params.programmeName || '',
      createdAt: new Date().toISOString(),
    };

    if (auth.currentUser && uid) {
      try {
        await setDoc(doc(db, 'ai_career_reports', report.id), report);
      } catch {
        // non-blocking
      }
    }

    try {
      await fetch('/api/career/report-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
    } catch {
      // non-blocking
    }
  }
}

export const careerHubService = new CareerHubService();
