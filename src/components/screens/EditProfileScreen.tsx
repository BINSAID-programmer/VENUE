import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  User,
  GraduationCap,
  Building,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trash2,
  School,
  FileCheck,
  Layers,
  Loader2,
  Lock,
  Mail,
  KeyRound,
  Phone,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import { StudentProfile } from '../../types';
import {
  validateProfilePhotoFile,
  uploadStudentProfilePhoto,
  updateStudentPersonalProfile,
  sendStudentPasswordResetEmail,
  sendStudentEmailVerification,
} from '../../services/studentProfileService';
import { auth } from '../../services/firebase';

interface EditProfileScreenProps {
  profile: StudentProfile;
  onSave: (updated: StudentProfile) => Promise<void> | void;
  onCancel: () => void;
  isInitialSetup?: boolean;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  profile,
  onSave,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable Personal Fields
  const [fullName, setFullName] = useState<string>(profile.fullName || profile.name || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(profile.phoneNumber || '');
  const [profilePhoto, setProfilePhoto] = useState<string>(
    profile.profilePhoto || profile.photoURL || profile.avatar || ''
  );

  // Upload & Save UI States
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Password / Verification trigger states
  const [isSendingReset, setIsSendingReset] = useState<boolean>(false);
  const [isSendingVerify, setIsSendingVerify] = useState<boolean>(false);
  const [securityMessage, setSecurityMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const currentUser = auth.currentUser;
  const isEmailVerified = currentUser?.emailVerified ?? Boolean(profile.emailVerified);
  const accountStatus = profile.status || profile.accountStatus || 'active';

  // Handle Photo File Selection & Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndUploadPhoto(file);
  };

  const processAndUploadPhoto = async (file: File) => {
    const validation = validateProfilePhotoFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid photo file.');
      return;
    }

    setErrorMessage('');
    setIsUploadingPhoto(true);
    setUploadProgress(10);

    try {
      const uid = profile.uid || currentUser?.uid || 'user';
      const uploadedUrl = await uploadStudentProfilePhoto(uid, file, (pct) => {
        setUploadProgress(pct);
      });
      setProfilePhoto(uploadedUrl);
      setSuccessMessage('Profile photo uploaded successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setErrorMessage(err?.message || 'Failed to upload photo. Please try a different image.');
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processAndUploadPhoto(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save Flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const uid = profile.uid || currentUser?.uid || '';
      const updated = await updateStudentPersonalProfile(uid, {
        fullName: fullName.trim(),
        name: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        profilePhoto,
      });

      setSuccessMessage('Profile information saved successfully.');
      await onSave(updated);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setErrorMessage(err?.message || 'Failed to save profile. Please check your connection and retry.');
    } finally {
      setIsSaving(false);
    }
  };

  // Secure Password Reset Trigger
  const handlePasswordReset = async () => {
    const targetEmail = profile.email || currentUser?.email;
    if (!targetEmail) {
      setSecurityMessage({ text: 'No email address associated with this profile.', isError: true });
      return;
    }

    setIsSendingReset(true);
    setSecurityMessage(null);
    try {
      const res = await sendStudentPasswordResetEmail(targetEmail);
      setSecurityMessage({ text: res.message, isError: !res.success });
    } catch (err: any) {
      setSecurityMessage({ text: err?.message || 'Failed to send password reset email.', isError: true });
    } finally {
      setIsSendingReset(false);
    }
  };

  // Email Verification Trigger
  const handleVerifyEmail = async () => {
    setIsSendingVerify(true);
    setSecurityMessage(null);
    try {
      const res = await sendStudentEmailVerification();
      setSecurityMessage({ text: res.message, isError: !res.success });
    } catch (err: any) {
      setSecurityMessage({ text: err?.message || 'Failed to send verification email.', isError: true });
    } finally {
      setIsSendingVerify(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 pb-28">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Personal Account Settings
        </span>
      </div>

      {/* Screen Title Banner */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Edit Profile & Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Update your personal contact details and avatar. Official academic enrollment details remain
          institutionally verified.
        </p>
      </div>

      {/* Error & Success Feedback Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">
            <h4 className="font-semibold">Unable to Save Profile</h4>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Profile Information (Editable) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Personal Information
            </h3>
          </div>

          {/* Profile Photo Uploader */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Profile Photo / Avatar
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Photo Preview */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg overflow-hidden">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={fullName || 'Avatar'}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center font-bold text-3xl text-indigo-400">
                      {(fullName || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {isUploadingPhoto && (
                  <div className="absolute inset-0 rounded-2xl bg-slate-950/80 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>

              {/* Upload Drop Zone / Actions */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 w-full p-4 rounded-2xl border-2 border-dashed transition text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white flex items-center justify-center sm:justify-start gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload new avatar</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    PNG, JPG, or WebP up to 5MB. Photo will be compressed for optimal performance.
                  </p>

                  {/* Progress Bar when uploading */}
                  {isUploadingPhoto && (
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploadingPhoto || isSaving}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto || isSaving}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-sm disabled:opacity-50"
                  >
                    {isUploadingPhoto ? 'Uploading...' : 'Choose File'}
                  </button>

                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={isUploadingPhoto || isSaving}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 transition"
                      title="Remove avatar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="fullNameInput" className="block text-xs font-semibold text-slate-300">
              Full Legal Name <span className="text-rose-400">*</span>
            </label>
            <input
              id="fullNameInput"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Mussa Said"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label htmlFor="phoneInput" className="block text-xs font-semibold text-slate-300">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="phoneInput"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+255 7XX XXX XXX"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Protected Institutional Academic Details (READ-ONLY) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Academic Enrollment (Read-Only)
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              <Lock className="w-3 h-3 text-amber-400" />
              Verified by Administration
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Degree registration, curriculum cohort, and institutional enrollments are locked to prevent
            academic catalogue desynchronization. Contact your departmental administration for course
            or programme reassignments.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Registration Number */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Hash className="w-3 h-3 text-indigo-400" />
                Registration Number
              </span>
              <p className="font-semibold text-slate-200 mt-1 font-mono">
                {profile.registrationNumber || 'Not assigned yet'}
              </p>
            </div>

            {/* University */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <School className="w-3 h-3 text-sky-400" />
                Enrolled University
              </span>
              <p className="font-semibold text-slate-200 mt-1">
                {profile.university || profile.universityName || 'University of Dar es Salaam'}
              </p>
            </div>

            {/* Academic Unit (College) */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-400" />
                Academic Unit (College / School)
              </span>
              <p className="font-semibold text-slate-200 mt-1">
                {profile.institutionName || profile.college || profile.academicUnitName || 'CoNAS'}
              </p>
            </div>

            {/* Department */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Building className="w-3 h-3 text-teal-400" />
                Academic Department
              </span>
              <p className="font-semibold text-slate-200 mt-1">
                {profile.departmentName || profile.department || 'Mathematics & Statistics'}
              </p>
            </div>

            {/* Programme */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 sm:col-span-2">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-purple-400" />
                Degree Programme
              </span>
              <p className="font-semibold text-slate-200 mt-1">
                {profile.programmeName || profile.programme || 'BSc Mathematics & Statistics'}
              </p>
            </div>

            {/* Year of Study & Semester */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 sm:col-span-2">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                Curriculum Session & Stage
              </span>
              <p className="font-semibold text-slate-200 mt-1">
                {profile.academicYear || '2025/2026'} • {profile.yearOfStudy || 'Year 1'} •{' '}
                {profile.semester || 'Semester 1'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Account Security & Authentication Credentials (READ-ONLY / AUTH FLOWS) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Account Authentication & Security
            </h3>
          </div>

          {securityMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                securityMessage.isError
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {securityMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{securityMessage.text}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 space-y-4 text-xs">
            {/* Email Address & Verification */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-850">
              <div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-400" />
                  Primary Authentication Email
                </span>
                <p className="font-semibold text-slate-200 mt-0.5">
                  {profile.email || currentUser?.email || 'student@venue.ac.tz'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Email modifications are managed through official university identity verification.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    isEmailVerified
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {isEmailVerified ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>Unverified</span>
                    </>
                  )}
                </span>

                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={isSendingVerify}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-[11px] font-medium text-indigo-300 hover:text-white transition disabled:opacity-50"
                  >
                    {isSendingVerify ? 'Sending...' : 'Send Link'}
                  </button>
                )}
              </div>
            </div>

            {/* Password Management */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-amber-400" />
                  Password Management
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Passwords are authenticated through Firebase Auth. No credentials are stored in database records.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={isSendingReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 hover:text-white transition disabled:opacity-50 shrink-0"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isSendingReset ? 'Sending...' : 'Send Password Reset'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit & Cancel Actions */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving || isUploadingPhoto}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving || isUploadingPhoto}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
