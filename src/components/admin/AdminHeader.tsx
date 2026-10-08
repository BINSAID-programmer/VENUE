import React from 'react';
import {
  Menu,
  ShieldCheck,
  ExternalLink,
  Database,
  Crown,
} from 'lucide-react';
import { AdminUserRecord, AdminSectionId } from '../../types';

interface AdminHeaderProps {
  adminUser: AdminUserRecord | null;
  currentSection: AdminSectionId;
  onToggleMobileMenu: () => void;
  onExitToStudent: () => void;
}

const sectionTitles: Record<AdminSectionId, string> = {
  dashboard: 'System Overview & Telemetry',
  catalogue: 'Academic Catalogue & Structure',
  materials: 'Academic Materials & Resources',
  lecturers: 'Verified Faculty & Lecturers',
  students: 'Enrolled Student Directory',
  announcements: 'University & Campus Announcements',
  analytics: 'Platform Usage & Adoption Metrics',
  'audit-logs': 'Administrative Audit Logs',
  settings: 'System & Security Settings',
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminUser,
  currentSection,
  onToggleMobileMenu,
  onExitToStudent,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight capitalize">
              {currentSection}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-400">
            {sectionTitles[currentSection]}
          </p>
        </div>
      </div>

      {/* Right: Security Status & Navigation Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Firestore Database Connection Pill */}
        <div className="hidden xl:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
          <Database className="h-3.5 w-3.5 text-sky-400" />
          <span>Firestore Connected</span>
        </div>

        {/* Super Admin Status Badge */}
        <div className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
          <Crown className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">Super Admin</span>
        </div>

        {/* Switch to Student View */}
        <button
          onClick={onExitToStudent}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <span>Student View</span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
};
