/**
 * Intake = the curriculum year a student was admitted under (e.g. "2025/2026").
 * UDSM publishes a different Prospectus for each intake, so courses are labelled by intake
 * (stored in the existing `academicYear` field of catalogue records).
 */
export const DEFAULT_INTAKE = '2025/2026';

/** Academic years start in September; before that we are still in the previous academic year. */
export function currentAcademicYearStart(now: Date = new Date()): number {
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
}

export function formatIntake(startYear: number): string {
  return `${startYear}/${startYear + 1}`;
}

/** Best guess of the intake from the year of study (Year 1 = this year's intake, Year 2 = last year's, ...). */
export function guessIntake(yearOfStudy: number | string | undefined, now: Date = new Date()): string {
  const y = Math.max(1, Math.min(6, Number(yearOfStudy) || 1));
  return formatIntake(currentAcademicYearStart(now) - (y - 1));
}

export function intakeSlug(intake: string): string {
  return String(intake).replace(/[^0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
