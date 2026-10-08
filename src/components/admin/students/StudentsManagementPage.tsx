import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Building2,
  GraduationCap,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Mail,
  Calendar,
  Hash,
  BookOpen,
} from 'lucide-react';
import { StudentProfile } from '../../../types';
import {
  adminStudentsService,
  StudentFilterOptions,
  PaginatedStudentsResponse,
} from '../../../services/adminStudentsService';
import { StudentDetailModal } from './StudentDetailModal';

export const StudentsManagementPage: React.FC = () => {
  // State
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');
  const [universityFilter, setUniversityFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');

  // Selected student for details modal
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  // Debounce search effect (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search query
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Derived filter options
  const filterOptions = useMemo<StudentFilterOptions>(() => {
    return {
      search: debouncedSearch.trim() || undefined,
      status: statusFilter,
      universityId: universityFilter,
      yearOfStudy: yearFilter,
    };
  }, [debouncedSearch, statusFilter, universityFilter, yearFilter]);

  // Fetch students function
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res: PaginatedStudentsResponse = await adminStudentsService.getStudents(
        filterOptions,
        currentPage,
        pageSize
      );
      setStudents(res.students);
      setTotalStudents(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      console.error('Error in StudentsManagementPage fetch:', err);
      setError(err?.message || 'Failed to load students directory. Please retry.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filterOptions, currentPage, pageSize]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    adminStudentsService.clearCache();
    fetchStudents();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('ALL');
    setUniversityFilter('ALL');
    setYearFilter('ALL');
    setCurrentPage(1);
  };

  const handleOpenDetail = (student: StudentProfile) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  // Safe Account Status Toggle
  const handleToggleStatus = async (
    student: StudentProfile,
    newStatus: 'active' | 'inactive'
  ) => {
    if (!student.uid) return;
    try {
      setUpdatingUid(student.uid);
      const res = await adminStudentsService.updateStudentStatus(student.uid, newStatus);
      if (res.success) {
        // Update local list state
        setStudents((prev) =>
          prev.map((s) =>
            s.uid === student.uid
              ? { ...s, status: newStatus, accountStatus: newStatus, updatedAt: new Date().toISOString() }
              : s
          )
        );

        if (selectedStudent && selectedStudent.uid === student.uid) {
          setSelectedStudent((prev) =>
            prev ? { ...prev, status: newStatus, accountStatus: newStatus } : null
          );
        }
      } else {
        alert(res.error || 'Failed to update account status');
      }
    } catch (err: any) {
      alert(err?.message || 'Error updating status');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleAcademicPlacementSaved = (updatedStudent: StudentProfile) => {
    setStudents((prev) =>
      prev.map((s) => (s.uid === updatedStudent.uid ? { ...s, ...updatedStudent } : s))
    );
    if (selectedStudent && selectedStudent.uid === updatedStudent.uid) {
      setSelectedStudent(updatedStudent);
    }
  };

  const hasActiveFilters =
    debouncedSearch.trim() !== '' ||
    statusFilter !== 'ALL' ||
    universityFilter !== 'ALL' ||
    yearFilter !== 'ALL';

  // Count active / inactive in current result set or total
  const activeCount = students.filter(
    (s) => (s.status || s.accountStatus || 'active') === 'active'
  ).length;
  const inactiveCount = students.filter(
    (s) => (s.status || s.accountStatus) === 'inactive'
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Users className="h-3.5 w-3.5" />
              <span>VENUE Platform Foundation • User Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Student Directory & User Accounts
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Super Admin management of registered student profiles, academic institutional
              enrollments, and active account status across VENUE.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={loading || isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh List'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Total Registered Students:</span>
            <strong className="text-white font-bold">{totalStudents}</strong>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active in View:</span>
            <strong className="text-emerald-200 font-bold">{activeCount}</strong>
          </div>

          {inactiveCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Inactive in View:</span>
              <strong className="text-rose-200 font-bold">{inactiveCount}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Debounced Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by full name, email, reg number, university, or programme..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Account Status Filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-status" className="text-xs text-slate-400 whitespace-nowrap">
                Status:
              </label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 py-2 px-3 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* University Filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-uni" className="text-xs text-slate-400 whitespace-nowrap">
                University:
              </label>
              <select
                id="filter-uni"
                value={universityFilter}
                onChange={(e) => {
                  setUniversityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 py-2 px-3 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Universities</option>
                <option value="udsm">UDSM</option>
              </select>
            </div>

            {/* Year of Study Filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-year" className="text-xs text-slate-400 whitespace-nowrap">
                Year:
              </label>
              <select
                id="filter-year"
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 py-2 px-3 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Years</option>
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
                <option value="Year 5">Year 5</option>
              </select>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Loading skeleton */
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="h-5 w-48 bg-slate-800 rounded animate-pulse" />
            <div className="h-5 w-24 bg-slate-800 rounded animate-pulse" />
          </div>
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/30 border border-slate-800 animate-pulse gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-800 rounded" />
                  <div className="h-3 w-48 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-4 w-28 bg-slate-800 rounded hidden md:block" />
              <div className="h-6 w-20 bg-slate-800 rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="p-8 rounded-3xl border border-rose-500/20 bg-slate-900/60 backdrop-blur-md text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Error Loading Students</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={fetchStudents}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </button>
        </div>
      ) : students.length === 0 ? (
        /* Empty / Search no results state */
        <div className="p-10 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {hasActiveFilters ? 'No Students Matching Filter' : 'No Students Registered Yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try broadening your search term or clearing the active status/university filters.'
                : 'Registered student user profiles will appear here automatically when accounts are linked.'}
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Search & Filters</span>
            </button>
          )}
        </div>
      ) : (
        /* Results Table (Desktop) & Cards (Mobile) */
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-md">
          {/* Table for md+ screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Student Details</th>
                  <th className="py-4 px-4">Contact</th>
                  <th className="py-4 px-4">University & Programme</th>
                  <th className="py-4 px-4">Year of Study</th>
                  <th className="py-4 px-4 text-center">Account Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {students.map((student) => {
                  const studentStatus = student.status || student.accountStatus || 'active';
                  const studentName = student.name || student.fullName || 'Student User';
                  const avatar = student.profilePhoto || student.photoURL || student.avatar;

                  return (
                    <tr
                      key={student.uid || student.email}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={studentName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-sm">
                              {studentName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <span className="font-semibold text-white group-hover:text-indigo-300 transition flex items-center gap-1.5">
                              {studentName}
                            </span>
                            {student.registrationNumber ? (
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Hash className="w-3 h-3 text-indigo-400" />
                                {student.registrationNumber}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">No reg number</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]" title={student.email}>
                            {student.email || '—'}
                          </span>
                        </div>
                      </td>

                      {/* University & Programme */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-200 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                            <span className="truncate max-w-[200px]" title={student.programme || student.programmeName}>
                              {student.programme || student.programmeName || 'General Academic'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            <span>{student.universityShort || student.university || 'UDSM'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Year & Semester */}
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700/60">
                          {[student.yearOfStudy, student.semester].filter(Boolean).join(' • ') || 'Year 1'}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            studentStatus === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {studentStatus === 'active' ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          )}
                          <span className="capitalize">{studentStatus}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetail(student)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                            title="View student profile details"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() =>
                              handleToggleStatus(
                                student,
                                studentStatus === 'active' ? 'inactive' : 'active'
                              )
                            }
                            disabled={updatingUid === student.uid}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                              studentStatus === 'active'
                                ? 'text-rose-400 hover:bg-rose-500/10 border border-rose-500/20'
                                : 'text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20'
                            } disabled:opacity-50`}
                            title={
                              studentStatus === 'active'
                                ? 'Deactivate Account'
                                : 'Activate Account'
                            }
                          >
                            {updatingUid === student.uid ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : studentStatus === 'active' ? (
                              <span>Deactivate</span>
                            ) : (
                              <span>Activate</span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards for Mobile screens (< md) */}
          <div className="md:hidden divide-y divide-slate-800/80 p-4 space-y-4">
            {students.map((student) => {
              const studentStatus = student.status || student.accountStatus || 'active';
              const studentName = student.name || student.fullName || 'Student User';
              const avatar = student.profilePhoto || student.photoURL || student.avatar;

              return (
                <div
                  key={student.uid || student.email}
                  className="pt-4 first:pt-0 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={studentName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-base">
                          {studentName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white text-sm">{studentName}</h4>
                        <p className="text-xs text-slate-400">{student.email}</p>
                        {student.registrationNumber && (
                          <span className="text-[11px] text-indigo-400 font-mono">
                            {student.registrationNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        studentStatus === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {studentStatus}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/50 text-xs text-slate-300 space-y-1">
                    <p className="font-medium text-white truncate">
                      {student.programme || student.programmeName || 'General Academic'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {student.universityShort || student.university || 'UDSM'} •{' '}
                      {[student.yearOfStudy, student.semester].filter(Boolean).join(' • ') || 'Year 1'}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleOpenDetail(student)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          student,
                          studentStatus === 'active' ? 'inactive' : 'active'
                        )
                      }
                      disabled={updatingUid === student.uid}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        studentStatus === 'active'
                          ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                          : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                      } disabled:opacity-50`}
                    >
                      {updatingUid === student.uid
                        ? 'Updating...'
                        : studentStatus === 'active'
                        ? 'Deactivate'
                        : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scalable Pagination Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>
                Showing{' '}
                <strong className="text-white">
                  {totalStudents > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                </strong>{' '}
                to{' '}
                <strong className="text-white">
                  {Math.min(currentPage * pageSize, totalStudents)}
                </strong>{' '}
                of <strong className="text-white">{totalStudents}</strong> students
              </span>

              <span className="text-slate-600 hidden sm:inline">•</span>

              <div className="hidden sm:flex items-center gap-1.5">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg bg-slate-800 border border-slate-700 text-slate-200 py-1 px-2 text-xs"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <span className="px-3 py-1 font-semibold text-slate-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onStatusToggle={handleToggleStatus}
        isUpdatingStatus={updatingUid === selectedStudent?.uid}
        onAcademicPlacementSaved={handleAcademicPlacementSaved}
      />
    </div>
  );
};
