import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Users,
  UserCheck,
  Megaphone,
  BarChart3,
  ClipboardList,
  Settings,
  Shield,
  ArrowLeft,
  X,
  Lock,
} from 'lucide-react';
import { AdminSectionId, AdminUserRecord } from '../../types';

interface AdminSidebarProps {
  currentSection: AdminSectionId;
  onSelectSection: (section: AdminSectionId) => void;
  onExitToStudent: () => void;
  adminUser: AdminUserRecord | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentSection,
  onSelectSection,
  onExitToStudent,
  adminUser,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: {
    id: AdminSectionId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    comingSoon?: boolean;
    description: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Platform overview and institutional statistics',
    },
    {
      id: 'catalogue',
      label: 'Academic Catalogue',
      icon: GraduationCap,
      description: 'Colleges, departments, programmes & curricula',
    },
    {
      id: 'materials',
      label: 'Materials',
      icon: FileText,
      description: 'Institutional repository, lecture notes & past papers',
    },
    {
      id: 'lecturers',
      label: 'Lecturers',
      icon: UserCheck,
      description: 'Verified faculty directory and academic instructors',
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      description: 'Enrolled student directory and account management',
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      description: 'Institutional notices, semester dates and alerts',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Platform engagement, course usage and adoption metrics',
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: ClipboardList,
      description: 'Immutable administrative action and security audit trail',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      comingSoon: true,
      description: 'System configurations, API tokens and RBAC roles',
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-slate-950/95 border-r border-slate-800/80 p-4">
      {/* Brand & Platform Header */}
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 shadow-lg shadow-indigo-500/20 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base">VENUE</span>
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Control Center</p>
            </div>
          </div>
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="mt-5 space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Platform Management
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.comingSoon && (
                  <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 border border-slate-700/50">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin User Profile & Student View Switcher */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        {/* Admin Account Pill */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              {adminUser?.displayName?.charAt(0) || adminUser?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {adminUser?.displayName || adminUser?.email || 'Platform Admin'}
              </p>
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-medium">Super Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exit to Student Experience */}
        <button
          onClick={onExitToStudent}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Student Campus</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
