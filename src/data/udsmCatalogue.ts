import { Course } from '../types';
import { UDSM_VERIFIED_COURSES, UDSM_DEPARTMENTS } from './udsmProspectus2025';

const deptNameMap = new Map<string, string>(
  UDSM_DEPARTMENTS.map(d => [d.id, d.name])
);

const COLOR_THEMES: Array<'purple' | 'blue' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'teal'> = [
  'blue', 'purple', 'emerald', 'amber', 'cyan', 'rose', 'indigo', 'teal'
];

/**
 * Clean canonical course catalogue derived strictly from UDSM_VERIFIED_COURSES.
 * Contains ZERO fabricated lecturer names, zero fake materials, zero fake past papers,
 * and zero fake progress statistics.
 */
export const UDSM_BSC_MATH_STATS_COURSES: Course[] = UDSM_VERIFIED_COURSES
  .filter(c =>
    c.programmeId === 'udsm-bsc-math-stats' ||
    c.programmeId === 'bsc-math-stats' ||
    c.programmeId === 'udsm-conas-math-bsc-math-stats'
  )
  .map((c, index) => {
    const yearStr = `Year ${c.yearOfStudy}` as 'Year 1' | 'Year 2' | 'Year 3';
    const semStr = `Semester ${c.semester}` as 'Semester 1' | 'Semester 2';
    const courseType = (c.status === 'Core' || c.status === 'Elective' ? c.status : 'Core') as 'Core' | 'Elective';
    return {
      id: c.id,
      code: c.code,
      name: c.title,
      year: yearStr,
      semester: semStr,
      credits: c.credits,
      type: courseType,
      colorTheme: COLOR_THEMES[index % COLOR_THEMES.length],
      progress: 0,
      department: deptNameMap.get(c.departmentId) || 'Department of Mathematics',
      description: `${c.code} — ${c.title}. Official ${c.credits}-credit ${courseType.toLowerCase()} course (${yearStr}, ${semStr}).`,
      instructor: {
        name: 'Lecturer Not Assigned',
        title: 'Academic Staff',
        office: 'Not specified',
        email: 'Not specified',
        officeHours: 'Not specified',
        avatar: '',
      },
      materials: [],
      recommendedResources: [],
      pastPapersCount: 0,
      syllabus: [],
    };
  });

