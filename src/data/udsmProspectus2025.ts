/**
 * Official UDSM Undergraduate Prospectus 2025/2026 Source of Truth
 * Audited & Verified Academic Catalogue Hierarchy
 *
 * Hierarchy:
 * University
 *  → Academic Unit (College, School, Institute, Constituent College)
 *    → Department
 *      → Programme
 *        → Year of Study
 *          → Semester
 *            → Course
 */

/**
 * Official UDSM Undergraduate Prospectus 2025/2026 Source of Truth
 * Audited & Verified Academic Catalogue Hierarchy
 *
 * Hierarchy:
 * University
 *  → Academic Unit (College, School, Institute, Constituent College)
 *    → Department
 *      → Programme
 *        → Year of Study
 *          → Semester
 *            → Course (Canonical & ProgrammeCourse)
 */

export const OFFICIAL_SOURCE_UDSM_PROSPECTUS_2025_2026 =
  'UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)';

export {
  OFFICIAL_UDSM_UNIVERSITY as UDSM_UNIVERSITY,
  AUDITED_ACADEMIC_UNITS as UDSM_ACADEMIC_UNITS,
  AUDITED_DEPARTMENTS as UDSM_DEPARTMENTS,
  AUDITED_PROGRAMMES as UDSM_PROGRAMMES,
  AUDITED_CANONICAL_COURSES as UDSM_CANONICAL_COURSES,
  AUDITED_PROGRAMME_COURSES as UDSM_PROGRAMME_COURSES,
  AUDITED_COURSE_RECORDS as UDSM_VERIFIED_COURSES,
  UDSM_AUDITED_PROSPECTUS_DATA,
} from './udsmAuditedCatalogue2025';

export {
  AUDITED_UDSM_ACADEMIC_YEARS as UDSM_ACADEMIC_YEARS,
} from '../services/udsmCatalogueAuditService';

