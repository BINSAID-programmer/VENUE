import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  User,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  GraduationCap,
  Building2,
  Layers,
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
  BadgeCheck,
  Shield,
  LogOut,
  ArrowLeft,
  X,
  Camera,
  Copy,
  Download,
  KeyRound,
  Eye,
  Megaphone,
  ChevronRight,
  ShieldCheck,
  Target,
  Users,
  CheckCheck,
} from 'lucide-react';
import {
  LecturerRecord,
  LecturerCourseAssignment,
  AcademicMaterialRecord,
  AcademicMaterialType,
  AnnouncementRecord,
  AnnouncementType,
  UserTargetingContext,
} from '../../types';
import { lecturerAuthService } from '../../services/lecturerAuthService';
import { lecturerCourseService } from '../../services/lecturerCourseService';
import { lecturerMaterialsService } from '../../services/lecturerMaterialsService';
import { announcementsService } from '../../services/announcementsService';
import { UserAnnouncementModal } from '../common/UserAnnouncementModal';
import { MATERIAL_TYPES } from '../../services/adminMaterialsService';
import { auth, logoutUser } from '../../services/firebase';
import { UploadMaterialModal } from './UploadMaterialModal';
import { EditLecturerMaterialModal } from './EditLecturerMaterialModal';

type LecturerTabId = 'dashboard' | 'courses' | 'materials' | 'announcements' | 'profile';

interface LecturerWorkspaceProps {
  onBackToApp?: () => void;
  onLogout?: () => void;
}

