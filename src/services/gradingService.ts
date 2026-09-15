import {
  UniversityGradingSystem,
  GradeScaleEntry,
  DegreeClassification,
  StudentResult,
  SemesterGpaSummary,
  CumulativeGpaSummary,
} from '../types';

// ============================================================================
// UNIVERSITY GRADING SYSTEM REGISTRY
// Supports UDSM (5.0 scale) and extensible to other universities (4.0 / 5.0)
// Kept strictly separate from student results data
// ============================================================================

export const UDSM_GRADING_SYSTEM: UniversityGradingSystem = {
  id: 'udsm_standard_system',
  universityId: 'udsm',
  name: 'University of Dar es Salaam (UDSM) 5.0 Undergraduate Grading System',
  scaleType: '5.0',
  maxGpa: 5.0,
  passGpa: 2.0,
  grades: [
    {
      grade: 'A',
      gradePoint: 5.0,
      description: 'Excellent',
      percentageRange: '70% – 100%',
      isPass: true,
    },
    {
      grade: 'B+',
      gradePoint: 4.0,
      description: 'Very Good',
      percentageRange: '60% – 69%',
      isPass: true,
    },
    {
      grade: 'B',
      gradePoint: 3.0,
      description: 'Good',
      percentageRange: '50% – 59%',
      isPass: true,
    },
    {
      grade: 'C',
      gradePoint: 2.0,
      description: 'Satisfactory / Pass',
      percentageRange: '40% – 49%',
      isPass: true,
    },
    {
      grade: 'D',
      gradePoint: 1.0,
      description: 'Marginal Fail',
      percentageRange: '35% – 39%',
      isPass: false,
    },
    {
      grade: 'E',
      gradePoint: 0.0,
      description: 'Absolute Fail',
      percentageRange: '0% – 34%',
      isPass: false,
    },
  ],
  classifications: [
    {
      name: 'First Class Honours',
      minGpa: 4.4,
      maxGpa: 5.0,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Highest academic undergraduate distinction (GPA 4.4 – 5.0)',
    },
    {
      name: 'Upper Second Class',
      minGpa: 3.5,
      maxGpa: 4.39,
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      description: 'Upper division honours distinction (GPA 3.5 – 4.3)',
    },
    {
      name: 'Lower Second Class',
      minGpa: 2.7,
      maxGpa: 3.49,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'Lower division honours (GPA 2.7 – 3.4)',
    },
    {
      name: 'Pass',
      minGpa: 2.0,
      maxGpa: 2.69,
      badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
      description: 'Satisfactory academic completion (GPA 2.0 – 2.6)',
    },
    {
      name: 'Fail',
      minGpa: 0.0,
      maxGpa: 1.99,
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      description: 'Below graduation threshold (GPA < 2.0)',
    },
  ],
};

export const STANDARD_4_0_GRADING_SYSTEM: UniversityGradingSystem = {
  id: 'standard_4_0_system',
  universityId: 'standard_4_0',
  name: 'Standard 4.0 Academic Grading System',
  scaleType: '4.0',
  maxGpa: 4.0,
  passGpa: 2.0,
  grades: [
    {
      grade: 'A',
      gradePoint: 4.0,
      description: 'Excellent',
      percentageRange: '85% – 100%',
      isPass: true,
    },
    {
      grade: 'B+',
      gradePoint: 3.5,
      description: 'Very Good',
      percentageRange: '75% – 84%',
      isPass: true,
    },
    {
      grade: 'B',
      gradePoint: 3.0,
      description: 'Good',
      percentageRange: '65% – 74%',
      isPass: true,
    },
    {
      grade: 'C+',
      gradePoint: 2.5,
      description: 'Competent',
      percentageRange: '55% – 64%',
      isPass: true,
    },
    {
      grade: 'C',
      gradePoint: 2.0,
      description: 'Passing',
      percentageRange: '50% – 54%',
      isPass: true,
    },
    {
      grade: 'D',
      gradePoint: 1.0,
      description: 'Marginal Fail',
      percentageRange: '40% – 49%',
      isPass: false,
    },
    {
      grade: 'F',
      gradePoint: 0.0,
      description: 'Failing',
      percentageRange: '0% – 39%',
      isPass: false,
    },
  ],
  classifications: [
    {
      name: 'First Class Honours / Summa Cum Laude',
      minGpa: 3.7,
      maxGpa: 4.0,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Highest academic honour (GPA 3.7 – 4.0)',
    },
    {
      name: 'Upper Second Class / Magna Cum Laude',
      minGpa: 3.3,
      maxGpa: 3.69,
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      description: 'High academic distinction (GPA 3.3 – 3.69)',
    },
    {
      name: 'Lower Second Class / Cum Laude',
      minGpa: 2.7,
      maxGpa: 3.29,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'Academic standing with honours (GPA 2.7 – 3.29)',
    },
    {
      name: 'Pass',
      minGpa: 2.0,
      maxGpa: 2.69,
      badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
      description: 'Satisfactory standard (GPA 2.0 – 2.69)',
    },
    {
      name: 'Fail',
      minGpa: 0.0,
      maxGpa: 1.99,
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      description: 'Academic warning / Unsatisfactory (GPA < 2.0)',
    },
  ],
};

