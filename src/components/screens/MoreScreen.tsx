import React from 'react';
import {
  Calendar,
  HelpCircle,
  Layers,
  Award,
  Briefcase,
  Building2,
  Users,
  Wallet,
  User,
  Bell,
  Settings,
  BookOpen,
  FileText,
  Sparkles,
  ChevronRight,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { ScreenId, StudentProfile } from '../../types';

interface MoreScreenProps {
  profile: StudentProfile;
  onNavigate: (screen: ScreenId) => void;
  onLogout: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({ profile, onNavigate, onLogout }) => {
  const sections = [
    {
      title: 'Academic & Learning Tools',
      items: [
        {
          id: 'browse-materials' as ScreenId,
          name: 'Browse Academic Materials',
          desc: 'Explore curriculum, lecture notes & past papers from any year or faculty',
          icon: Compass,
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        },
        {
          id: 'planner' as ScreenId,
          name: 'Study Planner & Timetables',
          desc: 'Task scheduling, exam countdowns & weekly study blocks',
          icon: Calendar,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        },
        {
          id: 'resources' as ScreenId,
          name: 'Academic Resources',
          desc: 'Lecture handouts, reference textbooks, and formula cheatsheets',
          icon: BookOpen,
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        },
        {
          id: 'past-papers' as ScreenId,
          name: 'Past Papers Archive',
          desc: 'University examination and CA past papers with solved proofs',
          icon: FileText,
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        },
        {
          id: 'quiz' as ScreenId,
          name: 'Quizzes & Practice',
          desc: 'Continuous self-testing on real analysis and probability',
          icon: HelpCircle,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        },
        {
          id: 'flashcards' as ScreenId,
          name: 'Flashcards',
          desc: 'Spaced repetition decks for theorems, axioms & definitions',
          icon: Layers,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        },
      ],
    },
    {
      title: 'Student Life & Opportunities',
      items: [
        {
          id: 'scholarships' as ScreenId,
          name: 'Scholarships & Opportunities',
          desc: 'Undergraduate funding, BoT actuarial internships & fellowships',
          icon: Award,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        },
        {
          id: 'career' as ScreenId,
          name: 'Career Hub',
          desc: 'Data science, actuarial and statistical quantitative pathways',
          icon: Briefcase,
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        },
        {
          id: 'university-hub' as ScreenId,
          name: 'University Hub',
          desc: 'Official notices, CoNAS calendar almanac & campus services',
          icon: Building2,
          color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        },
        {
          id: 'community' as ScreenId,
          name: 'Student Community',
          desc: 'Verified peer discussion groups and course doubt resolution',
          icon: Users,
          color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
        },
        {
          id: 'financial-planner' as ScreenId,
          name: 'Financial Planner',
          desc: 'HESLB loan allocation, cafeteria allowances & expense logging',
          icon: Wallet,
          color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
        },
      ],
    },
    {
      title: 'Account & Configuration',
      items: [
        {
          id: 'profile' as ScreenId,
          name: 'Student Profile',
          desc: 'Academic records, GPA, skills and student verification',
          icon: User,
          color: 'text-slate-300 bg-slate-800 border-slate-700',
        },
        {
          id: 'notifications' as ScreenId,
          name: 'Notifications',
          desc: 'Exam alerts, scholarship deadlines, and discussion updates',
          icon: Bell,
          color: 'text-slate-300 bg-slate-800 border-slate-700',
        },
        {
          id: 'settings' as ScreenId,
          name: 'Settings & Color Themes',
          desc: '8 soft academic color themes, alerts & app configuration',
          icon: Settings,
          color: 'text-slate-300 bg-slate-800 border-slate-700',
        },
      ],
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24">
      {/* Student Profile Quick Card */}
      <div
        onClick={() => onNavigate('profile')}
        className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-blue-950/70 border border-blue-500/30 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-all shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            {profile.profilePhoto || profile.avatar ? (
              <img
                src={profile.profilePhoto || profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-blue-500/50 flex items-center justify-center text-sky-400 font-bold text-base">
                {(profile.name || 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 absolute bottom-0 right-0" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{profile.name}</h3>
            <p className="text-xs text-sky-400 font-medium">
              {profile.programmeShort || profile.programme}
            </p>
            <p className="text-[11px] text-slate-400">
              {profile.universityShort} • {profile.yearOfStudy}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-sky-400 font-medium bg-blue-500/10 px-2.5 py-1.5 rounded-xl border border-blue-500/20">
          <span>View Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Sections */}
      {sections.map((sec, secIdx) => (
        <div key={secIdx} className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            {sec.title}
          </h4>

          <div className="space-y-2">
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="w-full p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {item.name}
                      </h5>
                      <p className="text-xs text-slate-400 leading-tight">{item.desc}</p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout Action */}
      <div className="pt-2">
        <button
          id="more-logout-btn"
          onClick={onLogout}
          className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of Student Session</span>
        </button>

        <p className="text-[11px] text-slate-500 text-center mt-3">
          VENUE v1.0 • Your Academic Space
        </p>
      </div>
    </div>
  );
};
