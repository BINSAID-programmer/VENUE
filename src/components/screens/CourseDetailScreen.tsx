import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  BookOpen,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Share2,
  HelpCircle,
  Award,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  Eye,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  Course,
  CourseMaterial,
  AcademicMaterialRecord,
  AcademicMaterialType,
  StudentProfile,
} from '../../types';
import { studentMaterialsService } from '../../services/studentMaterialsService';
import { courseCurriculumService, CourseLiveMetadata } from '../../services/courseCurriculumService';
import { StudentMaterialDetailModal } from '../student/StudentMaterialDetailModal';
import { PremiumDownloadModal } from '../student/PremiumDownloadModal';
import { analyticsTracker } from '../../services/analyticsTrackerService';

const ALL_MATERIAL_TYPES: (AcademicMaterialType | 'ALL')[] = [
  'ALL',
  'Lecture Notes',
  'Handouts',
  'Slides',
  'Past Papers',
  'Assignments',
  'Solutions',
  'Tutorials',
  'Reference Materials',
  'Other',
];

interface CourseDetailScreenProps {
  course: Course;
  profile?: StudentProfile;
  onBack: () => void;
  onAskAITutor: (course: Course) => void;
  onNavigateToResources?: () => void;
  onOpenMaterialViewer?: (material: AcademicMaterialRecord) => void;
}

