import {
  AcademicMaterialRecord,
  Course,
  StudentProfile,
  SyllabusTopic,
} from '../types';
import {
  studentMaterialsService,
  StudentAcademicContext,
} from './studentMaterialsService';

/**
 * STAGE 10A: AI TUTOR MATERIALS FOUNDATION
 *
 * Clean, bounded AI context structures representing the authenticated student's
 * current academic profile, course context, and authorized VENUE course materials.
 */

export interface AIMaterialContextItem {
  materialId: string;
  courseId: string;
  canonicalCourseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  materialType: string;
  description?: string;
  summaryText?: string;
  storagePath?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  uploaderRole: 'lecturer' | 'admin' | 'course_resource';
  uploaderName?: string;
  relevanceScore?: number;
}

export interface AIStudentAcademicContextPayload {
  universityId: string;
  universityName: string;
  universityShort: string;
  academicUnitId?: string;
  academicUnitName?: string;
  departmentId?: string;
  departmentName?: string;
  programmeId?: string;
  programmeName?: string;
  programmeShort?: string;
  yearOfStudy?: string | number;
  semester?: string | number;
  selectedCourseCode: string; // e.g. 'ST 113' or 'All Courses'
  selectedCanonicalCourseId?: string; // e.g. 'st_113'
  selectedCourseId?: string;
  selectedCourseTitle?: string;
  selectedCourseCredits?: number;
  selectedCourseType?: string;
  selectedCourseOverview?: string;
  selectedCourseSyllabus?: Array<{
    week: number;
    title: string;
    description: string;
  }>;
  enrolledCoursesSummary: Array<{
    id: string;
    canonicalCourseId: string;
    code: string;
    title: string;
    credits: number;
    type?: string;
  }>;
  materials: AIMaterialContextItem[];
  materialCount: number;
  hasSpecificCourseMaterials: boolean;
}

// Maximum number of material items to send per AI Tutor request to protect token usage
export const MAX_AI_CONTEXT_MATERIALS = 6;
// Maximum characters per material description/summary
export const MAX_MATERIAL_SUMMARY_CHARS = 380;

interface CachedCourseMaterials {
  items: AcademicMaterialRecord[];
  timestamp: number;
}

class AITutorMaterialContextService {
  // Short-lived in-memory cache (90 seconds TTL) so rapid follow-up chat messages
  // in the same course do not trigger redundant Firestore queries
  private materialsCache = new Map<string, CachedCourseMaterials>();
  private readonly CACHE_TTL_MS = 90 * 1000;