// University-to-Grading-System registry mapping
const GRADING_SYSTEMS_REGISTRY: Record<string, UniversityGradingSystem> = {
  udsm: UDSM_GRADING_SYSTEM,
  udom: {
    ...UDSM_GRADING_SYSTEM,
    id: 'udom_standard_system',
    universityId: 'udom',
    name: 'University of Dodoma (UDOM) 5.0 Grading System',
  },
  sua: {
    ...UDSM_GRADING_SYSTEM,
    id: 'sua_standard_system',
    universityId: 'sua',
    name: 'Sokoine University of Agriculture (SUA) 5.0 Grading System',
  },
  must: {
    ...UDSM_GRADING_SYSTEM,
    id: 'must_standard_system',
    universityId: 'must',
    name: 'Mbeya University of Science and Technology (MUST) 5.0 Grading System',
  },
  aru: {
    ...UDSM_GRADING_SYSTEM,
    id: 'aru_standard_system',
    universityId: 'aru',
    name: 'Ardhi University (ARU) 5.0 Grading System',
  },
  suza: {
    ...UDSM_GRADING_SYSTEM,
    id: 'suza_standard_system',
    universityId: 'suza',
    name: 'State University of Zanzibar (SUZA) 5.0 Grading System',
  },
  muhas: {
    ...UDSM_GRADING_SYSTEM,
    id: 'muhas_standard_system',
    universityId: 'muhas',
    name: 'MUHAS Medical & Allied Sciences 5.0 Grading System',
  },
};

/**
 * Retrieves the appropriate grading system for a given university.
 * Dynamic and extensible: default is UDSM's official 5.0 grading scale.
 */
export function getGradingSystem(universityId?: string): UniversityGradingSystem {
  if (!universityId) return UDSM_GRADING_SYSTEM;
  const key = universityId.toLowerCase().trim();
  return GRADING_SYSTEMS_REGISTRY[key] || UDSM_GRADING_SYSTEM;
}

/**
 * Validates if a grade string belongs to the official grading system.
 */
export function isValidGrade(grade?: string, universityId?: string): boolean {
  if (!grade) return false;
  const gradingSystem = getGradingSystem(universityId);
  const normalized = grade.trim().toUpperCase();
  return gradingSystem.grades.some((g) => g.grade.toUpperCase() === normalized);
}

/**
 * Calculates Quality Points for an individual course:
 * Quality Points = Credits × Grade Point
 * Maintains full precision numeric calculation.
 */
export function calculateQualityPoints(credits: number, gradePoint: number): number {
  const safeCredits = Math.max(0, Number(credits) || 0);
  const safeGradePoint = Math.max(0, Number(gradePoint) || 0);
  return safeCredits * safeGradePoint;
}

/**
 * Maps a letter grade to its official numerical grade point.
 */
export function mapGradeToGradePoint(grade: string, universityId?: string): number {
  const gradingSystem = getGradingSystem(universityId);
  const normalizedGrade = grade.trim().toUpperCase();
  const found = gradingSystem.grades.find(
    (g) => g.grade.toUpperCase() === normalizedGrade
  );
  return found ? found.gradePoint : 0.0;
}

/**
 * Filters and prepares student results for repeated course attempts.
 * If a course has been repeated, marks older attempts with isRepeated = true.
 * Ensures only active attempts (defaulting to the latest/highest attempt) are included in GPA.
 */
