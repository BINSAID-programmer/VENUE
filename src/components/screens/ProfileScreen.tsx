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
} from 'lucide-react';
import { StudentProfile } from '../../types';

interface ProfileScreenProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onEditProfile?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ profile, onUpdateProfile, onEditProfile }) => {
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [editedGpa, setEditedGpa] = useState(profile.gpa.toString());

  const handleSaveGpa = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      gpa: parseFloat(editedGpa) || profile.gpa,
    });
    setIsQuickEditOpen(false);
  };

  const initialLetter = (profile.name || 'S').trim().charAt(0).toUpperCase() || 'S';
  const hasPhoto = Boolean(profile.profilePhoto || profile.avatar);
  const isComplete = profile.isProfileComplete || Boolean(profile.registrationNumber && profile.programme);

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      {/* If profile is incomplete, show prominent Complete Profile banner */}
      {!isComplete && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-indigo-500/15 border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white">Incomplete Academic Identity</h4>
              <p className="text-[11px] text-slate-300 truncate">
                Please set up your Registration Number and Degree details.
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
            <div className="relative group cursor-pointer" onClick={onEditProfile} title="Tap to change photo or edit profile">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/30 overflow-hidden">
                {hasPhoto ? (
                  <img
                    src={profile.profilePhoto || profile.avatar}
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

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{profile.name || 'Student'}</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-500/30 font-semibold">
                  {profile.registrationNumber ? 'Verified Student' : 'Active Student'}
                </span>
              </div>
              <p className="text-xs text-sky-400 font-medium mt-0.5 truncate">{profile.programme || 'Degree Programme'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {profile.university} {profile.college ? `• ${profile.college}` : ''}
              </p>
            </div>
          </div>

          <button
            id="profile-edit-btn"
            type="button"
            onClick={onEditProfile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-sky-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            title="Edit Academic Profile"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold hidden sm:inline">Edit Profile</span>
          </button>
        </div>

        {/* Core Stats Row */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          <div
            onClick={() => setIsQuickEditOpen(true)}
            className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-850 hover:border-slate-700 cursor-pointer transition-colors"
            title="Tap to update GPA"
          >
            <span className="text-[10px] text-slate-400 font-medium">Cumulative GPA</span>
            <p className="text-base font-extrabold text-white mt-0.5">
              {profile.gpa} <span className="text-xs text-slate-500 font-normal">/ {profile.gpaMax}</span>
            </p>
            <span className="text-[9px] text-emerald-400 font-bold uppercase">First Class</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-400 font-medium">Study Streak</span>
            <p className="text-base font-extrabold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              {profile.studyStreakDays} Days
            </p>
            <span className="text-[9px] text-slate-500 font-medium">Active Consistency</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-400 font-medium">Degree Credits</span>
            <p className="text-base font-extrabold text-sky-400 mt-0.5">
              {profile.creditsCompleted} <span className="text-xs text-slate-500 font-normal">/ {profile.totalCredits}</span>
            </p>
            <span className="text-[9px] text-slate-500 font-medium">66.7% Completed</span>
          </div>
        </div>
      </div>

      {/* Academic Record & Identity (All 7 required profile fields clearly displayed) */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-blue-400" />
            Academic Identity & Records
          </h3>
          <button
            type="button"
            onClick={onEditProfile}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Edit Information</span>
            <Edit3 className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {/* 1. Registration Number */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-blue-400" />
              Registration Number:
            </span>
            <p className="font-semibold text-slate-100 mt-1 font-mono text-sm">
              {profile.registrationNumber || <span className="text-slate-500 font-normal italic">Not specified</span>}
            </p>
          </div>

          {/* 2. University */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <School className="w-3 h-3 text-sky-400" />
              University:
            </span>
            <p className="font-semibold text-slate-100 mt-1">
              {profile.university || <span className="text-slate-500 font-normal italic">Not specified</span>}
            </p>
          </div>

          {/* 3. College */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Building className="w-3 h-3 text-emerald-400" />
              Academic Unit:
            </span>
            <p className="font-semibold text-slate-100 mt-1">
              {profile.institutionName || profile.college || <span className="text-slate-500 font-normal italic">Not specified</span>}
            </p>
          </div>

          {/* 4. Department */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Building className="w-3 h-3 text-teal-400" />
              Department:
            </span>
            <p className="font-semibold text-slate-100 mt-1">
              {profile.departmentName || profile.department || <span className="text-slate-500 font-normal italic">Not specified</span>}
            </p>
          </div>

          {/* 5. Programme */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-purple-400" />
              Degree Programme:
            </span>
            <p className="font-semibold text-slate-100 mt-1">
              {profile.programmeName || profile.programme || <span className="text-slate-500 font-normal italic">Not specified</span>}
            </p>
          </div>

          {/* 5. Academic Year */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              Academic Year:
            </span>
            <p className="font-semibold text-slate-100 mt-1">
              {profile.academicYear || '2025/2026'}
            </p>
          </div>

          {/* 6. Year of Study & 7. Semester */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-indigo-400" />
              Study Level & Term:
            </span>
            <p className="font-semibold text-slate-100 mt-1">
              {profile.yearOfStudy || 'Year 1'} • {profile.semester || 'Semester 1'}
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Account & Security */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          Account & Authentication Credentials
        </h3>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-500 font-medium">Verified Student Email</span>
            <p className="font-semibold text-slate-200 mt-0.5">{profile.email || 'student@udsm.ac.tz'}</p>
          </div>
          {profile.uid && (
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-500 font-medium">Student UID</span>
              <p className="font-mono text-[11px] text-sky-400 mt-0.5">{profile.uid}</p>
            </div>
          )}
        </div>
      </div>

      {/* Academic Skills */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          Core Quantitative Skills
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

      {/* Badges & Achievements */}
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

      {/* Quick Edit GPA Modal */}
      {isQuickEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Update Target GPA</h3>
            <form onSubmit={handleSaveGpa} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target GPA (0 - 5.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5.0"
                  value={editedGpa}
                  onChange={(e) => setEditedGpa(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickEditOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Save GPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

