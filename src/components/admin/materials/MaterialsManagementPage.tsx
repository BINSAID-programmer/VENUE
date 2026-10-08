import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  Calendar,
  Layers,
  GraduationCap,
  BookOpen,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building,
  Sparkles,
  Download,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import {
  AcademicMaterialRecord,
  AcademicMaterialType,
  MaterialStatus,
  UniversityRecord,
  AcademicUnitRecord,
  DepartmentRecord,
  ProgrammeRecord,
} from '../../../types';
import {
  adminMaterialsService,
  MATERIAL_TYPES,
  MATERIAL_STATUSES,
} from '../../../services/adminMaterialsService';
import { adminCatalogueService } from '../../../services/adminCatalogueService';
import { AddMaterialModal } from './AddMaterialModal';
import { EditMaterialModal } from './EditMaterialModal';
import { DeleteMaterialModal } from './DeleteMaterialModal';
import { MaterialDetailModal } from './MaterialDetailModal';

export const MaterialsManagementPage: React.FC = () => {
  const [materials, setMaterials] = useState<AcademicMaterialRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search State with Debounce
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter States
  const [selectedType, setSelectedType] = useState<AcademicMaterialType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<MaterialStatus | 'ALL'>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Dependent Catalogue Filter Hierarchy
  const [filterUniId, setFilterUniId] = useState<string>('ALL');
  const [filterUnitId, setFilterUnitId] = useState<string>('ALL');
  const [filterDeptId, setFilterDeptId] = useState<string>('ALL');
  const [filterProgId, setFilterProgId] = useState<string>('ALL');

  // Catalogue Options Cache
  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [units, setUnits] = useState<AcademicUnitRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeRecord[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // View Mode
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [detailModalMaterial, setDetailModalMaterial] = useState<AcademicMaterialRecord | null>(null);
  const [editModalMaterial, setEditModalMaterial] = useState<AcademicMaterialRecord | null>(null);
  const [deleteModalMaterial, setDeleteModalMaterial] = useState<AcademicMaterialRecord | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Debounce search query (300ms)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(value);
      setCurrentPage(1);
    }, 300);
  };

  // Load Materials from Firestore
  const loadMaterials = useCallback(async () => {
    setError(null);
    try {
      const data = await adminMaterialsService.getMaterials();
      setMaterials(data);
    } catch (err: any) {
      console.warn('Error loading materials:', err);
      setError(err?.message || 'Failed to fetch materials from Firestore.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Load Catalogue metadata for dependent filters
  useEffect(() => {
    const loadCatalogue = async () => {
      try {
        const [uniList, deptList, progList] = await Promise.all([
          adminCatalogueService.getUniversities(),
          adminCatalogueService.getAllDepartments(),
          adminCatalogueService.getAllProgrammes(),
        ]);
        setUniversities(uniList);
        setDepartments(deptList);
        setProgrammes(progList);
        if (uniList.length > 0) {
          const unitList = await adminCatalogueService.getAcademicUnits(uniList[0].id);
          setUnits(unitList);
        }
      } catch (err) {
        console.warn('Error loading filter catalogue metadata:', err);
      }
    };
    loadCatalogue();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMaterials();
  };

  // Dependent Filter cascades
  const filteredDepartments = useMemo(() => {
    if (filterUnitId === 'ALL') return departments;
    const unitAliases = new Set(adminCatalogueService.getAcademicUnitAliases(filterUnitId));
    return departments.filter((d) => unitAliases.has((d.academicUnitId || '').toLowerCase().trim()));
  }, [departments, filterUnitId]);

  const filteredProgrammes = useMemo(() => {
    if (filterDeptId === 'ALL') {
      if (filterUnitId === 'ALL') return programmes;
      const deptAliases = new Set<string>();
      for (const d of filteredDepartments) {
        for (const a of adminCatalogueService.getDepartmentAliases(d.id)) {
          deptAliases.add(a);
        }
      }
      return programmes.filter((p) => deptAliases.has((p.departmentId || '').toLowerCase().trim()));
    }
    const deptAliases = new Set(adminCatalogueService.getDepartmentAliases(filterDeptId));
    return programmes.filter((p) => deptAliases.has((p.departmentId || '').toLowerCase().trim()));
  }, [programmes, filterDeptId, filterUnitId, filteredDepartments]);

  // Multi-attribute Filtered List
  const filteredMaterials = useMemo(() => {
    let result = [...materials];

    if (selectedType !== 'ALL') {
      result = result.filter((m) => m.materialType === selectedType);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((m) => m.status === selectedStatus);
    }

    if (filterUniId !== 'ALL') {
      const cleanUni = filterUniId.toLowerCase().trim();
      result = result.filter((m) => (m.universityId || 'udsm').toLowerCase().trim() === cleanUni);
    }

    if (filterUnitId !== 'ALL') {
      const unitAliases = new Set(adminCatalogueService.getAcademicUnitAliases(filterUnitId));
      result = result.filter((m) => unitAliases.has((m.academicUnitId || '').toLowerCase().trim()));
    }

    if (filterDeptId !== 'ALL') {
      const deptAliases = new Set(adminCatalogueService.getDepartmentAliases(filterDeptId));
      result = result.filter((m) => deptAliases.has((m.departmentId || '').toLowerCase().trim()));
    }

    if (filterProgId !== 'ALL') {
      const progAliases = new Set(adminCatalogueService.getProgrammeAliases(filterProgId));
      result = result.filter((m) => progAliases.has((m.programmeId || '').toLowerCase().trim()));
    }

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.fileName?.toLowerCase().includes(q) ||
          m.courseCode?.toLowerCase().includes(q) ||
          m.courseTitle?.toLowerCase().includes(q) ||
          m.programmeName?.toLowerCase().includes(q) ||
          m.departmentName?.toLowerCase().includes(q) ||
          m.materialType?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [
    materials,
    selectedType,
    selectedStatus,
    filterUniId,
    filterUnitId,
    filterDeptId,
    filterProgId,
    debouncedQuery,
  ]);

  // Pagination Math
  const totalItems = filteredMaterials.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredMaterials.slice(startIndex, startIndex + pageSize);
  }, [filteredMaterials, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedStatus, filterUniId, filterUnitId, filterDeptId, filterProgId]);

  // Aggregate Metrics
  const activeCount = materials.filter((m) => m.status === 'active').length;
  const draftCount = materials.filter((m) => m.status === 'draft').length;

  const handleMaterialCreated = async (newMaterial: AcademicMaterialRecord) => {
    setMaterials((prev) => {
      const withoutDup = prev.filter((m) => m.id !== newMaterial.id);
      return [newMaterial, ...withoutDup];
    });
    showNotification(`Academic material "${newMaterial.title}" uploaded and verified in repository.`);
    await loadMaterials();
  };

  const handleMaterialUpdated = async (updated: AcademicMaterialRecord) => {
    setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    showNotification(`Material "${updated.title}" updated successfully.`);
    await loadMaterials();
  };

  const handleMaterialDeleted = async (deletedId: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== deletedId));
    showNotification('Material document and Cloud Storage file deleted safely.');
    await loadMaterials();
  };

  const resetAllFilters = () => {
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setFilterUniId('ALL');
    setFilterUnitId('ALL');
    setFilterDeptId('ALL');
    setFilterProgId('ALL');
    setSearchQuery('');
    setDebouncedQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedType !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    filterUniId !== 'ALL' ||
    filterUnitId !== 'ALL' ||
    filterDeptId !== 'ALL' ||
    filterProgId !== 'ALL' ||
    debouncedQuery.trim() !== '';

  const getTypeBadgeColor = (type: AcademicMaterialType) => {
    switch (type) {
      case 'Lecture Notes':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Past Papers':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Slides':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Assignments':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Solutions':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Tutorials':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'Reference Materials':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Handouts':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900/95 px-5 py-3.5 shadow-2xl backdrop-blur-xl text-xs text-white">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <FileCheck className="h-3.5 w-3.5" />
              <span>VENUE Academic Cloud Repository • Stage 4B</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Materials Management
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Curate, upload, and organize institutional syllabus documents, lecture notes, slides,
              and past papers directly in Cloud Storage mapped to accredited courses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
              title="Refresh materials from Firestore"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Sync Firestore'}</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-indigo-600 to-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:from-amber-500 hover:to-indigo-400"
            >
              <Plus className="h-4 w-4" />
              <span>Add Material</span>
            </button>
          </div>
        </div>

        {/* Quick Platform Metrics Ribbon */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4">
          <div className="rounded-xl bg-slate-950/40 border border-slate-800/80 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Stored Documents
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-white">{materials.length}</span>
              <span className="text-[11px] text-slate-400">in repository</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/40 border border-slate-800/80 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Active / Published
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-emerald-400">{activeCount}</span>
              <span className="text-[11px] text-slate-400">student visible</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/40 border border-slate-800/80 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Draft / Staging
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-amber-300">{draftCount}</span>
              <span className="text-[11px] text-slate-400">internal review</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/40 border border-slate-800/80 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              Supported Formats
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-sky-300">PDF, DOCX, PPTX</span>
              <span className="text-[11px] text-slate-400">max 50MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Debounced Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title, course (e.g. ST 113, MT 100), material type, or file name..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Types ({materials.length})</option>
              {MATERIAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="draft">Draft Only</option>
              <option value="archived">Archived</option>
            </select>

            {/* Toggle Advanced Catalogue Filters */}
            <button
              onClick={() => setShowAdvancedFilters((p) => !p)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                showAdvancedFilters || filterUnitId !== 'ALL' || filterDeptId !== 'ALL' || filterProgId !== 'ALL'
                  ? 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300'
                  : 'border-slate-700 bg-slate-800/90 text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Catalogue Filters</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-slate-800/80 p-0.5 border border-slate-700/60">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === 'cards' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid Card View"
              >
                Cards
              </button>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Dependent Catalogue Filter Cascades */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Filter by Academic Unit
              </label>
              <select
                value={filterUnitId}
                onChange={(e) => {
                  setFilterUnitId(e.target.value);
                  setFilterDeptId('ALL');
                  setFilterProgId('ALL');
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="ALL">All Academic Units</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.shortName ? `${u.shortName} — ` : ''}{u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Filter by Department
              </label>
              <select
                value={filterDeptId}
                onChange={(e) => {
                  setFilterDeptId(e.target.value);
                  setFilterProgId('ALL');
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {filteredDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Filter by Programme
              </label>
              <select
                value={filterProgId}
                onChange={(e) => setFilterProgId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="ALL">All Programmes</option>
                {filteredProgrammes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code ? `[${p.code}] ` : ''}{p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Filter Summary & Pagination Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
          <div>
            Showing <strong className="text-white">{filteredMaterials.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
            <strong className="text-white">{totalItems}</strong> matching materials (Page {currentPage} of {totalPages})
          </div>

          {/* Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-700 bg-slate-800 p-1 text-slate-300 hover:text-white disabled:opacity-40 transition"
                title="Previous Page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 text-xs font-mono text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-700 bg-slate-800 p-1 text-slate-300 hover:text-white disabled:opacity-40 transition"
                title="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[360px] rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500 mb-4" />
          <h3 className="text-sm font-semibold text-white">Loading Materials Repository...</h3>
          <p className="mt-1 text-xs text-slate-400">
            Querying Firestore documents and validating academic placement hierarchy...
          </p>
        </div>
      ) : materials.length === 0 ? (
        /* PROPER EMPTY STATE: When NO materials exist in Firestore */
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-xl shadow-amber-500/5 mb-6">
            <FileText className="h-10 w-10" />
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            No Academic Materials Uploaded Yet
          </h3>
          <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            The materials repository is currently ready for institutional documents. You can upload
            lecture notes, handouts, slides, past papers, and solutions directly mapped to official courses.
          </p>

          {/* Supported Types Preview Grid */}
          <div className="mt-8 max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left">
            {MATERIAL_TYPES.map((type) => (
              <div
                key={type}
                className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5 text-xs text-slate-300"
              >
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="font-medium">{type}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Upload First Material</span>
            </button>
          </div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        /* Filtered Empty State */
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-4">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Matching Materials</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            No documents matched your current search query or filter criteria.
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
          >
            <span>Reset Search & Filters</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Data Table View */
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-4">
                    Material Title
                  </th>
                  <th scope="col" className="px-4 py-4">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-4">
                    Course & Programme
                  </th>
                  <th scope="col" className="px-4 py-4">
                    File Info
                  </th>
                  <th scope="col" className="px-4 py-4">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-4">
                    Uploaded
                  </th>
                  <th scope="col" className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {paginatedMaterials.map((mat) => (
                  <tr
                    key={mat.id}
                    className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    onClick={() => setDetailModalMaterial(mat)}
                  >
                    {/* Title & Desc */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-amber-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-xs">{mat.title}</p>
                          {mat.description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {mat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Material Type */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${getTypeBadgeColor(
                          mat.materialType
                        )}`}
                      >
                        {mat.materialType}
                      </span>
                    </td>

                    {/* Course & Programme */}
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <span className="font-bold text-indigo-300">
                          {mat.courseCode || 'Course'}
                        </span>
                        {mat.courseTitle && (
                          <span className="text-slate-400 text-[11px] truncate block max-w-[200px]">
                            {mat.courseTitle}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 block truncate max-w-[200px] mt-0.5">
                          {mat.programmeName || mat.programmeId} • Y{mat.yearId}S{mat.semesterId}
                        </span>
                      </div>
                    </td>

                    {/* File Info */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="font-mono text-slate-200 text-[11px] truncate max-w-[140px]">
                        {mat.fileName}
                      </p>
                      <p className="text-[10px] text-slate-400">{mat.fileSize}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          mat.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : mat.status === 'draft'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {mat.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Uploaded */}
                    <td className="px-4 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(mat.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {mat.fileUrl && (
                          <a
                            href={mat.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition"
                            title="Open / View Document"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}

                        <button
                          onClick={() => setDetailModalMaterial(mat)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setEditModalMaterial(mat)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition"
                          title="Edit Material"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setDeleteModalMaterial(mat)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
                          title="Delete Material"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedMaterials.map((mat) => (
            <div
              key={mat.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition shadow-lg group cursor-pointer"
              onClick={() => setDetailModalMaterial(mat)}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${getTypeBadgeColor(
                      mat.materialType
                    )}`}
                  >
                    {mat.materialType}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                      mat.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {mat.status.toUpperCase()}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight line-clamp-2">
                  {mat.title}
                </h4>

                {mat.description && (
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {mat.description}
                  </p>
                )}

                <div className="mt-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 p-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="font-bold text-indigo-300">
                      {mat.courseCode || 'Course'}
                    </span>
                    <span className="text-slate-400 truncate">
                      {mat.courseTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <GraduationCap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{mat.programmeName || mat.programmeId}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 pl-5">
                    Year {mat.yearId} • Semester {mat.semesterId}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                <span className="text-slate-400 text-[11px] font-mono truncate max-w-[120px]">
                  {mat.fileName}
                </span>

                <div className="flex items-center gap-1">
                  {mat.fileUrl && (
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-sky-400"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => setDetailModalMaterial(mat)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditModalMaterial(mat)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteModalMaterial(mat)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMaterialCreated={handleMaterialCreated}
      />

      <EditMaterialModal
        isOpen={Boolean(editModalMaterial)}
        material={editModalMaterial}
        onClose={() => setEditModalMaterial(null)}
        onMaterialUpdated={handleMaterialUpdated}
      />

      <DeleteMaterialModal
        isOpen={Boolean(deleteModalMaterial)}
        material={deleteModalMaterial}
        onClose={() => setDeleteModalMaterial(null)}
        onMaterialDeleted={handleMaterialDeleted}
      />

      <MaterialDetailModal
        isOpen={Boolean(detailModalMaterial)}
        material={detailModalMaterial}
        onClose={() => setDetailModalMaterial(null)}
        onEdit={(mat) => setEditModalMaterial(mat)}
        onDelete={(mat) => setDeleteModalMaterial(mat)}
      />
    </div>
  );
};
