import React, { useState, useEffect, useMemo, useId } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  Calendar,
  Layers,
  Building2,
  Building,
  Eye,
  Edit2,
  Power,
  Mail,
  Phone,
  Briefcase,
  BadgeCheck,
  Clock,
  AlertCircle,
  X,
  ShieldCheck,
  UserX,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';
import {
  LecturerRecord,
  LecturerStatus,
  LecturerVerificationStatus,
  UniversityRecord,
  AcademicUnitRecord,
  DepartmentRecord,
} from '../../../types';
import { adminLecturersService } from '../../../services/adminLecturersService';
import { adminCatalogueService } from '../../../services/adminCatalogueService';
import { AddLecturerModal } from './AddLecturerModal';
import { EditLecturerModal } from './EditLecturerModal';
import { LecturerDetailModal } from './LecturerDetailModal';
import { LinkLecturerAccountModal } from './LinkLecturerAccountModal';

export const LecturersManagementPage: React.FC = () => {
  const uniFilterId = useId();
  const unitFilterId = useId();
  const deptFilterId = useId();
  const statusFilterId = useId();
  const verificationFilterId = useId();

  // Lecturers List State
  const [lecturers, setLecturers] = useState<LecturerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterUniId, setFilterUniId] = useState<string>('ALL');
  const [filterUnitId, setFilterUnitId] = useState<string>('ALL');
  const [filterDeptId, setFilterDeptId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<LecturerStatus | 'ALL'>('ALL');
  const [filterVerification, setFilterVerification] = useState<LecturerVerificationStatus | 'ALL'>('ALL');

  // Catalogue records for dependent filtering
  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [academicUnits, setAcademicUnits] = useState<AcademicUnitRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<LecturerRecord | null>(null);
  const [viewingLecturer, setViewingLecturer] = useState<LecturerRecord | null>(null);
  const [linkingLecturer, setLinkingLecturer] = useState<LecturerRecord | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load catalogue data for filters
  useEffect(() => {
    let isMounted = true;
    const loadCatalogue = async () => {
      try {
        const unis = await adminCatalogueService.getUniversities();
        if (isMounted) setUniversities(unis);
      } catch (err) {
        console.warn('Error loading universities for filters:', err);
      }
    };
    loadCatalogue();
    return () => {
      isMounted = false;
    };
  }, []);

  // When University filter changes, update Units
  useEffect(() => {
    if (!filterUniId || filterUniId === 'ALL') {
      setAcademicUnits([]);
      setFilterUnitId('ALL');
      setDepartments([]);
      setFilterDeptId('ALL');
      return;
    }

    let isMounted = true;
    const loadUnits = async () => {
      try {
        const units = await adminCatalogueService.getAcademicUnits(filterUniId);
        if (isMounted) {
          setAcademicUnits(units);
          setFilterUnitId('ALL');
        }
      } catch (err) {
        console.warn('Error loading units for filters:', err);
      }
    };
    loadUnits();
    return () => {
      isMounted = false;
    };
  }, [filterUniId]);

  // When Unit filter changes, update Departments
  useEffect(() => {
    if (!filterUnitId || filterUnitId === 'ALL') {
      setDepartments([]);
      setFilterDeptId('ALL');
      return;
    }

    let isMounted = true;
    const loadDepts = async () => {
      try {
        const depts = await adminCatalogueService.getDepartmentsByUnit(filterUnitId);
        if (isMounted) {
          setDepartments(depts);
          setFilterDeptId('ALL');
        }
      } catch (err) {
        console.warn('Error loading departments for filters:', err);
      }
    };
    loadDepts();
    return () => {
      isMounted = false;
    };
  }, [filterUnitId]);

  // Fetch Lecturers from Firestore
  const loadLecturers = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const records = await adminLecturersService.getLecturers({
        search: debouncedSearch,
        universityId: filterUniId,
        academicUnitId: filterUnitId,
        departmentId: filterDeptId,
        status: filterStatus,
        verificationStatus: filterVerification,
      });
      setLecturers(records);
    } catch (err: any) {
      console.error('Error loading lecturers:', err);
      setError('Failed to load lecturers from Firestore. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLecturers();
  }, [
    debouncedSearch,
    filterUniId,
    filterUnitId,
    filterDeptId,
    filterStatus,
    filterVerification,
  ]);

  // Toggle active/inactive status directly
  const handleToggleStatus = async (lecturer: LecturerRecord) => {
    try {
      const newStatus = await adminLecturersService.toggleLecturerStatus(
        lecturer.id,
        lecturer.status
      );
      setLecturers((prev) =>
        prev.map((l) => (l.id === lecturer.id ? { ...l, status: newStatus } : l))
      );
      if (viewingLecturer && viewingLecturer.id === lecturer.id) {
        setViewingLecturer((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterUniId('ALL');
    setFilterUnitId('ALL');
    setFilterDeptId('ALL');
    setFilterStatus('ALL');
    setFilterVerification('ALL');
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = lecturers.length;
    const active = lecturers.filter((l) => l.status === 'active').length;
    const verified = lecturers.filter((l) => l.verificationStatus === 'verified').length;
    const pending = lecturers.filter((l) => l.verificationStatus === 'pending').length;
    return { total, active, verified, pending };
  }, [lecturers]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Faculty Governance
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Institutional Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Lecturers
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verified faculty directory, departmental educators, and academic staff registry
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadLecturers(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-rose-400' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lecturer</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Registered
          </span>
          <p className="text-xl sm:text-2xl font-black text-white">{stats.total}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Active Instructors
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">{stats.active}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
            Verified Faculty
          </span>
          <p className="text-xl sm:text-2xl font-black text-sky-400">{stats.verified}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Pending Review
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400">{stats.pending}</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-3.5 shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by lecturer name, email, or staff ID..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
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

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* 1. University Filter */}
          <div className="space-y-1">
            <label htmlFor={uniFilterId} className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-500" />
              University:
            </label>
            <select
              id={uniFilterId}
              value={filterUniId}
              onChange={(e) => setFilterUniId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
            >
              <option value="ALL">All Universities</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.shortName || u.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Academic Unit Filter (Dependent) */}
          <div className="space-y-1">
            <label htmlFor={unitFilterId} className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-500" />
              Academic Unit:
            </label>
            <select
              id={unitFilterId}
              value={filterUnitId}
              onChange={(e) => setFilterUnitId(e.target.value)}
              disabled={filterUniId === 'ALL'}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-50"
            >
              <option value="ALL">All Academic Units</option>
              {academicUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.shortName || unit.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Department Filter (Dependent) */}
          <div className="space-y-1">
            <label htmlFor={deptFilterId} className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-500" />
              Department:
            </label>
            <select
              id={deptFilterId}
              value={filterDeptId}
              onChange={(e) => setFilterDeptId(e.target.value)}
              disabled={filterUnitId === 'ALL'}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-50"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Status Filter */}
          <div className="space-y-1">
            <label htmlFor={statusFilterId} className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Power className="w-3 h-3 text-slate-500" />
              Status:
            </label>
            <select
              id={statusFilterId}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* 5. Verification Filter */}
          <div className="space-y-1">
            <label htmlFor={verificationFilterId} className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <BadgeCheck className="w-3 h-3 text-slate-500" />
              Verification:
            </label>
            <select
              id={verificationFilterId}
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
            >
              <option value="ALL">All Verifications</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Active Filter Clear Prompt */}
        {(debouncedSearch ||
          filterUniId !== 'ALL' ||
          filterUnitId !== 'ALL' ||
          filterDeptId !== 'ALL' ||
          filterStatus !== 'ALL' ||
          filterVerification !== 'ALL') && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400">
              Active filters applied. Showing {lecturers.length} result
              {lecturers.length === 1 ? '' : 's'}.
            </span>
            <button
              onClick={handleResetFilters}
              className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadLecturers()}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !refreshing && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center justify-between"
            >
              <div className="space-y-2 w-1/3">
                <div className="h-4 bg-slate-800 rounded"></div>
                <div className="h-3 bg-slate-800/60 rounded w-2/3"></div>
              </div>
              <div className="h-4 bg-slate-800 rounded w-24"></div>
              <div className="h-4 bg-slate-800 rounded w-16"></div>
            </div>
          ))}
        </div>
      )}

      {/* Lecturers Table / Card View */}
      {!loading && lecturers.length > 0 && (
        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Lecturer</th>
                  <th className="py-3.5 px-4">Staff ID</th>
                  <th className="py-3.5 px-4">Department & Unit</th>
                  <th className="py-3.5 px-4">Rank / Position</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">VENUE Account</th>
                  <th className="py-3.5 px-4">Date Added</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {lecturers.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Lecturer Name & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'L'}
                        </div>
                        <div className="min-w-0">
                          <p
                            onClick={() => setViewingLecturer(item)}
                            className="font-bold text-white hover:text-rose-400 transition-colors cursor-pointer truncate"
                          >
                            {item.title ? `${item.title} ` : ''}
                            {item.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Staff ID */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {item.staffId ? (
                        <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300">
                          {item.staffId}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">None</span>
                      )}
                    </td>

                    {/* Academic Placement */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200 truncate max-w-[180px]">
                        {item.departmentName || item.departmentId}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {item.academicUnitName || item.academicUnitId}
                      </p>
                    </td>

                    {/* Rank / Position */}
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {item.position || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {item.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4">
                      {item.verificationStatus === 'verified' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          <BadgeCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      {item.verificationStatus === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      {item.verificationStatus === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* VENUE Account Linking */}
                    <td className="py-3.5 px-4">
                      {item.accountLinked || item.userId ? (
                        <button
                          onClick={() => setLinkingLecturer(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 transition-colors cursor-pointer"
                          title={`Account linked to UID ${item.userId || ''}. Click to manage.`}
                        >
                          <LinkIcon className="w-3 h-3 text-sky-400" />
                          <span>Account linked</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setLinkingLecturer(item)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer"
                          title="No VENUE account linked. Click to link account or generate invitation code."
                        >
                          <Unlink className="w-3 h-3 text-slate-500" />
                          <span>No VENUE account linked</span>
                        </button>
                      )}
                    </td>

                    {/* Added Date */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(item.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setLinkingLecturer(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title={item.accountLinked || item.userId ? 'Manage Account Link' : 'Link VENUE Account'}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setViewingLecturer(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setEditingLecturer(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Lecturer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            item.status === 'active'
                              ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                              : 'text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title={item.status === 'active' ? 'Deactivate Lecturer' : 'Activate Lecturer'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Cards View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {lecturers.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'L'}
                    </div>
                    <div>
                      <h4
                        onClick={() => setViewingLecturer(item)}
                        className="font-bold text-white hover:text-rose-400 transition-colors cursor-pointer text-sm"
                      >
                        {item.title ? `${item.title} ` : ''}
                        {item.fullName}
                      </h4>
                      <p className="text-xs text-slate-400">{item.email}</p>
                    </div>
                  </div>

                  {item.status === 'active' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
                  <div>
                    <span className="text-slate-500 uppercase font-semibold text-[9px] block">
                      Department
                    </span>
                    <span className="text-slate-300 truncate block">
                      {item.departmentName || item.departmentId}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase font-semibold text-[9px] block">
                      Staff ID
                    </span>
                    <span className="text-slate-300 font-mono block">
                      {item.staffId || 'None'}
                    </span>
                  </div>
                </div>

                {/* Mobile VENUE Account Status */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs">
                  <span className="text-slate-400 text-[11px]">VENUE Account:</span>
                  {item.accountLinked || item.userId ? (
                    <button
                      onClick={() => setLinkingLecturer(item)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" /> Account linked
                    </button>
                  ) : (
                    <button
                      onClick={() => setLinkingLecturer(item)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 cursor-pointer"
                    >
                      <Unlink className="w-3 h-3" /> No account linked
                    </button>
                  )}
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-[11px] text-slate-500">
                    Added {formatDate(item.createdAt)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setLinkingLecturer(item)}
                      className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
                      title={item.accountLinked || item.userId ? 'Manage Account Link' : 'Link Account'}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setViewingLecturer(item)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      View
                    </button>

                    <button
                      onClick={() => setEditingLecturer(item)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-sky-400 hover:bg-blue-600/30 transition-colors"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        item.status === 'active'
                          ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                    >
                      {item.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proper Empty State */}
      {!loading && lecturers.length === 0 && (
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
            <UserCheck className="w-7 h-7 text-rose-400/80" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-white">No Faculty Lecturers Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {debouncedSearch ||
              filterUniId !== 'ALL' ||
              filterUnitId !== 'ALL' ||
              filterDeptId !== 'ALL' ||
              filterStatus !== 'ALL' ||
              filterVerification !== 'ALL'
                ? 'No lecturers matched your filter criteria. Try resetting your search or selecting different catalogue departments.'
                : 'No lecturers have been registered in the institutional repository yet. Register faculty educators using the existing academic catalogue departments.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {debouncedSearch ||
            filterUniId !== 'ALL' ||
            filterUnitId !== 'ALL' ||
            filterDeptId !== 'ALL' ||
            filterStatus !== 'ALL' ||
            filterVerification !== 'ALL' ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            ) : null}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Lecturer</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Lecturer Modal */}
      <AddLecturerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newLecturer) => {
          setLecturers((prev) => [newLecturer, ...prev]);
        }}
      />

      {/* Edit Lecturer Modal */}
      <EditLecturerModal
        lecturer={editingLecturer}
        isOpen={Boolean(editingLecturer)}
        onClose={() => setEditingLecturer(null)}
        onSuccess={(updated) => {
          setLecturers((prev) =>
            prev.map((l) => (l.id === updated.id ? updated : l))
          );
          if (viewingLecturer && viewingLecturer.id === updated.id) {
            setViewingLecturer(updated);
          }
        }}
      />

      {/* View Lecturer Detail Modal */}
      <LecturerDetailModal
        lecturer={viewingLecturer}
        isOpen={Boolean(viewingLecturer)}
        onClose={() => setViewingLecturer(null)}
        onEdit={(lecturer) => {
          setEditingLecturer(lecturer);
        }}
        onStatusToggled={(lecturerId, newStatus) => {
          setLecturers((prev) =>
            prev.map((l) => (l.id === lecturerId ? { ...l, status: newStatus } : l))
          );
        }}
        onOpenLinkAccount={(lecturer) => {
          setLinkingLecturer(lecturer);
        }}
      />

      {/* Link Lecturer Account Modal */}
      <LinkLecturerAccountModal
        lecturer={linkingLecturer}
        isOpen={Boolean(linkingLecturer)}
        onClose={() => setLinkingLecturer(null)}
        onSuccess={(updated) => {
          setLecturers((prev) =>
            prev.map((l) => (l.id === updated.id ? updated : l))
          );
          if (viewingLecturer && viewingLecturer.id === updated.id) {
            setViewingLecturer(updated);
          }
          setLinkingLecturer(updated);
        }}
      />
    </div>
  );
};