export function filterActiveCourseAttempts(results: StudentResult[]): StudentResult[] {
  if (!results || results.length <= 1) return results || [];

  // Group by canonical course code / id
  const courseAttempts = new Map<string, StudentResult[]>();
  results.forEach((r) => {
    const key = (r.courseCode || r.courseId || '').toUpperCase().replace(/\s+/g, '');
    const list = courseAttempts.get(key) || [];
    list.push(r);
    courseAttempts.set(key, list);
  });

  const processed: StudentResult[] = [];

  courseAttempts.forEach((attempts) => {
    if (attempts.length === 1) {
      processed.push({
        ...attempts[0],
        attemptNumber: attempts[0].attemptNumber || 1,
        isRepeated: false,
        isIncludedInGpa: attempts[0].isIncludedInGpa !== false,
      });
    } else {
      // Multiple attempts exist: sort chronologically (or by createdAt/updatedAt)
      attempts.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return timeA - timeB;
      });

      attempts.forEach((att, idx) => {
        const isLatest = idx === attempts.length - 1;
        processed.push({
          ...att,
          attemptNumber: idx + 1,
          isRepeated: true,
          // Institutional policy: latest attempt is included by default
          isIncludedInGpa: att.isIncludedInGpa !== undefined ? att.isIncludedInGpa : isLatest,
        });
      });
    }
  });

  return processed;
}

/**
 * Finds degree classification based on cumulative GPA.
 */
export function getDegreeClassification(
  cgpa: number,
  universityId?: string
): DegreeClassification {
  const gradingSystem = getGradingSystem(universityId);
  const clampedGpa = Math.max(0, Math.min(gradingSystem.maxGpa, cgpa));

  for (const classification of gradingSystem.classifications) {
    if (clampedGpa >= classification.minGpa && clampedGpa <= classification.maxGpa) {
      return classification;
    }
  }

  // Fallback
  return (
    gradingSystem.classifications[gradingSystem.classifications.length - 1] || {
      name: 'Pass',
      minGpa: 2.0,
      maxGpa: 2.69,
      badgeColor: 'text-slate-400 bg-slate-800 border-slate-700',
      description: 'Satisfactory completion',
    }
  );
}

// ============================================================================
// GPA & CGPA MATHEMATICAL ENGINE
// Formula:
//   Quality Points = Credits × Grade Point
//   Semester GPA = Σ(Quality Points) / Σ(Credits)
//   Cumulative GPA (CGPA) = Σ(All Quality Points) / Σ(All Credits)
// ============================================================================

/**
 * Calculates semester GPA for a set of student results:
 * Total Credits = Σ(Credits of graded courses)
 * Total Quality Points = Σ(Credits × Grade Point)
 * Semester GPA = Total Quality Points / Total Credits
 *
 * NOTE: Courses where grade is not entered or pending are EXCLUDED from
 * the calculation and NOT treated as 0, preventing GPA distortion.
 */
export function calculateSemesterGPA(
  results: StudentResult[],
  universityId?: string
): {
  totalCredits: number;
  totalQualityPoints: number;
  totalWeightedPoints: number;
  gpa: number;
  isGraded: boolean;
  gradedCoursesCount: number;
  totalCoursesCount: number;
} {
  if (!results || results.length === 0) {
    return {
      totalCredits: 0,
      totalQualityPoints: 0,
      totalWeightedPoints: 0,
      gpa: 0.0,
      isGraded: false,
      gradedCoursesCount: 0,
      totalCoursesCount: 0,
    };
  }

  let totalCredits = 0;
  let totalQualityPoints = 0;
  let gradedCoursesCount = 0;

  for (const r of results) {
    // Check if course is valid, active, and has an official entered grade
    const hasGrade = Boolean(r.grade && r.grade.trim() && isValidGrade(r.grade, universityId));
    const isIncluded = r.isIncludedInGpa !== false;

    if (hasGrade && isIncluded) {
      const credits = Math.max(0, Number(r.credits) || 0);
      const gradePoint = Number(r.gradePoint !== undefined ? r.gradePoint : mapGradeToGradePoint(r.grade, universityId));
      const qp = calculateQualityPoints(credits, gradePoint);

      totalCredits += credits;
      totalQualityPoints += qp;
      gradedCoursesCount += 1;
    }
  }

  const isGraded = totalCredits > 0 && gradedCoursesCount > 0;
  // Compute using full float, round displayed GPA to 2 decimal places
  const rawGpa = isGraded ? totalQualityPoints / totalCredits : 0.0;
  const gpa = Number(rawGpa.toFixed(2));

  return {
    totalCredits,
    totalQualityPoints: Number(totalQualityPoints.toFixed(2)),
    totalWeightedPoints: Number(totalQualityPoints.toFixed(2)), // legacy alias
    gpa,
    isGraded,
    gradedCoursesCount,
    totalCoursesCount: results.length,
  };
}

// Backward-compatible alias
export const calculateSemesterGpa = calculateSemesterGPA;

/**
 * Calculates Cumulative GPA (CGPA) across all completed semesters:
 * CGPA = Σ(Quality Points from all included semesters) / Σ(Credits from all included semesters)
 *
 * Mathematically weighted by credits across all eligible graded semesters.
 */