  /**
   * Normalizes a course code or ID into a canonical course identifier (e.g. "ST 113" -> "st_113")
   */
  public toCanonicalCourseId(codeOrId?: string): string {
    if (!codeOrId) return '';
    return codeOrId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  /**
   * Clears the in-memory material cache (e.g. on user switch or manual refresh)
   */
  public clearCache(): void {
    this.materialsCache.clear();
  }

  /**
   * Resolves the currently selected Course object from the student's enrolled courses list
   */
  public resolveSelectedCourse(
    selectedCourseContext: string,
    courses: Course[],
    initialCourse?: Course | null
  ): Course | undefined {
    if (!selectedCourseContext || selectedCourseContext === 'All Courses') {
      return undefined;
    }

    const normTarget = selectedCourseContext.trim().toUpperCase();
    const normCanon = this.toCanonicalCourseId(selectedCourseContext);

    const matched = (courses || []).find((c) => {
      const code = (c.code || c.courseCode || '').trim().toUpperCase();
      const canon = this.toCanonicalCourseId(code || c.id);
      return code === normTarget || canon === normCanon || c.id === selectedCourseContext;
    });

    if (matched) return matched;

    if (initialCourse) {
      const initCode = (initialCourse.code || initialCourse.courseCode || '').trim().toUpperCase();
      if (initCode === normTarget || initialCourse.id === selectedCourseContext) {
        return initialCourse;
      }
    }

    return undefined;
  }

  /**
   * Queries only authorized, active VENUE materials for the student's current course or enrolled courses.
   * Respects existing visibility (`status === 'active'`) and student academic context permissions.
   */
  public async fetchAuthorizedMaterials(
    profile: StudentProfile | undefined,
    courses: Course[],
    selectedCourseContext: string,
    initialCourse?: Course | null
  ): Promise<AcademicMaterialRecord[]> {
    const studentCtx: StudentAcademicContext = studentMaterialsService.extractStudentContext(
      profile,
      courses
    );

    const selectedCourse = this.resolveSelectedCourse(
      selectedCourseContext,
      courses,
      initialCourse
    );

    const isSpecificCourse =
      Boolean(selectedCourseContext) && selectedCourseContext !== 'All Courses';
    const targetCode = isSpecificCourse
      ? (selectedCourse?.code || selectedCourseContext).trim().toUpperCase()
      : undefined;
    const targetId = isSpecificCourse ? selectedCourse?.id : undefined;

    const cacheKey = [
      profile?.uid || 'anon',
      studentCtx.universityId || 'udsm',
      studentCtx.programmeId || 'prog',
      targetCode || 'ALL_ENROLLED',
    ].join('::');

    const cached = this.materialsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.items;
    }

    try {
      const records = await studentMaterialsService.getStudentMaterials(studentCtx, {
        courseId: targetId,
        courseCode: targetCode,
        pageSize: isSpecificCourse ? 25 : 40,
      });

      // Double-check strict authorization:
      // 1. Only active materials
      // 2. Must belong to student's university (or default UDSM catalogue)
      // 3. If not filtering by a specific course, must belong to one of the student's enrolled courses or programme
      const enrolledCodes = new Set(
        (studentCtx.enrolledCourseCodes || []).map((c) => c.toUpperCase())
      );
      const enrolledCanons = new Set(
        (studentCtx.enrolledCourseCodes || []).map((c) => this.toCanonicalCourseId(c))
      );
      if (targetCode) {
        enrolledCodes.add(targetCode);
        enrolledCanons.add(this.toCanonicalCourseId(targetCode));
      }

      const authorized = records.filter((m) => {
        if (m.status !== 'active') return false;

        // Check university match if both exist
        if (
          studentCtx.universityId &&
          m.universityId &&
          m.universityId.toLowerCase() !== studentCtx.universityId.toLowerCase() &&
          m.universityId.toLowerCase() !== 'udsm'
        ) {
          return false;
        }

        const mCode = (m.courseCode || '').trim().toUpperCase();
        const mCanon = this.toCanonicalCourseId(
          m.canonicalCourseId || m.courseCode || m.courseId
        );

        if (isSpecificCourse && targetCode) {
          const targetCanon = this.toCanonicalCourseId(targetCode);
          return (
            mCode === targetCode ||
            mCanon === targetCanon ||
            (mCanon && targetCanon && (mCanon.endsWith(`_${targetCanon}`) || targetCanon.endsWith(`_${mCanon}`)))
          );
        }

        // For 'All Courses', ensure material belongs to student's enrolled courses or programme
        if (enrolledCodes.size > 0) {
          if (mCode && enrolledCodes.has(mCode)) return true;
          if (mCanon && enrolledCanons.has(mCanon)) return true;
        }
        if (
          studentCtx.programmeId &&
          m.programmeId &&
          m.programmeId.toLowerCase() === studentCtx.programmeId.toLowerCase()
        ) {
          return true;
        }

        return enrolledCodes.size === 0;
      });

      this.materialsCache.set(cacheKey, {
        items: authorized,
        timestamp: Date.now(),
      });

      return authorized;
    } catch (err) {
      console.warn('AITutorMaterialContextService: Failed to fetch materials, continuing safely:', err);
      return [];
    }
  }

  /**
   * Scores and ranks materials against the student's question so only the most relevant
   * materials (up to MAX_AI_CONTEXT_MATERIALS) are included in the AI prompt context.
   */
  private rankAndSelectMaterials(
    records: AcademicMaterialRecord[],
    selectedCourse: Course | undefined,
    userQuery: string
  ): AIMaterialContextItem[] {
    const queryWords = (userQuery || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3);

    const mapped: AIMaterialContextItem[] = records.map((rec) => {
      const title = (rec.title || rec.fileName || 'Course Material').trim();
      const desc = (rec.description || '').trim();
      const matType = rec.materialType || 'Lecture Notes';
      const cCode = (rec.courseCode || selectedCourse?.code || '').trim().toUpperCase();
      const cName = (rec.courseTitle || selectedCourse?.title || '').trim();
      const canonId =
        rec.canonicalCourseId || this.toCanonicalCourseId(cCode || rec.courseId);

      // Determine uploader role & name cleanly
      let uploaderRole: 'lecturer' | 'admin' | 'course_resource' = 'admin';
      let uploaderName: string | undefined;

      if (
        rec.uploaderRole === 'lecturer' ||
        rec.lecturerId ||
        (typeof rec.uploadedBy === 'object' && rec.uploadedBy?.role === 'lecturer')
      ) {
        uploaderRole = 'lecturer';
      }
      if (typeof rec.uploadedBy === 'object' && rec.uploadedBy?.name) {
        uploaderName = rec.uploadedBy.name;
      }

      // Compute relevance score
      let score = 10;

      // Boost lecturer-uploaded materials and core teaching notes
      if (uploaderRole === 'lecturer') score += 15;
      if (matType === 'Lecture Notes' || matType === 'Handouts' || matType === 'Slides') {
        score += 10;
      } else if (matType === 'Past Papers' || matType === 'Solutions' || matType === 'Tutorials') {
        score += 8;
      }

      // Boost keyword matches with student query
      const searchable = `${title} ${desc} ${matType} ${cCode} ${cName}`.toLowerCase();
      for (const word of queryWords) {
        if (searchable.includes(word)) {
          score += 12;
        }
      }

      // Also check if student explicitly asks for past papers / exams / assignments / notes
      const qLower = (userQuery || '').toLowerCase();
      if (
        (qLower.includes('past paper') || qLower.includes('exam') || qLower.includes('ue') || qLower.includes('test')) &&
        (matType === 'Past Papers' || matType === 'Solutions')
      ) {
        score += 20;
      }
      if (
        (qLower.includes('note') || qLower.includes('lecture') || qLower.includes('slide')) &&
        (matType === 'Lecture Notes' || matType === 'Slides' || matType === 'Handouts')
      ) {
        score += 18;
      }
      if (
        (qLower.includes('assignment') || qLower.includes('tutorial') || qLower.includes('homework')) &&
        (matType === 'Assignments' || matType === 'Tutorials')
      ) {
        score += 18;
      }

      const cleanDesc =
        desc.length > MAX_MATERIAL_SUMMARY_CHARS
          ? `${desc.slice(0, MAX_MATERIAL_SUMMARY_CHARS)}...`
          : desc;

      return {
        materialId: rec.id,
        courseId: rec.courseId || selectedCourse?.id || canonId,
        canonicalCourseId: canonId,
        courseCode: cCode || 'GENERAL',
        courseName: cName,
        title,
        materialType: matType,
        description: cleanDesc || undefined,
        storagePath: rec.storagePath,
        fileUrl: rec.fileUrl,
        fileName: rec.fileName,
        mimeType: rec.mimeType,
        uploaderRole,
        uploaderName,
        relevanceScore: score,
      };
    });

    // Sort by relevance score descending
    mapped.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return mapped.slice(0, MAX_AI_CONTEXT_MATERIALS);
  }