export const LecturerWorkspace: React.FC<LecturerWorkspaceProps> = ({
  onBackToApp,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab Navigation State (Requirement 1)
  const [activeTab, setActiveTab] = useState<LecturerTabId>('dashboard');

  // Auth & Lecturer State
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [lecturer, setLecturer] = useState<LecturerRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assigned Courses State (Requirement 2)
  const [assignedCourses, setAssignedCourses] = useState<LecturerCourseAssignment[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Lecturer Materials State (Requirement 8)
  const [materials, setMaterials] = useState<AcademicMaterialRecord[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState<AcademicMaterialType | 'ALL'>('ALL');
  const [filterCourseId, setFilterCourseId] = useState<string>('ALL');

  // Modals & Action States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadPreselectedCourseId, setUploadPreselectedCourseId] = useState<string | undefined>(undefined);
  const [editingMaterial, setEditingMaterial] = useState<AcademicMaterialRecord | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<AcademicMaterialRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Profile Edit State (Stage 5B)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editOffice, setEditOffice] = useState('');
  const [editBio, setEditBio] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  // Announcements State (Stage 7A + 7B)
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(false);
  const [announcementSearch, setAnnouncementSearch] = useState<string>('');
  const [announcementTypeFilter, setAnnouncementTypeFilter] = useState<AnnouncementType | 'ALL'>('ALL');
  const [announcementReadFilter, setAnnouncementReadFilter] = useState<'all' | 'unread'>('all');
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<Set<string>>(new Set());
  const [viewingAnnouncement, setViewingAnnouncement] = useState<AnnouncementRecord | null>(null);

  const loadPublishedAnnouncements = async (targetLecturer?: LecturerRecord | null) => {
    try {
      setLoadingAnnouncements(true);
      const activeLec = targetLecturer !== undefined ? targetLecturer : lecturer;
      const userContext: UserTargetingContext = {
        userId: auth.currentUser?.uid,
        role: 'lecturer',
        universityId: activeLec?.universityId,
        academicUnitId: activeLec?.academicUnitId,
        departmentId: activeLec?.departmentId,
      };

      const [items, userReads] = await Promise.all([
        announcementsService.getPublishedAnnouncements(40, undefined, undefined, userContext),
        auth.currentUser?.uid
          ? announcementsService.getUserReadIds(auth.currentUser.uid)
          : Promise.resolve(new Set<string>()),
      ]);

      setAnnouncements(items);
      setReadAnnouncementIds(new Set(userReads));
    } catch (err) {
      console.warn('Failed to load published announcements for lecturer:', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleAnnouncementRead = (id: string) => {
    setReadAnnouncementIds((prev) => new Set([...prev, id]));
  };

  const handleMarkAllAnnouncementsRead = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const allIds = announcements.map((a) => a.id);
    await announcementsService.markAllAsRead(allIds, uid);
    setReadAnnouncementIds(new Set(allIds));
  };

  useEffect(() => {
    loadPublishedAnnouncements();
  }, [lecturer?.universityId, lecturer?.academicUnitId, lecturer?.departmentId]);

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load lecturer record & initial data
  const loadWorkspaceData = async (uid: string, force = false) => {
    if (!force) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const record = await lecturerAuthService.getLecturerByUid(uid, force);
      setLecturer(record);

      if (record) {
        setEditFullName(record.fullName);
        setEditTitle(record.title || '');
        setEditPhone(record.phone || '');
        setEditOffice(record.office || '');
        setEditBio(record.bio || '');

        // Fetch assigned courses
        setLoadingCourses(true);
        try {
          const courses = await lecturerCourseService.getAssignmentsByLecturer(record.id, force);
          setAssignedCourses(courses);
        } catch (cErr) {
          console.warn('Error loading courses:', cErr);
        } finally {
          setLoadingCourses(false);
        }

        // Fetch lecturer uploaded materials
        setLoadingMaterials(true);
        try {
          const mats = await lecturerMaterialsService.getLecturerMaterials(uid, record.id);
          setMaterials(mats);
        } catch (mErr) {
          console.warn('Error loading materials:', mErr);
        } finally {
          setLoadingMaterials(false);
        }
      }
    } catch (err: any) {
      console.error('Error loading lecturer workspace data:', err);
      setError(err?.message || 'Failed to load faculty portal data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        loadWorkspaceData(user.uid);
      } else {
        setLecturer(null);
        setAssignedCourses([]);
        setMaterials([]);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (filterType !== 'ALL' && m.materialType !== filterType) return false;
      if (filterCourseId !== 'ALL' && m.courseId !== filterCourseId && m.courseCode !== filterCourseId) return false;
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.trim().toLowerCase();
        const matchesTitle = m.title?.toLowerCase().includes(query);
        const matchesDesc = m.description?.toLowerCase().includes(query);
        const matchesCode = m.courseCode?.toLowerCase().includes(query);
        const matchesCourseTitle = m.courseTitle?.toLowerCase().includes(query);
        const matchesFile = m.fileName?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesCode || matchesCourseTitle || matchesFile;
      }
      return true;
    });
  }, [materials, filterType, filterCourseId, debouncedSearch]);

  // Handle Material Deletion (Requirement 10)
  const handleDeleteMaterial = async () => {
    if (!deletingMaterial || !currentUser) return;

    setDeleting(true);
    try {
      await lecturerMaterialsService.deleteMaterial(deletingMaterial.id, currentUser.uid);
      setMaterials((prev) => prev.filter((m) => m.id !== deletingMaterial.id));
      showNotification(`"${deletingMaterial.title}" deleted successfully.`);
      setDeletingMaterial(null);
      if (lecturer) {
        const refreshed = await lecturerMaterialsService.getLecturerMaterials(currentUser.uid, lecturer.id);
        setMaterials(refreshed);
      }
    } catch (err: any) {
      console.error('Error deleting material:', err);
      showNotification(err?.message || 'Failed to delete material.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Handle Profile Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lecturer) return;

    setUploadingPhoto(true);
    try {
      const url = await lecturerAuthService.uploadProfilePhoto(file, lecturer.id);
      setLecturer((prev) => (prev ? { ...prev, photoURL: url } : null));
      showNotification('Profile photo updated successfully!');
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      showNotification(err?.message || 'Failed to upload photo.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecturer) return;

    setSavingProfile(true);
    try {
      const updated = await lecturerAuthService.updatePermittedProfile(lecturer.id, {
        fullName: editFullName.trim(),
        title: editTitle.trim(),
        phone: editPhone.trim(),
        office: editOffice.trim(),
        bio: editBio.trim(),
      });
      setLecturer(updated);
      setIsEditingProfile(false);
      showNotification('Profile information updated successfully.');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showNotification(err?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleLogoutClick = async () => {
    lecturerAuthService.clearCache();
    lecturerCourseService.clearCache();
    await logoutUser();
    if (onLogout) onLogout();
  };

  const openUploadModalForCourse = (courseId?: string) => {
    setUploadPreselectedCourseId(courseId);
    setIsUploadModalOpen(true);
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-white">Loading Faculty Workspace</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Validating lecturer credentials and syllabus access in VENUE catalogue...
        </p>
      </div>
    );
  }

  // Not Linked State
  if (!lecturer) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Faculty Record Not Linked</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your authenticated user account is not currently linked to an official faculty record in the VENUE catalogue.
          </p>
          <button
            onClick={onBackToApp}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Return to Student Campus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. Top Workspace Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Faculty Identification */}
          <div className="flex items-center gap-3 min-w-0">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Return to Student Portal"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-rose-600/20 shrink-0">
              L
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm truncate">
                  {lecturer.title ? `${lecturer.title} ` : ''}{lecturer.fullName}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                  <BadgeCheck className="w-3 h-3" /> Faculty
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {lecturer.departmentName || lecturer.departmentId} • {lecturer.universityName || 'UDSM'}
              </p>
            </div>
          </div>

          {/* Quick Action & Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openUploadModalForCourse()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Material</span>
              <span className="sm:hidden">Upload</span>
            </button>

            <button
              onClick={() => loadWorkspaceData(currentUser?.uid || '', true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Workspace"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-rose-400' : ''}`} />
            </button>

            <button
              onClick={handleLogoutClick}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* 2. Workspace Navigation Tabs (Requirement 1: Dashboard, My Courses, My Materials, Profile) */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-slate-800/60 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Courses</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'courses' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
              {assignedCourses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Materials</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'materials' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
              {materials.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Faculty Profile</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-18 right-4 z-50 animate-fade-in">
          <div
            className={`p-3.5 rounded-2xl border shadow-xl flex items-center gap-2.5 text-xs font-semibold ${
              notification.type === 'error'
                ? 'bg-rose-950 border-rose-800 text-rose-200'
                : 'bg-emerald-950 border-emerald-800 text-emerald-200'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20">
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Faculty Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Faculty Workspace
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Welcome back, {lecturer.title ? `${lecturer.title} ` : ''}{lecturer.fullName}
                </h1>
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                  Manage your assigned courses, upload lecture notes, handouts, past papers and slides, and review institutional materials visible to your enrolled students.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => openUploadModalForCourse()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Material</span>
                </button>
              </div>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Stat 1: Assigned Courses */}
              <div
                onClick={() => setActiveTab('courses')}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Assigned Courses</span>
                  <BookOpen className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {assignedCourses.length}
                </p>
                <p className="text-[11px] text-slate-500">Official teaching allocations</p>
              </div>

              {/* Stat 2: Uploaded Materials */}
              <div
                onClick={() => setActiveTab('materials')}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">My Materials</span>
                  <FileText className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {materials.length}
                </p>
                <p className="text-[11px] text-slate-500">Uploaded documents & slides</p>
              </div>

              {/* Stat 3: Department Affiliation */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Department</span>
                  <Building className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {lecturer.departmentName || lecturer.departmentId}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {lecturer.academicUnitName || lecturer.academicUnitId}
                </p>
              </div>

              {/* Stat 4: Verification Status */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Accreditation</span>
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Verified Faculty
                </p>
                <p className="text-[11px] text-slate-500">Institutional catalogue active</p>
              </div>
            </div>

            {/* Two-Column Grid: Quick Courses & Recent Materials */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Assigned Courses Quick View */}
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-rose-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      My Assigned Courses ({assignedCourses.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="text-xs text-rose-400 hover:text-white transition-colors cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                {assignedCourses.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                    <p>No courses currently assigned.</p>
                    <p className="text-[11px] text-slate-600">Contact your department administrator to allocate courses.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {assignedCourses.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
                              {c.courseCode}
                            </span>
                            <span className="font-bold text-xs text-white truncate">
                              {c.courseTitle}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {c.programmeName || 'General Teaching'} • Year {c.yearOfStudy || 1} • Semester {c.semester || 1}
                          </p>
                        </div>

                        <button
                          onClick={() => openUploadModalForCourse(c.courseId)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Recent Uploaded Materials */}
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Recent Materials ({materials.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('materials')}
                    className="text-xs text-sky-400 hover:text-white transition-colors cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                {materials.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                    <p>No materials uploaded yet.</p>
                    <button
                      onClick={() => openUploadModalForCourse()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload First Document</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {materials.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/25">
                              {m.courseCode}
                            </span>
                            <span className="font-bold text-xs text-white truncate max-w-[200px]">
                              {m.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {m.materialType} • {m.fileSize} • {new Date(m.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {m.fileUrl && (
                          <a
                            href={m.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors shrink-0"
                            title="Open Document"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY COURSES (Requirement 2) */}
        {/* ========================================================================= */}
        {activeTab === 'courses' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">My Assigned Courses</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Academic course assignments officially designated to you in the VENUE catalogue.
                </p>
              </div>

              <div className="text-xs text-slate-500">
                <span>Total Courses: </span>
                <strong className="text-white font-mono">{assignedCourses.length}</strong>
              </div>
            </div>

            {loadingCourses ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                <span>Loading assigned course allocations...</span>
              </div>
            ) : assignedCourses.length === 0 ? (
              <div className="py-16 px-4 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">No Assigned Courses</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  You currently have no course allocations. Course teaching responsibilities are designated by authorized institutional administrators or department moderators.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/25">
                            {c.courseCode}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                            {c.credits} Credits
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                            Active
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white leading-snug">
                          {c.courseTitle}
                        </h3>
                      </div>
                    </div>

                    {/* Teaching Context Breakdown (Requirement 2 & 5) */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/70 space-y-1.5 text-xs text-slate-400">
                      {c.programmeName && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-semibold truncate">{c.programmeName}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 pt-0.5">
                        <span>
                          {c.yearOfStudy && c.semester
                            ? `Year ${c.yearOfStudy} • Semester ${c.semester}`
                            : 'General Curriculum Placement'}
                        </span>
                        {c.departmentName && (
                          <span className="text-slate-400 truncate max-w-[180px]">
                            {c.departmentName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Course Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                      <button
                        onClick={() => {
                          setFilterCourseId(c.courseCode);
                          setActiveTab('materials');
                        }}
                        className="text-xs text-sky-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Materials</span>
                      </button>

                      <button
                        onClick={() => openUploadModalForCourse(c.courseId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/25 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Material</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MY MATERIALS (Requirements 8, 9, 10) */}
        {/* ========================================================================= */}
        {activeTab === 'materials' && (
          <div className="space-y-5">
            {/* Header with Title and Upload Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">My Uploaded Materials</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Academic resources, lecture notes, slides, and past papers uploaded by you.
                </p>
              </div>

              <button
                onClick={() => openUploadModalForCourse()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Material</span>
              </button>
            </div>

            {/* Search & Filter Controls (Requirement 8) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search Box */}
              <div className="relative sm:col-span-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search materials by title or code..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              {/* Filter by Material Type */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                >
                  <option value="ALL">All Material Types</option>
                  {MATERIAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Assigned Course */}
              <div>
                <select
                  value={filterCourseId}
                  onChange={(e) => setFilterCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                >
                  <option value="ALL">All Assigned Courses</option>
                  {assignedCourses.map((c) => (
                    <option key={c.id} value={c.courseCode}>
                      {c.courseCode} — {c.courseTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Materials Content List */}
            {loadingMaterials ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                <span>Loading your uploaded materials...</span>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="py-16 px-4 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  {materials.length === 0 ? 'No Materials Uploaded' : 'No Matching Materials'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  {materials.length === 0
                    ? 'Upload lecture notes, assignment solutions, tutorial sheets, or past examination papers for your assigned courses.'
                    : 'No documents match your current filter or search criteria.'}
                </p>
                {materials.length === 0 ? (
                  <button
                    onClick={() => openUploadModalForCourse()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload First Material</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('ALL');
                      setFilterCourseId('ALL');
                    }}
                    className="text-xs text-rose-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Desktop & Tablet Table */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Title & Description</th>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">File Details</th>
                        <th className="py-3 px-4">Uploaded</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredMaterials.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-800/40 transition-colors group">
                          {/* Title */}
                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{m.title}</p>
                            {m.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                                {m.description}
                              </p>
                            )}
                          </td>

                          {/* Course */}
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-rose-400 text-xs">
                              {m.courseCode}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                              {m.courseTitle}
                            </span>
                          </td>

                          {/* Material Type */}
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700">
                              {m.materialType}
                            </span>
                          </td>

                          {/* File Details */}
                          <td className="py-3 px-4">
                            <p className="font-mono text-[11px] text-slate-300 truncate max-w-[140px]">
                              {m.fileName}
                            </p>
                            <p className="text-[10px] text-slate-500">{m.fileSize}</p>
                          </td>

                          {/* Upload Date */}
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                              Active
                            </span>
                          </td>

                          {/* Actions (View, Edit, Delete) */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {m.fileUrl && (
                                <a
                                  href={m.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                                  title="Download / View File"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              <button
                                onClick={() => setEditingMaterial(m)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit Material Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setDeletingMaterial(m)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete Material"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="sm:hidden space-y-3">
                  {filteredMaterials.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
                              {m.courseCode}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                              {m.materialType}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-white">{m.title}</h4>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          Active
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                        <span className="font-mono truncate max-w-[200px]">{m.fileName}</span>
                        <span>{m.fileSize}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                        <span className="text-[11px] text-slate-500">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-2">
                          {m.fileUrl && (
                            <a
                              href={m.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-800 text-sky-300 text-xs font-semibold flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View</span>
                            </a>
                          )}

                          <button
                            onClick={() => setEditingMaterial(m)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingMaterial(m)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CAMPUS ANNOUNCEMENTS (Stage 7A + 7B) */}
        {/* ========================================================================= */}
        {activeTab === 'announcements' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-rose-400" />
                  <span>Institutional Announcements & Faculty Memos</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Universal campus notices and academic circulars targeted to your faculty or department.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                {announcements.some((a) => !readAnnouncementIds.has(a.id)) && (
                  <button
                    onClick={handleMarkAllAnnouncementsRead}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-rose-300 flex items-center gap-1.5 transition cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}

                <button
                  onClick={() => loadPublishedAnnouncements()}
                  disabled={loadingAnnouncements}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAnnouncements ? 'animate-spin text-rose-400' : ''}`} />
                  <span>Refresh Notices</span>
                </button>
              </div>
            </div>

            {/* Filter Controls: Search, Type Chips, and Read State Filter */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={announcementSearch}
                    onChange={(e) => setAnnouncementSearch(e.target.value)}
                    placeholder="Search announcements by keywords..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                  />
                  {announcementSearch && (
                    <button
                      onClick={() => setAnnouncementSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* All vs Unread Switcher (Stage 7B) */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setAnnouncementReadFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      announcementReadFilter === 'all'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({announcements.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementReadFilter('unread')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      announcementReadFilter === 'unread'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Unread</span>
                    {announcements.filter((a) => !readAnnouncementIds.has(a.id)).length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-[10px] text-white font-bold flex items-center justify-center">
                        {announcements.filter((a) => !readAnnouncementIds.has(a.id)).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Type Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(['ALL', 'Academic', 'Important', 'Event', 'Maintenance', 'General'] as (AnnouncementType | 'ALL')[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAnnouncementTypeFilter(t)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer ${
                      announcementTypeFilter === t
                        ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {t === 'ALL' ? 'All Categories' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Announcement Feed Cards */}
            {(() => {
              let filtered = announcements;

              // Read state filter (Stage 7B)
              if (announcementReadFilter === 'unread') {
                filtered = filtered.filter((a) => !readAnnouncementIds.has(a.id));
              }

              // Type filter
              if (announcementTypeFilter !== 'ALL') {
                filtered = filtered.filter((a) => a.type === announcementTypeFilter);
              }

              // Search query
              if (announcementSearch.trim()) {
                const q = announcementSearch.trim().toLowerCase();
                filtered = filtered.filter(
                  (a) =>
                    a.title.toLowerCase().includes(q) ||
                    a.content.toLowerCase().includes(q) ||
                    (a.summary && a.summary.toLowerCase().includes(q))
                );
              }

              if (loadingAnnouncements && announcements.length === 0) {
                return (
                  <div className="p-12 text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-rose-400 mx-auto" />
                    <p className="text-xs text-slate-400">Loading campus memos...</p>
                  </div>
                );
              }

              if (filtered.length === 0) {
                return (
                  <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                    <Megaphone className="w-6 h-6 text-slate-500 mx-auto" />
                    <h4 className="text-sm font-semibold text-slate-300">
                      {announcementReadFilter === 'unread'
                        ? 'All caught up! No unread notices.'
                        : 'No announcements match filter'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {announcementReadFilter === 'unread'
                        ? 'Switch to "All" to review earlier institutional memos.'
                        : 'Try clearing search or selecting a different notice category.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filtered.map((item) => {
                    const isRead = readAnnouncementIds.has(item.id);
                    const isImportant = item.type === 'Important' || item.priority === 'important';
                    const isTargeted = item.audienceType === 'targeted';

                    return (
                      <div
                        key={item.id}
                        onClick={() => setViewingAnnouncement(item)}
                        className={`p-4 rounded-xl border transition cursor-pointer space-y-2 relative ${
                          !isRead
                            ? 'bg-slate-900/95 border-rose-500/30 shadow-md shadow-rose-950/20'
                            : isImportant
                            ? 'bg-slate-900/90 border-rose-500/30 shadow-sm'
                            : 'bg-slate-900/70 border-slate-800 opacity-90'
                        } hover:border-slate-700 hover:bg-slate-900`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Subtle unread dot (Stage 7B) */}
                              {!isRead && (
                                <span
                                  className="w-2 h-2 rounded-full bg-rose-400 ring-4 ring-rose-500/20 animate-pulse shrink-0"
                                  title="Unread memo"
                                />
                              )}

                              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                {item.type}
                              </span>

                              {/* Audience Scope indicator (Stage 7B) */}
                              {isTargeted ? (
                                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                                  <Target className="w-2.5 h-2.5" />
                                  <span>{item.targetDepartmentName || item.targetAcademicUnitName || 'Faculty Scoped'}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                  <Users className="w-2.5 h-2.5" />
                                  <span>Universal</span>
                                </span>
                              )}

                              <span className="text-[10px] text-slate-400">
                                {item.publishedAt
                                  ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })
                                  : 'Notice'}
                              </span>

                              {/* Read State indicator (Stage 7B) */}
                              <span className="text-[10px] ml-auto">
                                {isRead ? (
                                  <span className="text-slate-500 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-slate-600" />
                                    <span>Read</span>
                                  </span>
                                ) : (
                                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    <span>New</span>
                                  </span>
                                )}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-white leading-snug hover:text-rose-400 transition">
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {item.summary || item.content}
                        </p>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-slate-500">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            {item.createdByName || 'VENUE Administration'}
                          </span>
                          <span className="text-rose-400 font-semibold hover:underline flex items-center gap-1">
                            <span>View Full Memo</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: FACULTY PROFILE (Stage 5B) */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Hero Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  {/* Photo Avatar */}
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-rose-500/20 via-orange-500/10 to-indigo-500/20 border-2 border-rose-500/30 overflow-hidden flex items-center justify-center text-rose-400 font-extrabold text-3xl shadow-lg shadow-rose-500/10">
                      {lecturer.photoURL ? (
                        <img
                          src={lecturer.photoURL}
                          alt={lecturer.fullName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{lecturer.fullName ? lecturer.fullName.charAt(0).toUpperCase() : 'L'}</span>
                      )}
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-white transition-opacity cursor-pointer border border-white/20"
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          <span className="text-[9px] font-bold mt-1 uppercase">Change</span>
                        </>
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/25">
                        {lecturer.position || 'Faculty Lecturer'}
                      </span>
                      {lecturer.staffId && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          ID: {lecturer.staffId}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                      {lecturer.title ? `${lecturer.title} ` : ''}{lecturer.fullName}
                    </h2>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{lecturer.email}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Status Concepts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  VENUE Account Status
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Active Faculty Account</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Faculty course and material permissions operational</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Institutional Verification Status
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Verified Academic Educator</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Officially accredited in institution catalogue</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <BadgeCheck className="w-4 h-4 text-emerald-400" /> Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Catalogue Placement */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  Catalogue Academic Placement
                </h3>
                <span className="text-[11px] text-slate-500">Official Institutional Registry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">University</span>
                  <p className="font-semibold text-white text-xs">{lecturer.universityName || lecturer.universityId.toUpperCase()}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Academic Unit</span>
                  <p className="font-semibold text-white text-xs">{lecturer.academicUnitName || lecturer.academicUnitId || 'N/A'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Department</span>
                  <p className="font-semibold text-white text-xs">{lecturer.departmentName || lecturer.departmentId || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Contact & UID Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact & Office</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone:</span>
                    <span className="text-white">{lecturer.phone || 'Not set'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Office:</span>
                    <span className="text-white">{lecturer.office || 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Authentication Identity</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
                    <span className="text-slate-400">Firebase UID:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sky-400 truncate max-w-[140px]">{lecturer.userId || currentUser?.uid}</span>
                      <button
                        onClick={() => handleCopyUid(lecturer.userId || currentUser?.uid || '')}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Copy UID"
                      >
                        {copiedUid ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
                    <span className="text-slate-400">Account Linked:</span>
                    <span className="font-semibold text-emerald-400">Linked to Firebase Auth</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {lecturer.bio && (
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Biography</h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{lecturer.bio}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Upload Material Modal (Requirements 3, 4, 5, 6, 7) */}
      <UploadMaterialModal
        lecturer={lecturer}
        assignedCourses={assignedCourses}
        initialSelectedCourseId={uploadPreselectedCourseId}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={async (newMat) => {
          setMaterials((prev) => {
            const withoutDup = prev.filter((m) => m.id !== newMat.id);
            return [newMat, ...withoutDup];
          });
          showNotification(`"${newMat.title}" uploaded and verified in repository!`);
          setActiveTab('materials');
          if (currentUser) {
            const refreshed = await lecturerMaterialsService.getLecturerMaterials(currentUser.uid, lecturer.id);
            setMaterials(refreshed);
          }
        }}
      />

      {/* Edit Material Modal (Requirement 9) */}
      <EditLecturerMaterialModal
        material={editingMaterial}
        isOpen={Boolean(editingMaterial)}
        onClose={() => setEditingMaterial(null)}
        onSuccess={async (updated) => {
          setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          showNotification('Material metadata updated successfully.');
          if (currentUser) {
            const refreshed = await lecturerMaterialsService.getLecturerMaterials(currentUser.uid, lecturer.id);
            setMaterials(refreshed);
          }
        }}
      />

      {/* Delete Confirmation Modal (Requirement 10) */}
      {deletingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Material</h3>
                <p className="text-xs text-slate-400">Permanently remove this document</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deletingMaterial.title}"</strong> ({deletingMaterial.courseCode})?
              This will safely remove the document metadata from Firestore and delete the file from Cloud Storage.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingMaterial(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteMaterial}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal (Stage 5B) */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-base font-bold text-white">Edit Faculty Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Title / Salutation</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Prof., Dr., Mr."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Office Location</label>
                <input
                  type="text"
                  value={editOffice}
                  onChange={(e) => setEditOffice(e.target.value)}
                  placeholder="Block B, Room 214"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Academic Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Announcement Detail Reader Modal (Stage 7A + 7B) */}
      <UserAnnouncementModal
        isOpen={Boolean(viewingAnnouncement)}
        onClose={() => setViewingAnnouncement(null)}
        announcement={viewingAnnouncement}
        onMarkAsRead={handleAnnouncementRead}
      />
    </div>
  );
};