export function calculateCGPA(
  results: StudentResult[],
  universityId?: string,
  currentSemester?: string,
  currentAcademicYear?: string
): CumulativeGpaSummary {
  const gradingSystem = getGradingSystem(universityId);

  if (!results || results.length === 0) {
    return {
      totalCredits: 0,
      totalQualityPoints: 0,
      totalWeightedPoints: 0,
      cgpa: 0.0,
      maxGpa: gradingSystem.maxGpa,
      scaleType: gradingSystem.scaleType,
      classification: getDegreeClassification(0.0, universityId),
      currentSemesterGpa: 0.0,
      semesters: [],
      totalCoursesCount: 0,
      totalGradedCoursesCount: 0,
    };
  }

  // 1. Group results by composite semester key (e.g. "2025/2026 • Semester 1")
  const groups = new Map<string, StudentResult[]>();

  for (const r of results) {
    const semName = (r.semester || 'Semester 1').trim();
    const acadYear = (r.academicYear || '2025/2026').trim();
    const groupKey = `${acadYear} • ${semName}`;

    const existing = groups.get(groupKey) || [];
    existing.push(r);
    groups.set(groupKey, existing);
  }

  // 2. Compute semester summaries
  const semesterSummaries: SemesterGpaSummary[] = [];

  groups.forEach((semResults, groupKey) => {
    const first = semResults[0];
    const semCalc = calculateSemesterGPA(semResults, universityId);

    semesterSummaries.push({
      key: groupKey,
      academicYear: first.academicYear || '2025/2026',
      semester: first.semester || 'Semester 1',
      yearOfStudy: first.yearOfStudy ? String(first.yearOfStudy) : undefined,
      totalCredits: semCalc.totalCredits,
      totalQualityPoints: semCalc.totalQualityPoints,
      totalWeightedPoints: semCalc.totalWeightedPoints,
      gpa: semCalc.gpa,
      isGraded: semCalc.isGraded,
      resultsCount: semResults.length,
      gradedCoursesCount: semCalc.gradedCoursesCount,
      results: semResults,
    });
  });

  // Sort semesters chronologically
  semesterSummaries.sort((a, b) => a.key.localeCompare(b.key));

  // 3. Compute Cumulative Performance
  // CGPA = Σ(All Quality Points) / Σ(All Credits)
  let totalCumulativeCredits = 0;
  let totalCumulativeQualityPoints = 0;
  let totalGradedCoursesCount = 0;

  for (const sem of semesterSummaries) {
    if (sem.isGraded) {
      totalCumulativeCredits += sem.totalCredits;
      totalCumulativeQualityPoints += sem.totalQualityPoints;
      totalGradedCoursesCount += sem.gradedCoursesCount;
    }
  }

  const rawCgpa =
    totalCumulativeCredits > 0
      ? totalCumulativeQualityPoints / totalCumulativeCredits
      : 0.0;
  const cgpa = Number(rawCgpa.toFixed(2));

  // 4. Determine current semester GPA
  let currentSemesterGpa = 0.0;
  if (currentSemester) {
    const matchingSem = semesterSummaries.find(
      (s) =>
        s.semester.toLowerCase() === currentSemester.toLowerCase() &&
        (!currentAcademicYear ||
          s.academicYear.toLowerCase() === currentAcademicYear.toLowerCase())
    );
    if (matchingSem && matchingSem.isGraded) {
      currentSemesterGpa = matchingSem.gpa;
    } else if (semesterSummaries.length > 0) {
      const lastGraded = [...semesterSummaries].reverse().find((s) => s.isGraded);
      currentSemesterGpa = lastGraded ? lastGraded.gpa : 0.0;
    }
  } else if (semesterSummaries.length > 0) {
    const lastGraded = [...semesterSummaries].reverse().find((s) => s.isGraded);
    currentSemesterGpa = lastGraded ? lastGraded.gpa : 0.0;
  }

  return {
    totalCredits: totalCumulativeCredits,
    totalQualityPoints: Number(totalCumulativeQualityPoints.toFixed(2)),
    totalWeightedPoints: Number(totalCumulativeQualityPoints.toFixed(2)), // legacy alias
    cgpa,
    maxGpa: gradingSystem.maxGpa,
    scaleType: gradingSystem.scaleType,
    classification: getDegreeClassification(cgpa, universityId),
    currentSemesterGpa,
    semesters: semesterSummaries,
    totalCoursesCount: results.length,
    totalGradedCoursesCount,
  };
}

// Backward-compatible alias
export const calculateCumulativeGpa = calculateCGPA;
