import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Building,
  Award,
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  Share2,
  Edit3,
  TrendingUp,
  FileCheck,
  Camera,
  Calendar,
  BookOpen,
  School,
  AlertCircle,
  Moon,
  ShieldCheck,
  ShieldAlert,
  Mail,
  KeyRound,
  Phone,
  Hash,
  Layers,
} from 'lucide-react';
import { StudentProfile } from '../../types';
import { ThemeToggle } from '../ThemeToggle';
import { auth } from '../../services/firebase';
import {
  sendStudentPasswordResetEmail,
  sendStudentEmailVerification,
} from '../../services/studentProfileService';

interface ProfileScreenProps {
  profile: StudentProfile;
  onUpdateProfile?: (updated: Partial<StudentProfile>) => void;
  onEditProfile?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ profile, onEditProfile }) => {
  const [resetMessage, setResetMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isSendingReset, setIsSendingReset] = useState<boolean>(false);
  const [isSendingVerify, setIsSendingVerify] = useState<boolean>(false);

  const initialLetter = (profile.name || profile.fullName || 'S').trim().charAt(0).toUpperCase() || 'S';
  const hasPhoto = Boolean(profile.profilePhoto || profile.photoURL || profile.avatar);
  const isComplete = profile.isProfileComplete || Boolean(profile.registrationNumber && profile.programme);

  const currentUser = auth.currentUser;
  const isEmailVerified = currentUser?.emailVerified ?? Boolean(profile.emailVerified);
  const accountStatus = profile.status || profile.accountStatus || 'active';

  const handlePasswordReset = async () => {
    const emailToUse = profile.email || currentUser?.email;
    if (!emailToUse) {
      setResetMessage({ text: 'No email found on your profile.', isError: true });
      return;
    }

    setIsSendingReset(true);
    setResetMessage(null);
    try {
      const res = await sendStudentPasswordResetEmail(emailToUse);
      setResetMessage({ text: res.message, isError: !res.success });
    } catch (err: any) {
      setResetMessage({ text: err?.message || 'Failed to send reset email.', isError: true });
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsSendingVerify(true);
    setResetMessage(null);
    try {
      const res = await sendStudentEmailVerification();
      setResetMessage({ text: res.message, isError: !res.success });
    } catch (err: any) {
      setResetMessage({ text: err?.message || 'Failed to send verification email.', isError: true });
    } finally {
      setIsSendingVerify(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      {/* Incomplete Academic Identity Banner */}
      {!isComplete && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-indigo-500/15 border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white">Incomplete Academic Identity</h4>
              <p className="text-[11px] text-slate-300 truncate">
                Please confirm your institutional registration number and degree details.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="complete-profile-banner-btn"
            onClick={onEditProfile}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:brightness-110 shrink-0 cursor-pointer"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-900 border border-blue-500/25 p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Student Profile Photo */}
            <div
              className="relative group cursor-pointer"
              onClick={onEditProfile}
              title="Tap to change photo or edit profile"
            >
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/30 overflow-hidden">
                {hasPhoto ? (
                  <img
                    src={profile.profilePhoto || profile.photoURL || profile.avatar}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center font-extrabold text-2xl sm:text-3xl text-sky-400 font-['Space_Grotesk']">
                    {initialLetter}
                  </div>
                )}
              </div>

              {/* Edit/Camera icon overlay badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 hover:bg-sky-500 border-2 border-[#070b14] flex items-center justify-center text-white shadow-md transition-transform active:scale-95">
                <Camera className="w-3 h-3" />
              </div>
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {profile.name || profile.fullName || 'Student'}
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1 ${
                    accountStatus === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {accountStatus === 'active' ? (
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                  )}
                  <span className="capitalize">{accountStatus} Account</span>
                </span>
              </div>

              <p className="text-xs text-sky-400 font-medium truncate">
                {profile.programme || profile.programmeName || 'Degree Programme'}
              </p>

              <p className="text-[11px] text-slate-400 truncate">
                {profile.university || profile.universityName || 'University'}
                {(profile.college || profile.academicUnitName) ? ` • ${profile.college || profile.academicUnitName}` : ''}
              </p>

              {profile.phoneNumber && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-indigo-400" />
                  <span>{profile.phoneNumber}</span>
                </p>
              )}
            </div>
          </div>

          <button
            id="profile-edit-btn"
            type="button"
            onClick={onEditProfile}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-sky-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="Edit Personal Profile"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold hidden sm:inline">Edit Profile</span>
          </button>
        </div>

        {/* Academic Progress Summary */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-400 font-medium">Cumulative GPA</span>
            <p className="text-base font-extrabold text-white mt-0.5">
              {profile.gpa || 0} <span className="text-xs text-slate-500 font-normal">/ {profile.gpaMax || 5}</span>
            </p>
            <span className="text-[9px] text-emerald-400 font-bold uppercase">Academic Standing</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-400 font-medium">Study Streak</span>
            <p className="text-base font-extrabold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              {profile.studyStreakDays || 0} Days
            </p>
            <span className="text-[9px] text-slate-500 font-medium">Active Consistency</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-400 font-medium">Degree Credits</span>
            <p className="text-base font-extrabold text-sky-400 mt-0.5">
              {profile.creditsCompleted || 0}{' '}
              <span className="text-xs text-slate-500 font-normal">/ {profile.totalCredits || 144}</span>
            </p>
            <span className="text-[9px] text-slate-500 font-medium">
              {profile.totalCredits
                ? `${Math.round(((profile.creditsCompleted || 0) / profile.totalCredits) * 100)}% Completed`
                : 'Enrolled'}
            </span>
          </div>
        </div>
      </div>

      {/* Official Academic Identity & Records (Institutionally Controlled) */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-400" />
              Academic Identity & Enrollment
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <ShieldCheck className="w-3 h-3" />
              Institutionally Verified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {/* Registration Number */}
          {profile.registrationNumber ? (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Hash className="w-3 h-3 text-blue-400" />
                Registration Number:
              </span>
              <p className="font-semibold text-slate-100 mt-1 font-mono text-sm">
                {profile.registrationNumber}
              </p>
            </div>
          ) : null}

          {/* University */}
          {(profile.university || profile.universityName) ? (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <School className="w-3 h-3 text-sky-400" />
                University:
              </span>
              <p className="font-semibold text-slate-100 mt-1">
                {profile.university || profile.universityName}
                {profile.universityShort && profile.universityShort !== profile.university && (
                  <span className="text-xs text-sky-400 ml-1.5 font-normal">({profile.universityShort})</span>
                )}
              </p>
            </div>
          ) : null}

          {/* Academic Unit (College / School) */}
          {(profile.institutionName || profile.college || profile.academicUnitName) ? (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Building className="w-3 h-3 text-emerald-400" />
                Academic Unit (College / School):
              </span>
              <p className="font-semibold text-slate-100 mt-1">
                {profile.institutionName || profile.college || profile.academicUnitName}
              </p>
            </div>
          ) : null}

          {/* Department */}
          {(profile.departmentName || profile.department) ? (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Building className="w-3 h-3 text-teal-400" />
                Academic Department:
              </span>
              <p className="font-semibold text-slate-100 mt-1">
                {profile.departmentName || profile.department}
              </p>
            </div>
          ) : null}

          {/* Programme */}
          {(profile.programmeName || profile.programme) ? (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-purple-400" />
                  Enrolled Degree Programme:
                </span>
                {profile.degreeLevel && (
                  <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-2.5 h-2.5" />
                    {profile.degreeLevel}
                  </span>
                )}
              </div>
              <p className="font-semibold text-slate-100 mt-1">
                {profile.programmeName || profile.programme}
                {profile.programmeCode ? (
                  <span className="ml-2 font-mono text-xs text-sky-400 bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-800/40">
                    {profile.programmeCode}
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}

          {/* Academic Year */}
          {profile.academicYear ? (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                Curriculum Session:
              </span>
              <p className="font-semibold text-slate-100 mt-1">{profile.academicYear}</p>
            </div>
          ) : null}

          {/* Year of Study & Semester */}
          {(profile.yearOfStudy || profile.semester) ? (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-indigo-400" />
                Study Level & Semester:
              </span>
              <p className="font-semibold text-slate-100 mt-1">
                {[profile.yearOfStudy, profile.semester].filter(Boolean).join(' • ')}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Account Security & Authentication Credentials */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          Account Security & Credentials
        </h3>

        {resetMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              resetMessage.isError
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {resetMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{resetMessage.text}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-850">
            <div>
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Mail className="w-3 h-3 text-indigo-400" />
                Registered Student Email
              </span>
              <p className="font-semibold text-slate-200 mt-0.5">
                {profile.email || currentUser?.email || 'student@venue.ac.tz'}
              </p>
            </div>

            <div className="flex items-center gap-2">
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div>
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-amber-400" />
                Password & Access Key
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Managed via secure Firebase Authentication. Passwords are never stored in database records.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={isSendingReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 hover:text-white transition disabled:opacity-50 shrink-0"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isSendingReset ? 'Sending...' : 'Reset Password'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Theme & Visual Appearance */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5 text-sky-400" />
          Theme & Display Preferences
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-850">
          <div>
            <p className="text-xs font-semibold text-white">Interface Theme</p>
            <p className="text-[11px] text-slate-400">Switch between Light, Dark, or System mode</p>
          </div>
          <ThemeToggle variant="segmented" />
        </div>
      </div>

      {/* Core Quantitative Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Core Academic Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/10 text-sky-300 border border-blue-500/20 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Badges & Achievements */}
      {profile.achievements && profile.achievements.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Academic Badges & Honors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {profile.achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                    <span className="text-[9px] text-amber-300/80 font-medium">{ach.earnedDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
