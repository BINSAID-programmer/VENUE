import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Building2,
  Layers,
  Building,
  Mail,
  Phone,
  Briefcase,
  BadgeCheck,
  Clock,
  AlertCircle,
  Camera,
  Edit3,
  CheckCircle2,
  Copy,
  LogOut,
  ArrowLeft,
  Shield,
  KeyRound,
  Sparkles,
  MapPin,
  FileText,
  RefreshCw,
  Loader2,
  ExternalLink,
  ChevronRight,
  Save,
  X,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { LecturerRecord, LecturerStatus, LecturerVerificationStatus, LecturerCourseAssignment } from '../../types';
import { lecturerAuthService } from '../../services/lecturerAuthService';
import { lecturerCourseService } from '../../services/lecturerCourseService';
import { auth, logoutUser } from '../../services/firebase';

interface LecturerProfileScreenProps {
  onBackToApp?: () => void;
  onLogout?: () => void;
}

export const LecturerProfileScreen: React.FC<LecturerProfileScreenProps> = ({
  onBackToApp,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth & Lecturer State
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [lecturer, setLecturer] = useState<LecturerRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Account Linking (if not yet linked to UID)
  const [inviteCode, setInviteCode] = useState('');
  const [linkingAccount, setLinkingAccount] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  // Edit Profile Modal
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editOffice, setEditOffice] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Photo Upload State
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState(false);

  // Copied states
  const [copiedUid, setCopiedUid] = useState(false);

  // Assigned Courses state (Stage 5C - Requirement 12)
  const [assignedCourses, setAssignedCourses] = useState<LecturerCourseAssignment[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        loadLecturerData(user.uid);
      } else {
        setLecturer(null);
        setAssignedCourses([]);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const loadLecturerData = async (uid: string, force = false) => {
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

        // Fetch assigned courses for this lecturer (Requirement 12)
        setLoadingCourses(true);
        try {
          const courses = await lecturerCourseService.getAssignmentsByLecturer(record.id, force);
          setAssignedCourses(courses);
        } catch (cErr) {
          console.warn('Error loading assigned courses:', cErr);
        } finally {
          setLoadingCourses(false);
        }
      } else {
        setAssignedCourses([]);
      }
    } catch (err: any) {
      console.error('Error loading lecturer profile:', err);
      setError(err?.message || 'Failed to retrieve lecturer profile.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2. Account Linking by Invitation Code
  const handleLinkInviteCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);
    setLinkSuccess(null);

    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) {
      setLinkError('Please enter your invitation code.');
      return;
    }

    if (!currentUser) {
      setLinkError('Please sign in to VENUE with your institutional Google or email account first.');
      return;
    }

    setLinkingAccount(true);
    try {
      const candidate = await lecturerAuthService.getLecturerByInviteCode(cleanCode);
      if (!candidate) {
        throw new Error('Invalid or expired invitation code. Please request a new code from your department administrator.');
      }

      // Link UID to candidate
      const linked = await lecturerAuthService.linkLecturerAccount(
        candidate.id,
        currentUser.uid,
        currentUser.email || undefined
      );

      setLecturer(linked);
      setEditFullName(linked.fullName);
      setEditTitle(linked.title || '');
      setEditPhone(linked.phone || '');
      setEditOffice(linked.office || '');
      setEditBio(linked.bio || '');
      setLinkSuccess(`Successfully connected to faculty profile: ${linked.fullName}!`);
      setInviteCode('');
    } catch (err: any) {
      console.error('Error linking lecturer invitation code:', err);
      setLinkError(err?.message || 'Could not link account with this code.');
    } finally {
      setLinkingAccount(false);
    }
  };

  // 3. Photo Upload Handler
  const handlePhotoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lecturer) return;

    setPhotoError(null);
    setPhotoSuccess(false);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Invalid image format. Supported formats: JPG, PNG, WEBP.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Photo must be smaller than 5MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const photoURL = await lecturerAuthService.uploadProfilePhoto(file, lecturer.id);
      setLecturer((prev) => (prev ? { ...prev, photoURL } : null));
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error uploading profile photo:', err);
      setPhotoError(err?.message || 'Failed to upload photo. Please try a smaller image.');
    } finally {
      setUploadingPhoto(false);
      // Reset input value so same file can be re-selected if desired
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 4. Edit Permitted Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecturer) return;

    if (!editFullName.trim()) {
      setEditError('Full name cannot be empty.');
      return;
    }

    setSavingEdit(true);
    setEditError(null);
    try {
      const updated = await lecturerAuthService.updatePermittedProfile(lecturer.id, {
        fullName: editFullName.trim(),
        title: editTitle.trim(),
        phone: editPhone.trim(),
        office: editOffice.trim(),
        bio: editBio.trim(),
      });
      setLecturer(updated);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile changes:', err);
      setEditError(err?.message || 'Failed to update profile.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleLogoutClick = async () => {
    lecturerAuthService.clearCache();
    await logoutUser();
    if (onLogout) onLogout();
  };

  // Formatting helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Not available';
    try {
      return new Date(isoString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Not available';
    }
  };

  // Render Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-white">Loading Faculty Profile</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Retrieving verified academic affiliation from VENUE catalogue...
        </p>
      </div>
    );
  }

  // State: Not Linked to a Lecturer Record
  if (!lecturer) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-6 pb-24">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-rose-600/20">
              L
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Faculty Lecturer Portal</h2>
              <p className="text-[11px] text-slate-400">VENUE Academic Management</p>
            </div>
          </div>

          {currentUser && (
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        {/* Link Account Card */}
        <div className="my-auto max-w-lg w-full mx-auto py-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/10">
              <KeyRound className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Link Lecturer Account</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Your Firebase Authentication account is currently not linked to an official faculty lecturer record in the VENUE catalogue.
            </p>
          </div>

          {/* User Auth Context */}
          {currentUser && (
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Signed-in Account
              </span>
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-mono text-slate-200">{currentUser.email}</span>
                <span className="text-[11px] text-slate-500 font-mono truncate max-w-[120px]">
                  UID: {currentUser.uid.substring(0, 8)}...
                </span>
              </div>
            </div>
          )}

          {linkError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{linkError}</span>
            </div>
          )}

          {linkSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{linkSuccess}</span>
            </div>
          )}

          {/* Invitation Code Form */}
          <form
            onSubmit={handleLinkInviteCode}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Faculty Invitation Code:
              </label>
              <input
                type="text"
                placeholder="e.g. LEC-A1B2-C3D4"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 uppercase tracking-wider"
              />
              <p className="text-[11px] text-slate-500">
                Provided by your department administrator in the VENUE Admin Dashboard.
              </p>
            </div>

            <button
              type="submit"
              disabled={linkingAccount}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {linkingAccount ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying & Linking Profile...</span>
                </>
              ) : (
                <>
                  <BadgeCheck className="w-4 h-4" />
                  <span>Connect Lecturer Profile</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Return to Student Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Status computation for separate badges
  const isActive = lecturer.status === 'active';
  const isVerified = lecturer.verificationStatus === 'verified';
  const isPending = lecturer.verificationStatus === 'pending';
  const isRejected = lecturer.verificationStatus === 'rejected';

  const initialLetter = lecturer.fullName ? lecturer.fullName.charAt(0).toUpperCase() : 'L';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-6 pb-28">
      {/* Hidden File Input for Profile Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoFileSelected}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Return to Student Portal"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 uppercase tracking-wider">
                Faculty Portal
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Lecturer Profile</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {lecturer.title ? `${lecturer.title} ` : ''}
              {lecturer.fullName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadLecturerData(currentUser?.uid || '', true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Profile"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Profile Content */}
      <div className="max-w-4xl w-full mx-auto mt-6 space-y-6">
        {/* Photo Upload Banners */}
        {photoError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{photoError}</span>
            </div>
            <button onClick={() => setPhotoError(null)} className="text-rose-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {photoSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-xs text-emerald-300 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile photo updated successfully in Firebase Storage!</span>
          </div>
        )}

        {/* 1. Hero Profile Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              {/* Profile Photo Avatar with Upload Overlay */}
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
                    <span>{initialLetter}</span>
                  )}
                </div>

                {/* Upload overlay button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-white transition-opacity cursor-pointer border border-white/20"
                  title="Upload / Change Photo"
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

                {/* Mobile Camera Badge */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="sm:hidden absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-md cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Identity & Rank */}
              <div className="space-y-1.5 min-w-0">
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
                  {lecturer.title ? `${lecturer.title} ` : ''}
                  {lecturer.fullName}
                </h2>

                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{lecturer.email}</span>
                </p>
              </div>
            </div>

            {/* Quick Edit Button */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Separate Concept Badges: Account Status & Verification Status (Requirement 7) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Concept A: Account Status (Active / Inactive) */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              VENUE Account Status
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">
                  {isActive ? 'Account Active' : 'Account Inactive'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isActive
                    ? 'Faculty privileges and course authority operational'
                    : 'Account access currently paused by administrator'}
                </p>
              </div>

              {isActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Inactive
                </span>
              )}
            </div>
          </div>

          {/* Concept B: Verification Status (Verified / Pending / Rejected) */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Institutional Verification Status
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">
                  {isVerified
                    ? 'Verified Faculty Educator'
                    : isPending
                    ? 'Verification Pending'
                    : 'Verification Rejected'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isVerified
                    ? 'Officially accredited in institution catalogue'
                    : isPending
                    ? 'Awaiting review from institutional administrators'
                    : 'Accreditation was not approved'}
                </p>
              </div>

              {isVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  Verified
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 shrink-0">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Pending
                </span>
              )}
              {isRejected && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 shrink-0">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Rejected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Official Academic Catalogue Affiliation (Source of Truth - Requirement 5) */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Catalogue Academic Placement
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Official Institutional Registry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* University */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-400" /> University
              </span>
              <p className="font-semibold text-white text-xs">
                {lecturer.universityName || lecturer.universityId.toUpperCase()}
              </p>
              <p className="font-mono text-[10px] text-slate-500">{lecturer.universityId}</p>
            </div>

            {/* Academic Unit */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Layers className="w-3 h-3 text-sky-400" /> Academic Unit
              </span>
              <p className="font-semibold text-white text-xs">
                {lecturer.academicUnitName || lecturer.academicUnitId || 'Not designated'}
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                {lecturer.academicUnitId || 'N/A'}
              </p>
            </div>

            {/* Department */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Building className="w-3 h-3 text-indigo-400" /> Department
              </span>
              <p className="font-semibold text-white text-xs">
                {lecturer.departmentName || lecturer.departmentId || 'Not designated'}
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                {lecturer.departmentId || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* 3.5. My Assigned Courses Section (Stage 5C - Requirement 12) */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                My Courses
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                {assignedCourses.length} {assignedCourses.length === 1 ? 'Course' : 'Courses'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Official Faculty Allocation</span>
          </div>

          {loadingCourses ? (
            <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
              <span>Loading assigned courses from catalogue...</span>
            </div>
          ) : assignedCourses.length === 0 ? (
            <div className="py-8 px-4 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-300">
                No courses currently assigned
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                Academic course allocations and curriculum responsibilities are designated by your department moderator or institutional administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assignedCourses.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
                          {c.courseCode}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                          {c.credits} Credits
                        </span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-white leading-snug">
                        {c.courseTitle}
                      </h4>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0">
                      Active
                    </span>
                  </div>

                  {/* Teaching Context details */}
                  <div className="pt-2 border-t border-slate-800/60 space-y-1 text-[11px] text-slate-400">
                    {c.programmeName && (
                      <p className="flex items-center gap-1.5 text-slate-300 truncate">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{c.programmeName}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>
                        {c.yearOfStudy && c.semester
                          ? `Year ${c.yearOfStudy} • Semester ${c.semester}`
                          : 'General Teaching Offering'}
                      </span>
                      {c.departmentName && (
                        <span className="truncate max-w-[120px] text-slate-400">
                          {c.departmentName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Faculty Contact & Academic Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contact Details */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Contact & Location
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> Email:
                </span>
                <span className="font-mono text-white text-right truncate max-w-[200px]">
                  {lecturer.email}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> Phone:
                </span>
                <span className="text-white">
                  {lecturer.phone || <span className="text-slate-500 italic">Not set</span>}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Office Room:
                </span>
                <span className="text-white">
                  {lecturer.office || <span className="text-slate-500 italic">Not specified</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Authentication & Security Record */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              VENUE Authentication Identity
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
                <span className="text-slate-400">Account Connection:</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Linked to Firebase UID
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
                <span className="text-slate-400">Firebase UID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-sky-400 truncate max-w-[140px]">
                    {lecturer.userId || currentUser?.uid}
                  </span>
                  <button
                    onClick={() => handleCopyUid(lecturer.userId || currentUser?.uid || '')}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Copy UID"
                  >
                    {copiedUid ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
                <span className="text-slate-400">Record Created:</span>
                <span className="text-slate-300 font-medium">
                  {formatDate(lecturer.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio / Research Note */}
        {lecturer.bio && (
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Academic Background & Research Interests
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {lecturer.bio}
            </p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Lecturer Profile</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update permitted personal and contact details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 text-xs">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr., Prof."
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Full Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Full Name *:</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Phone Contact:</label>
                  <input
                    type="tel"
                    placeholder="+255 7XX XXX XXX"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Office */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Office Room / Building:</label>
                  <input
                    type="text"
                    placeholder="e.g. Science Block Room 204"
                    value={editOffice}
                    onChange={(e) => setEditOffice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Biography & Academic Interests:
                </label>
                <textarea
                  rows={3}
                  placeholder="Share your research areas, academic credentials, and office consultation hours..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* Notice regarding Catalogue Protection */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Academic Protection:</span> University, Academic Unit, Department, Staff ID, and Verification Status are governed by institutional administrators and cannot be altered here.
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
