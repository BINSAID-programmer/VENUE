import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  GraduationCap,
  Megaphone,
  Users,
  UserCheck,
  Lock,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Server,
  Monitor,
  Calendar,
  Activity,
  Database,
  Info,
} from 'lucide-react';
import { adminAuditService } from '../../../services/adminAuditService';
import {
  AuditLogEntry,
  AuditLogActionCategory,
  AuditLogFilterOptions,
  AuditLogStats,
} from '../../../types';

const CATEGORY_CONFIG: Record<
  AuditLogActionCategory,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
  }
> = {
  all: {
    label: 'All Actions',
    icon: ClipboardList,
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  catalogue: {
    label: 'Academic Catalogue',
    icon: GraduationCap,
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  materials: {
    label: 'Materials Repository',
    icon: FileText,
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  announcements: {
    label: 'Announcements',
    icon: Megaphone,
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  lecturers: {
    label: 'Faculty & Lecturers',
    icon: UserCheck,
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  students: {
    label: 'Student Directory',
    icon: Users,
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  security: {
    label: 'Security & Roles',
    icon: Lock,
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  university_admin: 'University Admin',
  college_admin: 'College Admin',
  department_moderator: 'Dept Moderator',
  verified_lecturer: 'Verified Lecturer',
  faculty_admin: 'Faculty Admin',
  system: 'Trusted System',
};

export const AdminAuditLogsPage: React.FC = () => {
  // Data state
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filter state
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<AuditLogActionCategory>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');

  // Loading & Error states
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<{
    type: 'permission' | 'network' | 'general';
    message: string;
  } | null>(null);

  // Detail modal state
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch audit logs and statistics
  const loadAuditData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorState(null);

      try {
        const filters: AuditLogFilterOptions = {
          search: debouncedSearch || undefined,
          category: selectedCategory,
          actorRole: selectedRole !== 'all' ? selectedRole : undefined,
          dateRange: selectedDateRange,
          page,
          pageSize,
        };

        const [logsResponse, statsResponse] = await Promise.all([
          adminAuditService.getAuditLogs(filters),
          adminAuditService.getAuditLogStats(),
        ]);

        setLogs(logsResponse.logs);
        setTotal(logsResponse.total);
        setTotalPages(Math.max(1, logsResponse.totalPages));
        setStats(statsResponse);
      } catch (err: any) {
        const msg = err?.message || 'Failed to load administrative audit logs.';
        const lower = msg.toLowerCase();
        if (lower.includes('permission') || lower.includes('insufficient') || lower.includes('403')) {
          setErrorState({
            type: 'permission',
            message:
              'Permission denied: Only verified Super Administrators are authorized to inspect platform audit logs.',
          });
        } else if (lower.includes('network') || lower.includes('fetch') || lower.includes('offline')) {
          setErrorState({
            type: 'network',
            message:
              'Network connectivity error while retrieving audit records. Please verify your connection and retry.',
          });
        } else {
          setErrorState({
            type: 'general',
            message: msg,
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, selectedCategory, selectedRole, selectedDateRange, page, pageSize]
  );

  useEffect(() => {
    loadAuditData(false);
  }, [loadAuditData]);

  // Inspect single log entry in detail modal
  const handleInspectLog = async (entry: AuditLogEntry) => {
    setSelectedLog(entry);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const freshDetail = await adminAuditService.getAuditLogById(entry.id);
      if (freshDetail) {
        setSelectedLog(freshDetail);
      } else {
        setDetailError('Could not retrieve extended server detail; showing cached record.');
      }
    } catch (err: any) {
      setDetailError(err?.message || 'Failed to retrieve log details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const formatTimestamp = (iso: string) => {
    if (!iso) return 'Unknown time';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const resetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedCategory('all');
    setSelectedRole('all');
    setSelectedDateRange('all');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    selectedCategory !== 'all' ||
    selectedRole !== 'all' ||
    selectedDateRange !== 'all';

  const actorEntries = stats?.byActor ? Object.entries(stats.byActor) : [];

  return (
    <div className="space-y-6">
      {/* Top Page Header & Append-Only Security Notice */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-3xl border border-slate-800/90 bg-slate-900/50 p-6 backdrop-blur-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Administrative Audit Logs
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <Lock className="h-3 w-3" />
                  Append-Only Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Immutable accountability registry of administrative actions across catalogue, materials, announcements, faculty, and student accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => loadAuditData(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Ledger'}</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards (Requirement 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Audit Log Records */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Audit Records</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white tracking-tight">
            {stats ? stats.totalRecords.toLocaleString() : '0'}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Verified immutable entries recorded
          </p>
        </div>

        {/* Card 2: Recent Activity (Last 24h) */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Recent Activity (24h)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white tracking-tight">
            {stats ? stats.recent24hCount.toLocaleString() : '0'}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Actions logged in the past 24 hours
          </p>
        </div>

        {/* Card 3: Activity by Action Type */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Activity by Action Type</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stats && Object.entries(stats.byCategory).some(([, count]) => count > 0) ? (
              Object.entries(stats.byCategory)
                .filter(([, count]) => count > 0)
                .map(([cat, count]) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 capitalize"
                  >
                    <span>{cat}:</span>
                    <strong className="text-white">{count}</strong>
                  </span>
                ))
            ) : (
              <span className="text-xs text-slate-500">No categorized actions yet</span>
            )}
          </div>
        </div>

        {/* Card 4: Activity by Administrator */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Administrators</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <User className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white tracking-tight">
            {actorEntries.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 truncate">
            {actorEntries.length > 0
              ? `Top: ${actorEntries[0][1].name} (${actorEntries[0][1].count})`
              : 'No administrator actions recorded yet'}
          </p>
        </div>
      </div>

      {/* Architectural Provenance & Immutability Disclosure (Requirement 4) */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
          <p className="font-semibold text-indigo-300">
            Immutable Audit Architecture & Provenance Verification
          </p>
          <p className="text-slate-400">
            Audit records are strictly append-only. Modifications and deletions are blocked by both Firestore Security Rules (<code className="text-indigo-300">allow update, delete: if false</code>) and the backend API. Actions executed through backend API endpoints are tagged as <strong className="text-emerald-300">Trusted Server</strong>, while actions committed directly from the authenticated admin client to Firestore are transparently labeled as <strong className="text-sky-300">Client Service</strong> with strict <code className="text-indigo-300">actorUid == request.auth.uid</code> anti-impersonation enforcement.
          </p>
        </div>
      </div>

      {/* Search & Multi-Dimensional Filter Controls (Requirement 5) */}
      <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search administrator, action, summary, or entity ID..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/90 pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Action Category */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as AuditLogActionCategory);
                setPage(1);
              }}
              aria-label="Filter by Action Type"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Action Categories</option>
              <option value="catalogue">Academic Catalogue</option>
              <option value="materials">Materials Repository</option>
              <option value="announcements">Announcements</option>
              <option value="lecturers">Faculty & Lecturers</option>
              <option value="students">Student Directory</option>
              <option value="security">Security & Roles</option>
            </select>
          </div>

          {/* Filter by Actor Role */}
          <div className="md:col-span-2">
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by Actor Role"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Actor Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="verified_lecturer">Verified Lecturer</option>
              <option value="university_admin">University Admin</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Filter by Date Range */}
          <div className="md:col-span-2">
            <select
              value={selectedDateRange}
              onChange={(e) => {
                setSelectedDateRange(e.target.value as any);
                setPage(1);
              }}
              aria-label="Filter by Date Range"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(CATEGORY_CONFIG) as AuditLogActionCategory[]).map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const Icon = cfg.icon;
              const active = selectedCategory === cat;
              const count =
                cat === 'all'
                  ? stats?.totalRecords
                  : stats?.byCategory?.[cat];

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950/70 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cfg.label}</span>
                  {typeof count === 'number' && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        active ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              Clear Active Filters
            </button>
          )}
        </div>
      </div>

      {/* Error States (Requirement 7) */}
      {errorState && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            {errorState.type === 'permission'
              ? 'Permission Denied'
              : errorState.type === 'network'
              ? 'Network Connection Error'
              : 'Audit Log Retrieval Error'}
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            {errorState.message}
          </p>
          <button
            onClick={() => loadAuditData(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      )}

      {/* Loading State (Requirement 7) */}
      {loading && !errorState && (
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/40 p-12 text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-white">Loading Immutable Audit Trail...</h3>
          <p className="text-xs text-slate-400">
            Querying indexed administrative logs in chronological order...
          </p>
        </div>
      )}

      {/* Empty State — No Fake Records (Requirement 2 & 7) */}
      {!loading && !errorState && logs.length === 0 && (
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/40 p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-white">
            {hasActiveFilters ? 'No Matching Audit Records' : 'No Administrative Audit Records Yet'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {hasActiveFilters
              ? 'No audit log entries matched your active search or filter criteria. Try clearing your filters to view all recorded actions.'
              : 'VENUE records only genuine administrative actions as they occur. Perform an administrative operation (such as updating catalogue items, uploading materials, publishing announcements, or managing user accounts) to populate the audit trail.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Paginated Audit Logs Table (Requirement 5) */}
      {!loading && !errorState && logs.length > 0 && (
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Administrator</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Summary</th>
                  <th className="py-3.5 px-4">Outcome & Source</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {logs.map((log) => {
                  const cat = adminAuditService.getActionCategory(log.action);
                  const catCfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.all;
                  const CatIcon = catCfg.icon;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => handleInspectLog(log)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span className="font-mono text-[11px]">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                      </td>

                      {/* Administrator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{log.actorName}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span>{ROLE_LABELS[log.actorRole] || log.actorRole}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500 truncate max-w-[110px]">
                            {log.actorUid}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${catCfg.badgeClass}`}
                        >
                          <CatIcon className="h-3 w-3" />
                          <span>{log.action}</span>
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-200 font-medium capitalize">
                          {String(log.entityType || '').replace(/_/g, ' ')}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                          ID: {log.entityId}
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {log.summary}
                      </td>

                      {/* Outcome & Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {log.outcome === 'failure' ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                              <XCircle className="h-3 w-3" />
                              Failure
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" />
                              Success
                            </span>
                          )}

                          {log.source === 'trusted_server' ? (
                            <span
                              title="Recorded by Trusted Express Backend"
                              className="inline-flex items-center gap-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-medium text-indigo-300"
                            >
                              <Server className="h-2.5 w-2.5" />
                              Server
                            </span>
                          ) : (
                            <span
                              title="Recorded via Authenticated Client Service with Firestore Rules Validation"
                              className="inline-flex items-center gap-1 rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                            >
                              <Monitor className="h-2.5 w-2.5" />
                              Client
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectLog(log);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/60 px-5 py-3.5 text-xs text-slate-400">
            <div>
              Showing page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({total.toLocaleString()} total records)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity by Administrator Breakdown Section (Requirement 1) */}
      {actorEntries.length > 0 && (
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/50 p-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Recorded Activity by Administrator</span>
          </h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actorEntries.map(([uid, info]) => (
              <div
                key={uid}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{info.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">UID: {uid}</p>
                  <span className="mt-1 inline-block rounded bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300">
                    {ROLE_LABELS[info.role] || info.role}
                  </span>
                </div>
                <div className="text-right pl-3">
                  <span className="text-lg font-bold text-white">{info.count}</span>
                  <p className="text-[10px] text-slate-400">actions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log Detail Inspection Modal (Requirement 5) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Audit Log Record Inspection</h3>
                  <p className="font-mono text-[11px] text-slate-400">{selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {detailLoading && (
                <div className="flex items-center gap-2 text-indigo-400 text-xs">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying record integrity...</span>
                </div>
              )}

              {detailError && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{detailError}</span>
                </div>
              )}

              {/* Summary Banner */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Action Summary
                </span>
                <p className="mt-1 text-sm font-semibold text-white leading-relaxed">
                  {selectedLog.summary}
                </p>
              </div>

              {/* Core Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                  <span className="text-[10px] text-slate-400 uppercase">Actor Name & Role</span>
                  <p className="mt-1 font-semibold text-white">{selectedLog.actorName}</p>
                  <p className="text-[11px] text-indigo-400">
                    {ROLE_LABELS[selectedLog.actorRole] || selectedLog.actorRole}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                  <span className="text-[10px] text-slate-400 uppercase">Actor UID</span>
                  <p className="mt-1 font-mono text-slate-200 break-all">{selectedLog.actorUid}</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                  <span className="text-[10px] text-slate-400 uppercase">Action Identifier</span>
                  <p className="mt-1 font-mono font-semibold text-indigo-300">
                    {selectedLog.action}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                  <span className="text-[10px] text-slate-400 uppercase">Timestamp</span>
                  <p className="mt-1 font-mono text-slate-200">
                    {formatTimestamp(selectedLog.timestamp)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                  <span className="text-[10px] text-slate-400 uppercase">Target Entity Type</span>
                  <p className="mt-1 font-semibold text-white capitalize">
                    {String(selectedLog.entityType || '').replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                  <span className="text-[10px] text-slate-400 uppercase">Target Entity ID</span>
                  <p className="mt-1 font-mono text-slate-200 break-all">{selectedLog.entityId}</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                  <span className="text-[10px] text-slate-400 uppercase">Execution Outcome</span>
                  <div className="mt-1">
                    {selectedLog.outcome === 'failure' ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                        <XCircle className="h-3.5 w-3.5" />
                        Failed Operation
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Succeeded
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                  <span className="text-[10px] text-slate-400 uppercase">Recording Provenance</span>
                  <p className="mt-1 font-semibold text-slate-200">
                    {selectedLog.source === 'trusted_server'
                      ? 'Trusted Backend Server (Append-Only)'
                      : 'Authenticated Client Service (Firestore Rule Enforced)'}
                  </p>
                </div>
              </div>

              {/* Metadata Payload */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Recorded Action Metadata (Sanitized)
                </span>
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      {Object.entries(selectedLog.metadata).map(([key, val]) => (
                        <div key={key} className="border-b border-slate-800/70 pb-2">
                          <dt className="text-[10px] font-mono text-slate-400">{key}</dt>
                          <dd className="mt-0.5 text-xs font-medium text-slate-200 break-words">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <pre className="text-[11px] font-mono text-indigo-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800 overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-slate-500">
                    No additional metadata properties attached to this record.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-3.5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Immutable audit entry — editing and deletion are permanently disabled</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