export const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({
  course,
  profile,
  onBack,
  onAskAITutor,
  onNavigateToResources,
  onOpenMaterialViewer,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'materials' | 'notes' | 'slides' | 'outline' | 'past-papers' | 'resources'
  >('materials');
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);

  // Real Firestore academic materials for this specific course
  const [courseMaterials, setCourseMaterials] = useState<AcademicMaterialRecord[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [liveCourseMeta, setLiveCourseMeta] = useState<CourseLiveMetadata | null>(null);
  const [materialsSearch, setMaterialsSearch] = useState('');
  const [materialsTypeFilter, setMaterialsTypeFilter] = useState<AcademicMaterialType | 'ALL'>('ALL');
  const [selectedMaterialDetail, setSelectedMaterialDetail] = useState<AcademicMaterialRecord | null>(null);
  const [premiumGateMaterial, setPremiumGateMaterial] = useState<AcademicMaterialRecord | null>(null);

  const realNotesAndHandouts = useMemo(
    () =>
      courseMaterials.filter(
        (m) =>
          m.materialType === 'Lecture Notes' ||
          m.materialType === 'Handouts' ||
          m.materialType === 'Tutorials' ||
          m.materialType === 'Assignments' ||
          m.materialType === 'Solutions'
      ),
    [courseMaterials]
  );

  const realSlidesList = useMemo(
    () => courseMaterials.filter((m) => m.materialType === 'Slides'),
    [courseMaterials]
  );

  const realPastPapersList = useMemo(
    () => courseMaterials.filter((m) => m.materialType === 'Past Papers'),
    [courseMaterials]
  );

  const realReferenceBooksList = useMemo(
    () => courseMaterials.filter((m) => m.materialType === 'Reference Materials'),
    [courseMaterials]
  );

  // Load real Firestore materials and lecturer assignment for this course
  const loadCourseMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const [items, metaMap] = await Promise.all([
        studentMaterialsService.getMaterialsForCourse(
          course.id,
          course.code,
          course.universityId || profile?.universityId
        ),
        courseCurriculumService.getCourseLiveMetadataMap({
          universityId: course.universityId || profile?.universityId,
          programmeId: course.programmeId || profile?.programmeId,
        }),
      ]);
      setCourseMaterials(items);
      const codeNorm = (course.code || '').replace(/\s+/g, '').toUpperCase();
      const foundMeta =
        metaMap.get(course.id) ||
        metaMap.get(codeNorm) ||
        metaMap.get((course.code || '').toUpperCase()) ||
        null;
      setLiveCourseMeta(foundMeta);
    } catch (err) {
      console.warn('Failed to load course materials for course detail:', err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    loadCourseMaterials();
    analyticsTracker.trackCourseView(course.code, course.name || course.title);
  }, [course.id, course.code]);

  const handleDownloadDemoMaterial = (material: CourseMaterial) => {
    // Gate downloads behind VENUE Premium entitlement
    const syntheticRecord: AcademicMaterialRecord = {
      id: material.id,
      title: material.title,
      materialType:
        material.type === 'notes'
          ? 'Lecture Notes'
          : material.type === 'slides'
          ? 'Slides'
          : material.type === 'past-paper'
          ? 'Past Papers'
          : 'Reference Materials',
      fileName: `${material.title.replace(/[^a-zA-Z0-9._-]+/g, '_')}.pdf`,
      fileUrl: material.downloadUrl || '',
      fileSize: material.fileSize || '1.2 MB',
      mimeType: 'application/pdf',
      uploadedBy: 'University Repository',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      universityId: course.universityId || profile?.universityId || 'udsm',
      academicUnitId: course.academicUnitId || '',
      departmentId: course.department || '',
      programmeId: course.programmeId || '',
      yearId: course.year || 1,
      semesterId: course.semester || 1,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
    };
    setPremiumGateMaterial(syntheticRecord);
  };

  const handleDownloadRealMaterial = async (material: AcademicMaterialRecord) => {
    const res = await studentMaterialsService.requestMaterialDownload(material, profile?.uid);
    if (res.requiresPremium) {
      setPremiumGateMaterial(material);
      return;
    }
    setDownloadNotification(res.message);
    setTimeout(() => {
      setDownloadNotification(null);
    }, 3000);
  };

  const handleOpenMaterial = (material: AcademicMaterialRecord) => {
    if (onOpenMaterialViewer) {
      onOpenMaterialViewer(material);
    } else {
      setSelectedMaterialDetail(material);
    }
  };

  // Filtered real materials for the tab
  const filteredCourseMaterials = useMemo(() => {
    return courseMaterials.filter((m) => {
      const matchesType =
        materialsTypeFilter === 'ALL' || m.materialType === materialsTypeFilter;
      const q = materialsSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.title?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.fileName?.toLowerCase().includes(q) ||
        m.materialType?.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [courseMaterials, materialsTypeFilter, materialsSearch]);

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      {/* Toast Notification for Download simulation */}
      {downloadNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/90 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadNotification}</span>
        </div>
      )}

      {/* Course Hero Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/50 to-slate-900 border border-blue-500/25 p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-extrabold px-2.5 py-0.5 rounded-md"
                style={{ backgroundColor: `${course.accentColor || '#3b82f6'}25`, color: course.accentColor || '#38bdf8' }}
              >
                {course.code}
              </span>
              {course.year && course.semester && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-sky-300 font-semibold">
                  Year {course.year} • Sem {course.semester}
                </span>
              )}
              {course.type && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    course.type === 'Core'
                      ? 'bg-blue-500/20 text-sky-300 border border-blue-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {course.type}
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium">
                {course.credits} Credits
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {course.title || course.name}
            </h2>
            {(() => {
              const realLecName =
                liveCourseMeta?.lecturerName ||
                (course.instructor?.name &&
                course.instructor.name !== 'Lecturer Not Assigned' &&
                course.instructor.name !== 'Faculty Instructor' &&
                course.instructor.name !== 'Faculty Academic Staff'
                  ? course.instructor.name
                  : '');
              const realLecTitle =
                liveCourseMeta?.lecturerTitle || course.instructor?.title || '';
              const realLecOffice =
                liveCourseMeta?.lecturerOffice || course.instructor?.office || '';
              const deptDisplay = courseCurriculumService.resolveDepartmentName(
                course.department || course.departmentId
              );

              return realLecName ? (
                <>
                  <p className="text-xs text-slate-300 mt-2">
                    Lecturer: <span className="font-semibold text-white">{realLecName}</span>{' '}
                    {realLecTitle ? `(${realLecTitle})` : ''}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {deptDisplay}
                    {realLecOffice && realLecOffice !== 'Not specified' ? ` • Office: ${realLecOffice}` : ''}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400 mt-2">
                  Lecturer: <span className="text-slate-300 font-medium">Lecturer Not Assigned</span> • {deptDisplay}
                </p>
              );
            })()}
          </div>
        </div>

        {/* "Ask AI Tutor" Floating/Prominent Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex gap-2">
          <button
            id="course-ask-ai-tutor-btn"
            onClick={() => onAskAITutor(course)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <span>Ask AI Tutor About {course.code}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/80 text-xs scrollbar-none">
        {[
          { id: 'overview', label: 'Overview' },
          {
            id: 'materials',
            label: `Academic Materials (${courseMaterials.length})`,
            highlight: courseMaterials.length > 0,
          },
          { id: 'notes', label: `Notes & Handouts (${realNotesAndHandouts.length})` },
          { id: 'slides', label: `Slides (${realSlidesList.length})` },
          { id: 'outline', label: 'Course Outline' },
          { id: 'past-papers', label: `Past Papers (${realPastPapersList.length})` },
          { id: 'resources', label: `References (${realReferenceBooksList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`course-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-lg font-semibold shrink-0 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600/20 text-sky-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">Course Description</h3>
            <p className="text-slate-300 leading-relaxed">
              {course.overview ||
                course.description ||
                `${course.code} — ${course.title || course.name}. Official ${course.credits}-credit ${(course.type || 'Core').toLowerCase()} course accredited under the University Undergraduate Prospectus.`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Course Classification</span>
              <p className="font-bold text-slate-200 mt-1">{course.type || 'Core'} Course ({course.credits} Credits)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {courseCurriculumService.resolveDepartmentName(course.department || course.departmentId)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Course Lecturer</span>
              <p className="font-bold text-slate-200 mt-1">
                {liveCourseMeta?.lecturerName ||
                  (course.instructor?.name &&
                  course.instructor.name !== 'Lecturer Not Assigned' &&
                  course.instructor.name !== 'Faculty Instructor' &&
                  course.instructor.name !== 'Faculty Academic Staff'
                    ? course.instructor.name
                    : 'Lecturer Not Assigned')}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {liveCourseMeta?.lecturerTitle || 'Official Faculty Assignment'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Material Availability</span>
              <p className="font-bold text-sky-400 mt-1">
                {courseMaterials.length > 0
                  ? `${courseMaterials.length} ${courseMaterials.length === 1 ? 'Material' : 'Materials'} Available`
                  : 'No Materials Uploaded Yet'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {realNotesAndHandouts.length} Notes/Handouts • {realPastPapersList.length} Past Papers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Real Academic Materials (Stage 4C: My Course → Course Code → Academic Materials) */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                Academic Materials for {course.code}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Official lecture notes, handouts, slides, and past papers uploaded by course faculty
              </p>
            </div>

            <button
              onClick={loadCourseMaterials}
              disabled={loadingMaterials}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMaterials ? 'animate-spin text-sky-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Search & Filter within course materials */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={materialsSearch}
                onChange={(e) => setMaterialsSearch(e.target.value)}
                placeholder={`Search materials for ${course.code}...`}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {materialsSearch && (
                <button
                  onClick={() => setMaterialsSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Type Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {ALL_MATERIAL_TYPES.map((type) => {
                const count =
                  type === 'ALL'
                    ? courseMaterials.length
                    : courseMaterials.filter((m) => m.materialType === type).length;
                if (type !== 'ALL' && count === 0) return null;

                return (
                  <button
                    key={type}
                    onClick={() => setMaterialsTypeFilter(type)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                      materialsTypeFilter === type
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{type === 'ALL' ? 'All Types' : type}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading */}
          {loadingMaterials && (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto" />
              <p>Fetching academic materials for {course.code}...</p>
            </div>
          )}

          {/* List of Real Materials */}
          {!loadingMaterials && filteredCourseMaterials.length > 0 && (
            <div className="space-y-3">
              {filteredCourseMaterials.map((item) => {
                const typeBadge = studentMaterialsService.getMaterialTypeBadge(item.materialType);
                const fileBadge = studentMaterialsService.getFileTypeBadge(item.fileName, item.mimeType);
                const uploaderLabel =
                  typeof item.uploadedBy === 'object'
                    ? item.uploadedBy.name || item.uploadedBy.email || 'Course Faculty'
                    : item.uploaderRole === 'lecturer'
                    ? 'Verified Lecturer'
                    : 'University Repository';

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeBadge.bgColor} ${typeBadge.textColor} ${typeBadge.borderColor}`}
                          >
                            {item.materialType}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.fileSize || 'Standard'}</span>
                          <span className="text-[10px] text-slate-400">• {uploaderLabel}</span>
                          <span className="text-[10px] text-slate-500">
                            • {studentMaterialsService.formatDate(item.createdAt)}
                          </span>
                        </div>
                        <h4
                          onClick={() => handleOpenMaterial(item)}
                          className="text-xs sm:text-sm font-bold text-white hover:text-sky-400 transition-colors cursor-pointer"
                        >
                          {item.title}
                        </h4>
                      </div>

                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-1 rounded-lg border shrink-0 ${fileBadge.bgColor} ${fileBadge.textColor} ${fileBadge.borderColor}`}
                      >
                        {fileBadge.label}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 gap-2">
                      <span className="truncate max-w-[180px] sm:max-w-[240px] font-mono">
                        {studentMaterialsService.getCleanOriginalFileName(item)}
                      </span>

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedMaterialDetail(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Material Info & Metadata"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadRealMaterial(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold transition-colors cursor-pointer"
                          title="Download Original File (Premium)"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>Download</span>
                        </button>

                        <button
                          type="button"
                          id={`open-material-btn-${item.id}`}
                          onClick={() => handleOpenMaterial(item)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm shadow-blue-600/30 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Open / Read</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State for Course Materials */}
          {!loadingMaterials && filteredCourseMaterials.length === 0 && (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
              <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Materials Uploaded Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {materialsSearch || materialsTypeFilter !== 'ALL'
                  ? 'No materials matched your search filter for this course.'
                  : `Your lecturers or administrators have not uploaded official materials for ${course.code} yet. Course materials will appear here once published.`}
              </p>
              {(materialsSearch || materialsTypeFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setMaterialsSearch('');
                    setMaterialsTypeFilter('ALL');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Notes & Handouts */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Official uploaded lecture notes, handouts, and tutorials for {course.code}
          </p>
          {realNotesAndHandouts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
              <FileText className="w-7 h-7 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Notes or Handouts Uploaded Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No lecture notes, handouts, or tutorials have been uploaded for {course.code} yet.
              </p>
            </div>
          ) : (
            realNotesAndHandouts.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4
                      onClick={() => handleOpenMaterial(item)}
                      className="text-xs sm:text-sm font-semibold text-slate-100 hover:text-sky-400 cursor-pointer truncate"
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.materialType} • {item.fileSize || 'PDF'} • {studentMaterialsService.formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenMaterial(item)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Open
                  </button>
                  <button
                    id={`download-notes-${item.id}`}
                    onClick={() => handleDownloadRealMaterial(item)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Download Material"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Slides */}
      {activeTab === 'slides' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Official presentation decks and lecture slides for {course.code}
          </p>
          {realSlidesList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
              <Layers className="w-7 h-7 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Lecture Slides Uploaded Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No presentation slides have been uploaded for {course.code} yet.
              </p>
            </div>
          ) : (
            realSlidesList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-sky-500/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4
                      onClick={() => handleOpenMaterial(item)}
                      className="text-xs sm:text-sm font-semibold text-slate-100 hover:text-sky-400 cursor-pointer truncate"
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.fileSize || 'Slides'} • {studentMaterialsService.formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenMaterial(item)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Open
                  </button>
                  <button
                    id={`download-slides-${item.id}`}
                    onClick={() => handleDownloadRealMaterial(item)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Download Slides"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Course Outline / Syllabus */}
      {activeTab === 'outline' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Course Outline</h4>
            {course.syllabus && course.syllabus.length > 0 && (
              <span className="text-[11px] text-slate-400">{course.syllabus.length} Weeks Curriculum</span>
            )}
          </div>

          {!course.syllabus || course.syllabus.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
              <BookOpen className="w-7 h-7 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">Course Outline Not Uploaded Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                A weekly course outline has not been published for {course.code} yet. Check the Academic Materials tab for uploaded syllabus documents.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {course.syllabus.map((item) => (
                <div
                  key={item.week}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                    item.completed
                      ? 'bg-slate-900/90 border-slate-800'
                      : 'bg-slate-950/50 border-slate-850'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      item.completed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.completed ? '✓' : item.week}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs sm:text-sm font-semibold text-slate-200">
                        Week {item.week}: {item.title}
                      </h5>
                      {item.completed && (
                        <span className="text-[10px] text-emerald-400 font-semibold">Taught</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Past Papers */}
      {activeTab === 'past-papers' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            Official past examination papers uploaded for {course.code}.
          </div>

          {realPastPapersList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
              <Award className="w-7 h-7 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Past Papers Uploaded Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No past examination papers have been uploaded for {course.code} yet.
              </p>
            </div>
          ) : (
            realPastPapersList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4
                      onClick={() => handleOpenMaterial(item)}
                      className="text-xs sm:text-sm font-semibold text-slate-100 hover:text-amber-300 cursor-pointer truncate"
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.fileSize || 'PDF'} • {studentMaterialsService.formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenMaterial(item)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Open
                  </button>
                  <button
                    id={`download-paper-${item.id}`}
                    onClick={() => handleDownloadRealMaterial(item)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Download Past Paper"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 7: Recommended Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Reference textbooks and reading materials uploaded for {course.code}
          </p>

          {realReferenceBooksList.length === 0 && (!course.recommendedResources || course.recommendedResources.length === 0) ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
              <BookOpen className="w-7 h-7 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Reference Materials Uploaded Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No reference textbooks or supplementary readings have been uploaded for {course.code} yet.
              </p>
            </div>
          ) : (
            <>
              {realReferenceBooksList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4
                        onClick={() => handleOpenMaterial(item)}
                        className="text-xs sm:text-sm font-semibold text-slate-100 hover:text-sky-400 cursor-pointer truncate"
                      >
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.fileSize || 'Reference'} • {studentMaterialsService.formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenMaterial(item)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Open
                  </button>
                </div>
              ))}
              {course.recommendedResources?.map((res, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-semibold border border-blue-500/30">
                      {res.type}
                    </span>
                    {res.edition && <span className="text-[10px] text-slate-400">{res.edition}</span>}
                  </div>
                  <h4 className="text-sm font-bold text-white">{res.title}</h4>
                  <p className="text-xs text-sky-400 font-medium">By {res.author}</p>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{res.description}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedMaterialDetail && (
        <StudentMaterialDetailModal
          material={selectedMaterialDetail}
          onClose={() => setSelectedMaterialDetail(null)}
          onOpenViewer={handleOpenMaterial}
          userId={profile?.uid}
        />
      )}

      {/* Premium Download Gate Modal */}
      <PremiumDownloadModal
        isOpen={Boolean(premiumGateMaterial)}
        onClose={() => setPremiumGateMaterial(null)}
        material={premiumGateMaterial}
        onReadInsideVenue={
          premiumGateMaterial && premiumGateMaterial.fileUrl
            ? (mat) => {
                setPremiumGateMaterial(null);
                handleOpenMaterial(mat);
              }
            : undefined
        }
      />
    </div>
  );
};
