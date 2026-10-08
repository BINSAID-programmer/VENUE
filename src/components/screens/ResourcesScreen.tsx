import React, { useState, useEffect, useMemo, useId } from 'react';
import {
  BookOpen,
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Eye,
  RefreshCw,
  FolderOpen,
  Calendar,
  GraduationCap,
  AlertCircle,
  X,
  Building2,
  Share2,
} from 'lucide-react';
import {
  Course,
  StudentProfile,
  AcademicMaterialRecord,
  AcademicMaterialType,
} from '../../types';
import {
  studentMaterialsService,
  StudentAcademicContext,
} from '../../services/studentMaterialsService';
import { StudentMaterialDetailModal } from '../student/StudentMaterialDetailModal';
import { PremiumDownloadModal } from '../student/PremiumDownloadModal';

export const ALL_MATERIAL_TYPES: (AcademicMaterialType | 'ALL')[] = [
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

interface ResourcesScreenProps {
  courses: Course[];
  profile?: StudentProfile;
  onSelectCourse?: (course: Course) => void;
  onOpenMaterialViewer?: (material: AcademicMaterialRecord) => void;
  initialCourseId?: string;
  initialCourseCode?: string;
}

export const ResourcesScreen: React.FC<ResourcesScreenProps> = ({
  courses = [],
  profile,
  onSelectCourse,
  onOpenMaterialViewer,
  initialCourseId,
  initialCourseCode,
}) => {
  const courseSelectId = useId();
  const semesterSelectId = useId();

  // State
  const [materials, setMaterials] = useState<AcademicMaterialRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeType, setActiveType] = useState<AcademicMaterialType | 'ALL'>('ALL');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(
    initialCourseId || initialCourseCode || 'ALL'
  );
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Modals & Action Feedback
  const [activeMaterialDetail, setActiveMaterialDetail] = useState<AcademicMaterialRecord | null>(null);
  const [premiumGateMaterial, setPremiumGateMaterial] = useState<AcademicMaterialRecord | null>(null);
  const [downloadedItemId, setDownloadedItemId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(15);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(15);
  }, [activeType, selectedCourseFilter, selectedSemester, debouncedSearch]);

  // 1. Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 2. Derive student academic context
  const academicContext: StudentAcademicContext = useMemo(() => {
    return studentMaterialsService.extractStudentContext(profile, courses);
  }, [profile, courses]);

  // 3. Fetch materials from Firestore
  const loadMaterials = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let targetCourseId: string | undefined;
      let targetCourseCode: string | undefined;

      if (selectedCourseFilter && selectedCourseFilter !== 'ALL') {
        const found = courses.find(
          (c) =>
            c.id === selectedCourseFilter ||
            (c.code && c.code.toUpperCase() === selectedCourseFilter.toUpperCase())
        );
        if (found) {
          targetCourseId = found.id;
          targetCourseCode = found.code;
        } else {
          targetCourseId = selectedCourseFilter;
        }
      }

      const results = await studentMaterialsService.getStudentMaterials(
        academicContext,
        {
          courseId: targetCourseId,
          courseCode: targetCourseCode,
          materialType: activeType,
          semester: selectedSemester,
          search: debouncedSearch,
          pageSize: 100,
        }
      );

      setMaterials(results);
    } catch (err: any) {
      console.error('Failed to load academic materials:', err);
      setError('Could not load course materials. Please verify your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [
    activeType,
    selectedCourseFilter,
    selectedSemester,
    debouncedSearch,
    academicContext.programmeId,
    academicContext.universityId,
  ]);

  // Handle Download (Gated by VENUE Premium entitlement)
  const handleDownload = async (material: AcademicMaterialRecord) => {
    const res = await studentMaterialsService.requestMaterialDownload(material, profile?.uid);
    if (res.requiresPremium) {
      setPremiumGateMaterial(material);
      return;
    }
    setDownloadedItemId(material.id);
    setTimeout(() => {
      setDownloadedItemId(null);
    }, 2500);
  };

  // Handle Open / Read in VENUE Viewer
  const handleOpenViewer = (material: AcademicMaterialRecord) => {
    if (onOpenMaterialViewer) {
      onOpenMaterialViewer(material);
    } else {
      setActiveMaterialDetail(material);
    }
  };

  // Helper to open course detail if callback provided
  const handleCourseClick = (courseCode?: string) => {
    if (!courseCode || !onSelectCourse) return;
    const match = courses.find(
      (c) => (c.code || '').trim().toUpperCase() === courseCode.trim().toUpperCase()
    );
    if (match) {
      onSelectCourse(match);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveType('ALL');
    setSelectedCourseFilter('ALL');
    setSelectedSemester('ALL');
    setSearchQuery('');
  };

  // Counts by material type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: materials.length };
    materials.forEach((m) => {
      counts[m.materialType] = (counts[m.materialType] || 0) + 1;
    });
    return counts;
  }, [materials]);

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-28 max-w-7xl mx-auto">
      {/* Header with Academic Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Academic Materials
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">
              {profile?.programmeName || profile?.programme || 'Curriculum Repository'}
            </span>
            {academicContext.yearId && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">
                  Year {academicContext.yearId}
                </span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Learning Materials & Handouts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access verified lecture notes, course slides, past papers, problem sets, and faculty handbooks
          </p>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadMaterials(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh Materials"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-3.5 shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, keyword, or course code (e.g. MT 171, ST 113, Analysis)..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Secondary Context Dropdowns: Course & Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Course Filter */}
          <div className="space-y-1">
            <label htmlFor={courseSelectId} className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              Filter by Enrolled Course:
            </label>
            <select
              id={courseSelectId}
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="ALL">All My Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="space-y-1">
            <label htmlFor={semesterSelectId} className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Semester:
            </label>
            <select
              id={semesterSelectId}
              value={selectedSemester}
              onChange={(e) =>
                setSelectedSemester(
                  e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="ALL">All Semesters</option>
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
        </div>

        {/* Material Type Pills */}
        <div className="pt-1">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            Material Type:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {ALL_MATERIAL_TYPES.map((type) => {
              const count = type === 'ALL' ? materials.length : typeCounts[type] || 0;
              const isSelected = activeType === type;

              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{type === 'ALL' ? 'All Materials' : type}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadMaterials()}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !refreshing && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                <div className="h-4 bg-slate-800 rounded w-16"></div>
              </div>
              <div className="h-5 bg-slate-800/80 rounded w-2/3"></div>
              <div className="h-3 bg-slate-800/50 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Materials List */}
      {!loading && materials.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{materials.length}</strong> verified academic material
              {materials.length === 1 ? '' : 's'}
            </span>
            {(activeType !== 'ALL' || selectedCourseFilter !== 'ALL' || debouncedSearch) && (
              <button
                onClick={handleResetFilters}
                className="text-sky-400 hover:text-sky-300 text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {materials.slice(0, visibleCount).map((item) => {
              const typeBadge = studentMaterialsService.getMaterialTypeBadge(item.materialType);
              const fileBadge = studentMaterialsService.getFileTypeBadge(
                item.fileName,
                item.mimeType
              );

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-slate-700/90 transition-all space-y-3 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {item.courseCode ? (
                          <button
                            onClick={() => handleCourseClick(item.courseCode)}
                            className="text-[11px] font-extrabold text-sky-400 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 transition-colors cursor-pointer"
                            title="View Course"
                          >
                            {item.courseCode}
                          </button>
                        ) : null}

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeBadge.bgColor} ${typeBadge.textColor} ${typeBadge.borderColor}`}
                        >
                          {item.materialType}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {item.fileSize || 'Standard'}
                        </span>

                        {item.semesterId && (
                          <span className="text-[10px] text-slate-500">
                            Sem {item.semesterId}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => handleOpenViewer(item)}
                        className="text-sm font-bold text-white leading-snug cursor-pointer hover:text-sky-400 transition-colors"
                      >
                        {item.title}
                      </h3>

                      {item.courseTitle && (
                        <p className="text-[11px] text-slate-400">
                          {item.courseTitle}
                        </p>
                      )}
                    </div>

                    {/* File Extension Badge */}
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-1 rounded-lg border shrink-0 ${fileBadge.bgColor} ${fileBadge.textColor} ${fileBadge.borderColor}`}
                    >
                      {fileBadge.label}
                    </span>
                  </div>

                  {/* Description preview */}
                  {item.description && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Card Footer: Metadata & Actions */}
                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/70 text-[11px] text-slate-400 gap-2">
                    <span className="truncate">
                      Uploaded {studentMaterialsService.formatDate(item.createdAt)}
                    </span>

                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => setActiveMaterialDetail(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Details</span>
                      </button>

                      {/* Download Original File (Premium) */}
                      <button
                        type="button"
                        onClick={() => handleDownload(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                        title="Download Original File (Premium)"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Download</span>
                      </button>

                      {/* Open / Read inside VENUE */}
                      <button
                        type="button"
                        onClick={() => handleOpenViewer(item)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
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

          {materials.length > visibleCount && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 15)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-sky-400 hover:text-white transition-colors cursor-pointer"
              >
                Load More Materials ({materials.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && materials.length === 0 && (
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
            <FolderOpen className="w-7 h-7 text-sky-400/80" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-white">No Academic Materials Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {searchQuery || activeType !== 'ALL' || selectedCourseFilter !== 'ALL'
                ? 'No materials matched your current search filters. Try adjusting your search keyword or selected category.'
                : 'No course materials have been published yet for your academic programme by lecturers or administrators. Check back soon!'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {(searchQuery || activeType !== 'ALL' || selectedCourseFilter !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            )}

            <button
              onClick={() => loadMaterials(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Check for Updates</span>
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeMaterialDetail && (
        <StudentMaterialDetailModal
          material={activeMaterialDetail}
          onClose={() => setActiveMaterialDetail(null)}
          onOpenViewer={handleOpenViewer}
          userId={profile?.uid}
          onSelectCourse={(code) => {
            setActiveMaterialDetail(null);
            handleCourseClick(code);
          }}
        />
      )}

      {/* Premium Download Gate Modal */}
      <PremiumDownloadModal
        isOpen={Boolean(premiumGateMaterial)}
        onClose={() => setPremiumGateMaterial(null)}
        material={premiumGateMaterial}
        onReadInsideVenue={
          premiumGateMaterial
            ? (mat) => {
                setPremiumGateMaterial(null);
                handleOpenViewer(mat);
              }
            : undefined
        }
      />
    </div>
  );
};
