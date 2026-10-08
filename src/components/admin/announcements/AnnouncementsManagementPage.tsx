import React, { useState, useEffect, useCallback } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit2,
  Archive,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  Target,
  Users,
  X,
} from 'lucide-react';
import {
  AnnouncementRecord,
  AnnouncementType,
  AnnouncementStatus,
  AnnouncementFilterOptions,
} from '../../../types';
import {
  announcementsService,
  AnnouncementFormData,
  ANNOUNCEMENT_TYPES,
} from '../../../services/announcementsService';
import { AnnouncementFormModal } from './AnnouncementFormModal';
import { AnnouncementDetailModal } from './AnnouncementDetailModal';
import { ConfirmActionModal } from './ConfirmActionModal';

export const AnnouncementsManagementPage: React.FC = () => {
  // Data State
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    targeted: number;
    everyone: number;
  }>({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    targeted: 0,
    everyone: 0,
  });

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AnnouncementStatus | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<AnnouncementType | 'ALL'>('ALL');
  const [selectedAudience, setSelectedAudience] = useState<'ALL' | 'everyone' | 'targeted'>('ALL');

  // Modals & Action State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementRecord | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<AnnouncementRecord | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'archive' | 'delete';
    target: AnnouncementRecord | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    action: 'archive',
    target: null,
    isLoading: false,
  });

  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ type, message });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load announcements list with filters & pagination
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: AnnouncementFilterOptions = {
        search: debouncedSearch,
        status: selectedStatus,
        type: selectedType,
        audience: selectedAudience,
      };

      const [res, statsRes] = await Promise.all([
        announcementsService.getAdminAnnouncements(filters, page, pageSize),
        announcementsService.getStats(),
      ]);

      setAnnouncements(res.announcements);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setStats(statsRes);
    } catch (err: any) {
      console.error('Failed to load announcements:', err);
      showToast(err?.message || 'Failed to load announcements', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedStatus, selectedType, selectedAudience, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleOpenCreate = () => {
    setSelectedAnnouncement(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (announcement: AnnouncementRecord) => {
    setSelectedAnnouncement(announcement);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleOpenDetail = (announcement: AnnouncementRecord) => {
    setViewingAnnouncement(announcement);
    setIsDetailOpen(true);
  };

  const handleFormSubmit = async (formData: AnnouncementFormData) => {
    try {
      if (formMode === 'create') {
        const created = await announcementsService.createAnnouncement(formData);
        showToast(
          created.status === 'Published'
            ? 'Announcement successfully published to student & lecturer feeds.'
            : 'Announcement draft successfully saved.',
          'success'
        );
      } else if (selectedAnnouncement) {
        await announcementsService.updateAnnouncement(selectedAnnouncement.id, formData);
        showToast('Announcement successfully updated.', 'success');
      }
      loadData();
    } catch (err: any) {
      throw err;
    }
  };

  const handleOpenArchiveModal = (announcement: AnnouncementRecord) => {
    setConfirmModal({
      isOpen: true,
      action: 'archive',
      target: announcement,
      isLoading: false,
    });
  };

  const handleOpenDeleteModal = (announcement: AnnouncementRecord) => {
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      target: announcement,
      isLoading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.target) return;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));

    try {
      if (confirmModal.action === 'archive') {
        await announcementsService.archiveAnnouncement(confirmModal.target.id);
        showToast('Announcement successfully archived. Hidden from active feeds.', 'success');
      } else {
        await announcementsService.deleteDraftAnnouncement(confirmModal.target.id);
        showToast('Draft announcement permanently removed.', 'success');
      }
      setConfirmModal({ isOpen: false, action: 'archive', target: null, isLoading: false });
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Action failed. Please try again.', 'error');
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const getTypeBadgeStyle = (type: AnnouncementType) => {
    switch (type) {
      case 'Academic':
        return 'bg-blue-500/10 text-sky-400 border-blue-500/30';
      case 'Important':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Event':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Maintenance':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: AnnouncementStatus) => {
    switch (status) {
      case 'Published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Published</span>
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Draft</span>
          </span>
        );
      case 'Archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Archive className="w-3 h-3" />
            <span>Archived</span>
          </span>
        );
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 backdrop-blur-md transition-all ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-medium">{feedbackToast.message}</span>
          <button
            onClick={() => setFeedbackToast(null)}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Announcements Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Publish universal campus notices or target specific degree cohorts, departments, and academic units.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
            title="Refresh announcements list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="btn-create-announcement"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Announcement</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Overview Cards (Stage 7A + 7B) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Total Notices
          </span>
          <p className="text-xl sm:text-2xl font-bold text-white">{stats.total}</p>
          <span className="text-[10px] text-slate-500">All announcements</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Published
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.published}</p>
          <span className="text-[10px] text-slate-500">Active in feeds</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Drafts
          </span>
          <p className="text-xl sm:text-2xl font-bold text-amber-400">{stats.draft}</p>
          <span className="text-[10px] text-slate-500">Admin-only review</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5 text-slate-400" />
            Archived
          </span>
          <p className="text-xl sm:text-2xl font-bold text-slate-300">{stats.archived}</p>
          <span className="text-[10px] text-slate-500">Historical archive</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-indigo-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            Targeted
          </span>
          <p className="text-xl sm:text-2xl font-bold text-indigo-400">{stats.targeted}</p>
          <span className="text-[10px] text-slate-500">Faculty/Cohort scoped</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            Universal
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.everyone}</p>
          <span className="text-[10px] text-slate-500">Campus-wide audience</span>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, body, author, or programme..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Audience Filter (Stage 7B) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Audience:</span>
            <select
              value={selectedAudience}
              onChange={(e) => {
                setSelectedAudience(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="ALL">All Audiences</option>
              <option value="everyone">Universal (Everyone)</option>
              <option value="targeted">Targeted Cohorts</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="ALL">All Statuses ({stats.total})</option>
              <option value="Published">Published ({stats.published})</option>
              <option value="Draft">Draft ({stats.draft})</option>
              <option value="Archived">Archived ({stats.archived})</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="ALL">All Types</option>
              {ANNOUNCEMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedStatus !== 'ALL' || selectedType !== 'ALL' || selectedAudience !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedStatus('ALL');
                setSelectedType('ALL');
                setSelectedAudience('ALL');
                setSearchQuery('');
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Announcements Table / List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading announcements from Firestore...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No announcements found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {searchQuery || selectedStatus !== 'ALL' || selectedType !== 'ALL' || selectedAudience !== 'ALL'
                ? 'No announcements match your search criteria. Try adjusting or clearing filters.'
                : 'No announcements have been published yet. Click "Create Announcement" to post your first campus memo.'}
            </p>
            {!(searchQuery || selectedStatus !== 'ALL' || selectedType !== 'ALL' || selectedAudience !== 'ALL') && (
              <button
                onClick={handleOpenCreate}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Announcement</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Announcement Title & Summary</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Audience Scope</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Author</th>
                  <th className="py-3.5 px-3">Published Date</th>
                  <th className="py-3.5 px-3">Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {announcements.map((item) => {
                  const isTargeted = item.audienceType === 'targeted';
                  const targetLabel =
                    item.targetProgrammeName ||
                    item.targetDepartmentName ||
                    item.targetAcademicUnitName ||
                    (item.targetUniversityName ? `${item.targetUniversityName}` : 'Targeted Cohort');

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-default"
                    >
                      {/* Title & Summary */}
                      <td className="py-3.5 px-4 sm:px-6 max-w-sm">
                        <div className="space-y-1">
                          <button
                            onClick={() => handleOpenDetail(item)}
                            className="font-bold text-white hover:text-indigo-400 transition text-left cursor-pointer line-clamp-1"
                          >
                            {item.title}
                          </button>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {item.summary || item.content.slice(0, 100)}
                          </p>
                        </div>
                      </td>

                      {/* Category Type */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getTypeBadgeStyle(
                            item.type
                          )}`}
                        >
                          {item.type}
                        </span>
                      </td>

                      {/* Audience Scope (Stage 7B) */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isTargeted ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              <Target className="w-2.5 h-2.5" />
                              <span>Targeted</span>
                            </span>
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]" title={targetLabel}>
                              {targetLabel}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Users className="w-2.5 h-2.5" />
                            <span>Everyone</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-[11px] text-slate-200 font-medium">
                          {item.createdByName || item.createdBy.slice(0, 8)}
                        </div>
                      </td>

                      {/* Published Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                        {formatDate(item.publishedAt)}
                      </td>

                      {/* Updated Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                        {formatDate(item.updatedAt || item.createdAt)}
                      </td>

                      {/* Actions Menu */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Preview */}
                          <button
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            title="View Announcement Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition cursor-pointer"
                            title="Edit Announcement"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Archive (for published or drafts) */}
                          {item.status !== 'Archived' && (
                            <button
                              onClick={() => handleOpenArchiveModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                              title="Archive Announcement (Retains audit record)"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Safe Delete for un-published drafts only */}
                          {item.status === 'Draft' && !item.publishedAt && (
                            <button
                              onClick={() => handleOpenDeleteModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                              title="Delete Draft (Permitted for un-published drafts only)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {total > 0 && (
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-[11px] text-slate-500">
                Showing {Math.min((page - 1) * pageSize + 1, total)} -{' '}
                {Math.min(page * pageSize, total)} of {total} announcements
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="mr-2 text-[11px]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Announcement Create / Edit Modal */}
      <AnnouncementFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedAnnouncement}
        mode={formMode}
      />

      {/* Announcement Detail Preview Modal */}
      <AnnouncementDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        announcement={viewingAnnouncement}
        onEdit={(ann) => {
          setSelectedAnnouncement(ann);
          setFormMode('edit');
          setIsFormOpen(true);
        }}
      />

      {/* Confirmation Modal for Destructive / Life-cycle actions */}
      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={
          confirmModal.action === 'archive'
            ? 'Archive Announcement'
            : 'Permanently Delete Draft Announcement'
        }
        description={
          confirmModal.action === 'archive'
            ? `Are you sure you want to archive "${confirmModal.target?.title}"? This announcement will be immediately hidden from active student and lecturer feeds, but retained for institutional records.`
            : `Are you sure you want to permanently delete draft "${confirmModal.target?.title}"? This draft has never been published and this action cannot be undone.`
        }
        confirmText={confirmModal.action === 'archive' ? 'Archive Announcement' : 'Delete Draft'}
        actionType={confirmModal.action}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
};