  /**
   * Builds the complete, bounded AI Student Academic & Material Context Payload
   * for a given AI Tutor request.
   */
  public async buildContextForQuery(params: {
    profile?: StudentProfile;
    courses: Course[];
    selectedCourseContext: string;
    initialCourse?: Course | null;
    userQuery: string;
  }): Promise<AIStudentAcademicContextPayload> {
    const { profile, courses, selectedCourseContext, initialCourse, userQuery } = params;

    const selectedCourse = this.resolveSelectedCourse(
      selectedCourseContext,
      courses,
      initialCourse
    );

    const rawMaterials = await this.fetchAuthorizedMaterials(
      profile,
      courses,
      selectedCourseContext,
      initialCourse
    );

    const rankedMaterials = this.rankAndSelectMaterials(
      rawMaterials,
      selectedCourse,
      userQuery
    );

    const enrolledCoursesSummary = (courses || []).slice(0, 12).map((c) => {
      const code = (c.code || c.courseCode || '').trim().toUpperCase();
      return {
        id: c.id,
        canonicalCourseId: this.toCanonicalCourseId(code || c.id),
        code,
        title: c.title || c.courseName || '',
        credits: Number(c.credits) || 12,
        type: c.type || c.courseType || 'Core',
      };
    });

    const syllabusSummary =
      selectedCourse && Array.isArray(selectedCourse.syllabus)
        ? selectedCourse.syllabus.slice(0, 10).map((s: SyllabusTopic) => ({
            week: s.week,
            title: s.title,
            description: s.description ? s.description.slice(0, 160) : '',
          }))
        : undefined;

    const selectedCode = selectedCourse
      ? (selectedCourse.code || selectedCourse.courseCode || selectedCourseContext).trim().toUpperCase()
      : selectedCourseContext;

    return {
      universityId: profile?.universityId || profile?.institutionId || 'udsm',
      universityName:
        profile?.university ||
        profile?.universityName ||
        'University of Dar es Salaam (UDSM)',
      universityShort: profile?.universityShort || 'UDSM',
      academicUnitId: profile?.academicUnitId || profile?.collegeId,
      academicUnitName: profile?.college || profile?.academicUnitName,
      departmentId: profile?.departmentId,
      departmentName: profile?.department || profile?.departmentName,
      programmeId: profile?.programmeId,
      programmeName: profile?.programme || profile?.programmeName,
      programmeShort: profile?.programmeShort,
      yearOfStudy: profile?.yearOfStudy,
      semester: profile?.semester,
      selectedCourseCode: selectedCode || 'All Courses',
      selectedCanonicalCourseId:
        selectedCode && selectedCode !== 'All Courses'
          ? this.toCanonicalCourseId(selectedCode)
          : undefined,
      selectedCourseId: selectedCourse?.id,
      selectedCourseTitle: selectedCourse?.title || selectedCourse?.courseName,
      selectedCourseCredits: selectedCourse?.credits,
      selectedCourseType: selectedCourse?.type || selectedCourse?.courseType,
      selectedCourseOverview: selectedCourse?.overview
        ? selectedCourse.overview.slice(0, 350)
        : undefined,
      selectedCourseSyllabus: syllabusSummary,
      enrolledCoursesSummary,
      materials: rankedMaterials,
      materialCount: rankedMaterials.length,
      hasSpecificCourseMaterials: rankedMaterials.length > 0,
    };
  }
}

export const aiTutorMaterialContextService = new AITutorMaterialContextService();
