import {
  UniversityRecord,
  AcademicUnitRecord,
  DepartmentRecord,
  ProgrammeRecord,
  AcademicYearRecord,
  CourseRecord,
  AcademicUnitType,
  CourseStatus,
} from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_ACADEMIC_UNIT_TYPES: AcademicUnitType[] = [
  'College',
  'School',
  'Institute',
  'Constituent College',
  'Centre',
];

const VALID_COURSE_STATUSES: CourseStatus[] = ['Core', 'Elective'];

/**
 * Validates a University record
 */
export function validateUniversity(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['University record must be a non-null object'] };
  }

  const u = data as Partial<UniversityRecord>;
  if (!u.id || typeof u.id !== 'string' || !u.id.trim()) {
    errors.push('University id is required and must be a non-empty string');
  } else if (!/^[a-z0-9_-]+$/i.test(u.id)) {
    errors.push('University id must be alphanumeric with dashes or underscores');
  }

  if (!u.name || typeof u.name !== 'string' || !u.name.trim()) {
    errors.push('University name is required and must be a non-empty string');
  }

  if (!u.shortName || typeof u.shortName !== 'string' || !u.shortName.trim()) {
    errors.push('University shortName is required (e.g., UDSM, UDOM)');
  }

  if (!u.country || typeof u.country !== 'string' || !u.country.trim()) {
    errors.push('University country is required');
  }

  if (u.status !== 'active' && u.status !== 'inactive') {
    errors.push('University status must be "active" or "inactive"');
  }

  if (typeof u.verified !== 'boolean') {
    errors.push('University verified must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an Academic Unit record (College, School, Institute, Constituent College)
 */
export function validateAcademicUnit(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Academic Unit must be a non-null object'] };
  }

  const unit = data as Partial<AcademicUnitRecord>;
  if (!unit.id || typeof unit.id !== 'string' || !unit.id.trim()) {
    errors.push('Academic unit id is required');
  } else if (!/^[a-z0-9_-]+$/i.test(unit.id)) {
    errors.push('Academic unit id must be alphanumeric with dashes or underscores');
  }

  if (!unit.universityId || typeof unit.universityId !== 'string' || !unit.universityId.trim()) {
    errors.push('Academic unit universityId reference is required');
  }

  if (!unit.name || typeof unit.name !== 'string' || !unit.name.trim()) {
    errors.push('Academic unit name is required');
  }

  if (!unit.type || !VALID_ACADEMIC_UNIT_TYPES.includes(unit.type)) {
    errors.push(`Academic unit type must be one of: ${VALID_ACADEMIC_UNIT_TYPES.join(', ')}`);
  }

  if (typeof unit.verified !== 'boolean') {
    errors.push('Academic unit verified flag must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a Department record
 */
export function validateDepartment(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Department must be a non-null object'] };
  }

  const dept = data as Partial<DepartmentRecord>;
  if (!dept.id || typeof dept.id !== 'string' || !dept.id.trim()) {
    errors.push('Department id is required');
  } else if (!/^[a-z0-9_-]+$/i.test(dept.id)) {
    errors.push('Department id must be alphanumeric with dashes or underscores');
  }

  if (!dept.universityId || typeof dept.universityId !== 'string' || !dept.universityId.trim()) {
    errors.push('Department universityId reference is required');
  }

  if (!dept.academicUnitId || typeof dept.academicUnitId !== 'string' || !dept.academicUnitId.trim()) {
    errors.push('Department academicUnitId reference is required');
  }

  if (!dept.name || typeof dept.name !== 'string' || !dept.name.trim()) {
    errors.push('Department name is required');
  }

  if (typeof dept.verified !== 'boolean') {
    errors.push('Department verified flag must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a Programme record
 */
export function validateProgramme(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Programme must be a non-null object'] };
  }

  const prog = data as Partial<ProgrammeRecord>;
  if (!prog.id || typeof prog.id !== 'string' || !prog.id.trim()) {
    errors.push('Programme id is required');
  } else if (!/^[a-z0-9_-]+$/i.test(prog.id)) {
    errors.push('Programme id must be alphanumeric with dashes or underscores');
  }

  if (!prog.universityId || typeof prog.universityId !== 'string' || !prog.universityId.trim()) {
    errors.push('Programme universityId reference is required');
  }

  if (!prog.academicUnitId || typeof prog.academicUnitId !== 'string' || !prog.academicUnitId.trim()) {
    errors.push('Programme academicUnitId reference is required');
  }

  if (!prog.departmentId || typeof prog.departmentId !== 'string' || !prog.departmentId.trim()) {
    errors.push('Programme departmentId reference is required');
  }

  if (!prog.name || typeof prog.name !== 'string' || !prog.name.trim()) {
    errors.push('Programme name is required');
  }

  if (typeof prog.durationYears !== 'number' || prog.durationYears < 1 || prog.durationYears > 7) {
    errors.push('Programme durationYears must be a number between 1 and 7');
  }

  if (!prog.studyMode || !['Full-Time', 'Part-Time', 'Evening', 'Online'].includes(prog.studyMode)) {
    errors.push('Programme studyMode must be Full-Time, Part-Time, Evening, or Online');
  }

  if (typeof prog.verified !== 'boolean') {
    errors.push('Programme verified flag must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an Academic Year record
 */
export function validateAcademicYear(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Academic Year must be a non-null object'] };
  }

  const yr = data as Partial<AcademicYearRecord>;
  if (!yr.id || typeof yr.id !== 'string' || !yr.id.trim()) {
    errors.push('Academic year id is required');
  }

  if (!yr.universityId || typeof yr.universityId !== 'string' || !yr.universityId.trim()) {
    errors.push('Academic year universityId is required');
  }

  if (!yr.year || typeof yr.year !== 'string' || !/^\d{4}\/\d{4}$/.test(yr.year)) {
    errors.push('Academic year format must be YYYY/YYYY (e.g. 2023/2024)');
  }

  if (typeof yr.isCurrent !== 'boolean') {
    errors.push('Academic year isCurrent must be a boolean');
  }

  if (!Array.isArray(yr.semesters) || yr.semesters.length === 0) {
    errors.push('Academic year semesters must be an array with semester numbers (e.g. [1, 2])');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an individual Course record
 */
export function validateCourse(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Course must be a non-null object'] };
  }

  const c = data as Partial<CourseRecord>;

  if (!c.id || typeof c.id !== 'string' || !c.id.trim()) {
    errors.push('Course id is required');
  } else if (!/^[a-z0-9_-]+$/i.test(c.id)) {
    errors.push('Course id must be alphanumeric with dashes or underscores');
  }

  if (!c.universityId || typeof c.universityId !== 'string' || !c.universityId.trim()) {
    errors.push('Course universityId is required');
  }

  // Must have department or academic unit
  if ((!c.departmentId || typeof c.departmentId !== 'string') && (!c.academicUnitId || typeof c.academicUnitId !== 'string')) {
    errors.push('Course must specify either departmentId or academicUnitId');
  }

  if (!c.programmeId || typeof c.programmeId !== 'string' || !c.programmeId.trim()) {
    errors.push('Course programmeId reference is required');
  }

  if (!c.code || typeof c.code !== 'string' || !c.code.trim()) {
    errors.push('Course code is required (e.g., MT 100, ST 113)');
  }

  if (!c.title || typeof c.title !== 'string' || !c.title.trim()) {
    errors.push('Course title is required');
  }

  if (typeof c.credits !== 'number' || c.credits <= 0 || c.credits > 60) {
    errors.push('Course credits must be a positive number (typically 6-30 credits)');
  }

  if (typeof c.yearOfStudy !== 'number' || c.yearOfStudy < 1 || c.yearOfStudy > 7) {
    errors.push('Course yearOfStudy must be a number between 1 and 7');
  }

  if (typeof c.semester !== 'number' || (c.semester !== 1 && c.semester !== 2)) {
    errors.push('Course semester must be 1 or 2');
  }

  if (!c.status || !VALID_COURSE_STATUSES.includes(c.status)) {
    errors.push(`Course status must be one of: ${VALID_COURSE_STATUSES.join(', ')}`);
  }

  if (typeof c.verified !== 'boolean') {
    errors.push('Course verified flag must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Standard ID slug generator for stable document keys across Firestore
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Normalizes course code (e.g., "mt 100" or "MT  100" -> "MT 100")
 */
export function normalizeCourseCode(code: string): string {
  if (!code || typeof code !== 'string') return '';
  return code.trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * Generate stable document IDs for each level of the academic hierarchy
 */
export function buildStableCourseId(universityId: string, programmeId: string, courseCode: string): string {
  return `${slugify(universityId)}_${slugify(programmeId)}_${slugify(courseCode)}`;
}

export function buildStableAcademicUnitId(universityId: string, unitShortOrName: string): string {
  return `${slugify(universityId)}_${slugify(unitShortOrName)}`;
}

export function buildStableDepartmentId(universityId: string, academicUnitId: string, deptName: string): string {
  return `${slugify(academicUnitId)}_${slugify(deptName)}`;
}

export function buildStableProgrammeId(universityId: string, progShortOrName: string): string {
  return `${slugify(universityId)}_${slugify(progShortOrName)}`;
}

/**
 * Deduplication Validation: Checks if a programme already exists in a given list
 */
export function isDuplicateProgramme(
  existingProgrammes: ProgrammeRecord[],
  newProg: Partial<ProgrammeRecord>
): { isDuplicate: boolean; reason?: string } {
  if (!newProg || !newProg.name || !newProg.universityId) {
    return { isDuplicate: false };
  }

  const cleanUni = newProg.universityId.toLowerCase().trim();
  const cleanId = newProg.id ? newProg.id.toLowerCase().trim() : '';
  const cleanName = newProg.name.toLowerCase().trim();
  const cleanShort = newProg.shortName ? newProg.shortName.toLowerCase().trim() : '';

  for (const p of existingProgrammes) {
    if (p.universityId.toLowerCase().trim() !== cleanUni) continue;

    if (cleanId && p.id.toLowerCase().trim() === cleanId) {
      return { isDuplicate: true, reason: `Duplicate programme ID: "${p.id}"` };
    }

    if (p.name.toLowerCase().trim() === cleanName && p.academicUnitId === newProg.academicUnitId) {
      return {
        isDuplicate: true,
        reason: `Duplicate programme name "${p.name}" in unit "${p.academicUnitId}"`,
      };
    }

    if (cleanShort && p.shortName && p.shortName.toLowerCase().trim() === cleanShort && p.academicUnitId === newProg.academicUnitId) {
      return {
        isDuplicate: true,
        reason: `Duplicate programme shortName "${p.shortName}" in unit "${p.academicUnitId}"`,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Deduplication Validation: Checks if a course already exists in a given programme curriculum
 */
export function isDuplicateCourse(
  existingCourses: CourseRecord[],
  newCourse: Partial<CourseRecord>
): { isDuplicate: boolean; reason?: string } {
  if (!newCourse || !newCourse.code || !newCourse.programmeId) {
    return { isDuplicate: false };
  }

  const normCode = normalizeCourseCode(newCourse.code);
  const cleanProg = newCourse.programmeId.toLowerCase().trim();
  const cleanId = newCourse.id ? newCourse.id.toLowerCase().trim() : '';
  const year = newCourse.yearOfStudy;
  const semester = newCourse.semester;

  for (const c of existingCourses) {
    if (c.programmeId.toLowerCase().trim() !== cleanProg) continue;

    if (cleanId && c.id.toLowerCase().trim() === cleanId) {
      return { isDuplicate: true, reason: `Duplicate course ID: "${c.id}"` };
    }

    if (
      normalizeCourseCode(c.code) === normCode &&
      (year === undefined || c.yearOfStudy === year) &&
      (semester === undefined || c.semester === semester)
    ) {
      return {
        isDuplicate: true,
        reason: `Duplicate course code "${normCode}" in programme "${cleanProg}" (Year ${c.yearOfStudy}, Sem ${c.semester})`,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Validates a batch of course records ensuring none are internal duplicates
 */
export function validateCourseBatchNoDuplicates(courses: CourseRecord[]): ValidationResult {
  const errors: string[] = [];
  const seenKeys = new Set<string>();

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    const key = `${c.universityId.toLowerCase()}:${c.programmeId.toLowerCase()}:${normalizeCourseCode(c.code)}:Y${c.yearOfStudy}:S${c.semester}`;

    if (seenKeys.has(key)) {
      errors.push(`Duplicate course encountered in batch: ${c.code} (${c.title}) for programme ${c.programmeId}`);
    } else {
      seenKeys.add(key);
    }

    const singleVal = validateCourse(c);
    if (!singleVal.valid) {
      errors.push(...singleVal.errors.map((e) => `[Course ${c.code || i}]: ${e}`));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a batch of programme records ensuring none are internal duplicates
 */
export function validateProgrammeBatchNoDuplicates(programmes: ProgrammeRecord[]): ValidationResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  for (let i = 0; i < programmes.length; i++) {
    const p = programmes[i];
    const cleanId = p.id.toLowerCase().trim();
    const nameKey = `${p.universityId.toLowerCase()}:${p.academicUnitId.toLowerCase()}:${p.name.toLowerCase().trim()}`;

    if (seenIds.has(cleanId)) {
      errors.push(`Duplicate programme ID in batch: "${p.id}"`);
    } else {
      seenIds.add(cleanId);
    }

    if (seenNames.has(nameKey)) {
      errors.push(`Duplicate programme name in batch: "${p.name}" in unit "${p.academicUnitId}"`);
    } else {
      seenNames.add(nameKey);
    }

    const singleVal = validateProgramme(p);
    if (!singleVal.valid) {
      errors.push(...singleVal.errors.map((e) => `[Programme ${p.name || i}]: ${e}`));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an Academic Hierarchy Combination to prevent invalid cross-unit / cross-department associations
 * e.g., University A + College B + Department C + Programme belonging to Department D
 */
export function validateAcademicHierarchyCombination(params: {
  universityId: string;
  academicUnitId: string;
  departmentId: string;
  programmeId: string;
  programmesCatalogue: ProgrammeRecord[];
  departmentsCatalogue?: DepartmentRecord[];
  academicUnitsCatalogue?: AcademicUnitRecord[];
  yearOfStudy?: string | number;
  semester?: string | number;
}): ValidationResult {
  const errors: string[] = [];
  const {
    universityId,
    academicUnitId,
    departmentId,
    programmeId,
    programmesCatalogue,
    departmentsCatalogue = [],
    academicUnitsCatalogue = [],
    yearOfStudy,
  } = params;

  if (!universityId || !universityId.trim()) {
    errors.push('University selection is required');
  }

  if (!academicUnitId || !academicUnitId.trim()) {
    errors.push('College / School / Institute selection is required');
  }

  if (!departmentId || !departmentId.trim()) {
    errors.push('Department selection is required');
  }

  if (!programmeId || !programmeId.trim()) {
    errors.push('Degree Programme selection is required');
  }

  const cleanUni = (universityId || '').toLowerCase().trim();
  const cleanUnit = (academicUnitId || '').toLowerCase().trim();
  const cleanDept = (departmentId || '').toLowerCase().trim();
  const cleanProg = (programmeId || '').toLowerCase().trim();

  // 1. Verify academic unit belongs to university (if units catalogue provided)
  if (academicUnitsCatalogue.length > 0) {
    const matchedUnit = academicUnitsCatalogue.find((u) => u.id.toLowerCase().trim() === cleanUnit);
    if (matchedUnit && matchedUnit.universityId.toLowerCase().trim() !== cleanUni) {
      errors.push(
        `Academic unit "${matchedUnit.name}" belongs to university "${matchedUnit.universityId}", not "${universityId}".`
      );
    }
  }

  // 2. Verify department belongs to academic unit (if departments catalogue provided)
  if (departmentsCatalogue.length > 0) {
    const matchedDept = departmentsCatalogue.find((d) => d.id.toLowerCase().trim() === cleanDept);
    if (matchedDept && matchedDept.academicUnitId.toLowerCase().trim() !== cleanUnit) {
      errors.push(
        `Department "${matchedDept.name}" does not belong to the selected college/unit (${academicUnitId}).`
      );
    }
  }

  // 3. Verify programme belongs to department
  const matchedProg = programmesCatalogue.find((p) => p.id.toLowerCase().trim() === cleanProg);
  if (matchedProg) {
    const progDept = matchedProg.departmentId.toLowerCase().trim();
    if (progDept !== cleanDept) {
      errors.push(
        `Invalid academic combination: Programme "${matchedProg.name}" belongs to department "${matchedProg.departmentId}", not "${departmentId}".`
      );
    }

    const progUnit = matchedProg.academicUnitId.toLowerCase().trim();
    if (progUnit !== cleanUnit) {
      errors.push(
        `Invalid academic combination: Programme "${matchedProg.name}" is under academic unit "${matchedProg.academicUnitId}", not "${academicUnitId}".`
      );
    }

    const progUni = matchedProg.universityId.toLowerCase().trim();
    if (progUni !== cleanUni) {
      errors.push(
        `Invalid academic combination: Programme "${matchedProg.name}" is offered by university "${matchedProg.universityId}", not "${universityId}".`
      );
    }

    // 4. Verify yearOfStudy does not exceed durationYears
    if (yearOfStudy) {
      const yearNum = typeof yearOfStudy === 'number'
        ? yearOfStudy
        : parseInt(yearOfStudy.replace(/\D/g, ''), 10);

      if (!isNaN(yearNum) && yearNum > matchedProg.durationYears) {
        errors.push(
          `Year of Study (${yearNum}) exceeds the official duration of "${matchedProg.name}" (${matchedProg.durationYears} ${matchedProg.durationYears === 1 ? 'Year' : 'Years'}).`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

