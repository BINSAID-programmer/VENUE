import fs from 'fs';
import path from 'path';
import {
  OFFICIAL_UDSM_UNIVERSITY,
  AUDITED_ACADEMIC_UNITS,
  AUDITED_DEPARTMENTS,
  AUDITED_PROGRAMMES,
  AUDITED_CANONICAL_COURSES,
  AUDITED_PROGRAMME_COURSES,
  AUDITED_COURSE_RECORDS,
} from '../src/data/udsmAuditedCatalogue2025';
import {
  PROGRAMME_1_COURSES,
  PROGRAMME_2_COURSES,
  PROGRAMME_3_COURSES,
  AuthoritativeCourseItem,
} from '../src/data/authoritativeBiotechCurriculum';
import {
  ProgrammeRecord,
  CanonicalCourseRecord,
  ProgrammeCourseRecord,
  CourseRecord,
} from '../src/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, ' ');
}

function canonicalDocId(code: string): string {
  return normalizeCode(code).toLowerCase().replace(/\s+/g, '_');
}

const SOURCE_PROSPECTUS = 'UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)';

async function updateAuditedCatalogue() {
  console.log('--- UPDATING IN-CODE UDSM AUDITED CATALOGUE 2025 ---');

  // 1. PROGRAMMES
  const progCopy: ProgrammeRecord[] = [...AUDITED_PROGRAMMES];
  const bscAppChem = progCopy.find((p) => p.id === 'bsc-app-micr-chem');
  if (bscAppChem) {
    bscAppChem.departmentId = 'dept-biotech';
  }

  const bscMicrobioExists = progCopy.some((p) => p.id === 'bsc-microbio');
  if (!bscMicrobioExists) {
    progCopy.push({
      id: 'bsc-microbio',
      academicUnitId: 'conas',
      departmentId: 'dept-biotech',
      name: 'Bachelor of Science in Microbiology',
      shortName: 'BSc Microbiology',
      awardLevel: 'Bachelor Degree',
      durationYears: 3,
      universityId: 'udsm',
      studyMode: 'Full-Time',
      academicYear: '2025/2026',
      verified: true,
      source: SOURCE_PROSPECTUS,
    });
  }

  // 2. CANONICAL COURSES
  const canonicalMap = new Map<string, CanonicalCourseRecord>();
  for (const c of AUDITED_CANONICAL_COURSES) {
    canonicalMap.set(normalizeCode(c.code), c);
  }

  const allItems: AuthoritativeCourseItem[] = [
    ...PROGRAMME_1_COURSES,
    ...PROGRAMME_2_COURSES,
    ...PROGRAMME_3_COURSES,
  ];

  let addedCanonical = 0;
  for (const item of allItems) {
    const code = normalizeCode(item.code);
    if (!canonicalMap.has(code)) {
      const docId = canonicalDocId(code);
      const newCan: CanonicalCourseRecord = {
        id: docId,
        code: code,
        title: item.title,
        defaultCredits: item.credits,
        academicUnitId: 'conas',
        departmentId: item.offeringDepartmentId || 'dept-biotech',
        universityId: 'udsm',
        verified: true,
        source: SOURCE_PROSPECTUS,
        sourceType: 'official_prospectus',
        academicYear: '2025/2026',
      };
      canonicalMap.set(code, newCan);
      addedCanonical++;
    }
  }
  const updatedCanonical = Array.from(canonicalMap.values());
  console.log(`Canonical courses: ${updatedCanonical.length} (added ${addedCanonical})`);

  // 3. PROGRAMME COURSES
  const targetProgIds = new Set(['bsc-mol-bio', 'bsc-microbio', 'bsc-app-micr-chem']);
  const pcFiltered = AUDITED_PROGRAMME_COURSES.filter((pc) => !targetProgIds.has(pc.programmeId));

  const batches = [
    { progId: 'bsc-mol-bio', list: PROGRAMME_1_COURSES },
    { progId: 'bsc-microbio', list: PROGRAMME_2_COURSES },
    { progId: 'bsc-app-micr-chem', list: PROGRAMME_3_COURSES },
  ];

  const newProgCourses: ProgrammeCourseRecord[] = [];
  const newCourseRecords: CourseRecord[] = [];

  for (const { progId, list } of batches) {
    for (const item of list) {
      const code = normalizeCode(item.code);
      const canonical = canonicalMap.get(code);
      const canId = canonical ? canonical.id : canonicalDocId(code);
      const relDocId = `${progId}_${slugify(code)}_y${item.yearOfStudy}s${item.semester}`;
      const courseDocId = `udsm_${progId}_${slugify(code)}_y${item.yearOfStudy}s${item.semester}`;

      const pcRec: ProgrammeCourseRecord = {
        id: relDocId,
        programmeId: progId,
        courseId: canId,
        code: code,
        title: item.title,
        credits: item.credits,
        yearOfStudy: item.yearOfStudy,
        semester: item.semester,
        status: item.status,
        academicUnitId: 'conas',
        departmentId: 'dept-biotech',
        offeringDepartmentId: item.offeringDepartmentId || 'dept-biotech',
        offeringDepartmentName: item.offeringDepartmentName || 'Department of Molecular Biology and Biotechnology',
        universityId: 'udsm',
        verified: true,
        source: SOURCE_PROSPECTUS,
        sourceType: 'official_prospectus',
        academicYear: '2025/2026',
      };

      if (item.electiveRule) pcRec.electiveRule = item.electiveRule;
      if (item.choiceConstraint) pcRec.choiceConstraint = item.choiceConstraint;
      if (item.note) pcRec.note = item.note;

      newProgCourses.push(pcRec);

      const crRec: CourseRecord = {
        id: courseDocId,
        courseId: courseDocId,
        code: code,
        courseCode: code,
        title: item.title,
        courseName: item.title,
        credits: item.credits,
        yearOfStudy: item.yearOfStudy,
        semester: item.semester,
        status: item.status,
        courseType: item.status,
        programmeId: progId,
        departmentId: 'dept-biotech',
        academicUnitId: 'conas',
        universityId: 'udsm',
        offeringDepartmentId: item.offeringDepartmentId || 'dept-biotech',
        offeringDepartmentName: item.offeringDepartmentName || 'Department of Molecular Biology and Biotechnology',
        verified: true,
        active: true,
        source: SOURCE_PROSPECTUS,
        sourceType: 'official_prospectus',
        academicYear: '2025/2026',
      };

      if (item.electiveRule) crRec.electiveRule = item.electiveRule;
      if (item.choiceConstraint) crRec.choiceConstraint = item.choiceConstraint;
      if (item.note) {
        crRec.note = item.note;
        crRec.notes = item.note;
      }

      newCourseRecords.push(crRec);
    }
  }

  const updatedProgrammeCourses = [...pcFiltered, ...newProgCourses];

  // 4. COURSE RECORDS
  const crFiltered = AUDITED_COURSE_RECORDS.filter((cr) => !targetProgIds.has(cr.programmeId));
  const updatedCourseRecords = [...crFiltered, ...newCourseRecords];

  console.log(`Programme courses total: ${updatedProgrammeCourses.length} (added ${newProgCourses.length} authoritative)`);
  console.log(`Course records total: ${updatedCourseRecords.length} (added ${newCourseRecords.length} authoritative)`);

  // 5. Serialize into TypeScript file
  const outPath = path.resolve(process.cwd(), 'src/data/udsmAuditedCatalogue2025.ts');
  const fileContent = `// @ts-nocheck
// ============================================================================
// OFFICIAL UDSM UNDERGRADUATE CATALOGUE 2025/2026
// SOURCE OF TRUTH: UDSM Undergraduate Prospectus 2025/2026
// Extracted and audited hierarchy:
// University -> Academic Unit -> Department -> Programme -> Year -> Semester -> Course
// ============================================================================

import {
  AcademicUnitRecord,
  DepartmentRecord,
  ProgrammeRecord,
  CanonicalCourseRecord,
  ProgrammeCourseRecord,
  CourseRecord,
  UniversityRecord
} from '../types';

export const OFFICIAL_UDSM_UNIVERSITY: UniversityRecord = ${JSON.stringify(OFFICIAL_UDSM_UNIVERSITY, null, 2)};

export const AUDITED_ACADEMIC_UNITS: AcademicUnitRecord[] = ${JSON.stringify(AUDITED_ACADEMIC_UNITS, null, 2)};

export const AUDITED_DEPARTMENTS: DepartmentRecord[] = ${JSON.stringify(AUDITED_DEPARTMENTS, null, 2)};

export const AUDITED_PROGRAMMES: ProgrammeRecord[] = ${JSON.stringify(progCopy, null, 2)};

export const AUDITED_CANONICAL_COURSES: CanonicalCourseRecord[] = ${JSON.stringify(updatedCanonical, null, 2)};

const RAW_PROGRAMME_COURSES: any = ${JSON.stringify(updatedProgrammeCourses, null, 2)};
export const AUDITED_PROGRAMME_COURSES: ProgrammeCourseRecord[] = RAW_PROGRAMME_COURSES;

const RAW_COURSE_RECORDS: any = ${JSON.stringify(updatedCourseRecords, null, 2)};
export const AUDITED_COURSE_RECORDS: CourseRecord[] = RAW_COURSE_RECORDS;

export const UDSM_AUDITED_PROSPECTUS_DATA = {
  university: OFFICIAL_UDSM_UNIVERSITY,
  academicUnits: AUDITED_ACADEMIC_UNITS,
  departments: AUDITED_DEPARTMENTS,
  programmes: AUDITED_PROGRAMMES,
  canonicalCourses: AUDITED_CANONICAL_COURSES,
  programmeCourses: AUDITED_PROGRAMME_COURSES,
  courseRecords: AUDITED_COURSE_RECORDS,
};
`;

  fs.writeFileSync(outPath, fileContent, 'utf-8');
  console.log('Successfully updated src/data/udsmAuditedCatalogue2025.ts');
}

updateAuditedCatalogue().catch(console.error);
