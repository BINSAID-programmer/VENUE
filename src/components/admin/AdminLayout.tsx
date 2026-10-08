import React, { useState, useEffect } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { AcademicCataloguePage } from './catalogue/AcademicCataloguePage';
import { MaterialsManagementPage } from './materials/MaterialsManagementPage';
import { LecturersManagementPage } from './lecturers/LecturersManagementPage';
import { StudentsManagementPage } from './students/StudentsManagementPage';
import { AnnouncementsManagementPage } from './announcements/AnnouncementsManagementPage';
import { AdminAnalyticsPage } from './analytics/AdminAnalyticsPage';
import { AdminAuditLogsPage } from './audit/AdminAuditLogsPage';
import { AdminUserRecord, AdminSectionId } from '../../types';
import { Construction, ArrowLeft, ShieldAlert } from 'lucide-react';

interface AdminLayoutProps {
  adminUser: AdminUserRecord | null;
  onExitToStudent: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  adminUser,
  onExitToStudent,
}) => {
  // Determine initial section based on URL / hash
  const getInitialSection = (): AdminSectionId => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (
      path.includes('/admin/academic-catalogue') ||
      path.includes('/admin/catalogue') ||
      hash.includes('academic-catalogue') ||
      hash.includes('admin/catalogue') ||
      hash === '#catalogue'
    ) {
      return 'catalogue';
    }
    if (
      path.includes('/admin/materials') ||
      hash.includes('admin/materials') ||
      hash === '#materials'
    ) {
      return 'materials';
    }
    if (
      path.includes('/admin/lecturers') ||
      hash.includes('admin/lecturers') ||
      hash === '#lecturers'
    ) {
      return 'lecturers';
    }
    if (
      path.includes('/admin/students') ||
      hash.includes('admin/students') ||
      hash === '#students'
    ) {
      return 'students';
    }
    if (
      path.includes('/admin/announcements') ||
      hash.includes('admin/announcements') ||
      hash === '#announcements'
    ) {
      return 'announcements';
    }
    if (
      path.includes('/admin/analytics') ||
      hash.includes('admin/analytics') ||
      hash === '#analytics'
    ) {
      return 'analytics';
    }
    if (
      path.includes('/admin/audit-logs') ||
      hash.includes('admin/audit-logs') ||
      hash === '#audit-logs'
    ) {
      return 'audit-logs';
    }
    return 'dashboard';
  };

  const [currentSection, setCurrentSection] = useState<AdminSectionId>(getInitialSection);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Sync section to URL and listen to history changes
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        path.includes('/admin/academic-catalogue') ||
        path.includes('/admin/catalogue') ||
        hash.includes('academic-catalogue') ||
        hash.includes('admin/catalogue') ||
        hash === '#catalogue'
      ) {
        setCurrentSection('catalogue');
      } else if (
        path.includes('/admin/materials') ||
        hash.includes('admin/materials') ||
        hash === '#materials'
      ) {
        setCurrentSection('materials');
      } else if (
        path.includes('/admin/lecturers') ||
        hash.includes('admin/lecturers') ||
        hash === '#lecturers'
      ) {
        setCurrentSection('lecturers');
      } else if (
        path.includes('/admin/students') ||
        hash.includes('admin/students') ||
        hash === '#students'
      ) {
        setCurrentSection('students');
      } else if (
        path.includes('/admin/announcements') ||
        hash.includes('admin/announcements') ||
        hash === '#announcements'
      ) {
        setCurrentSection('announcements');
      } else if (
        path.includes('/admin/analytics') ||
        hash.includes('admin/analytics') ||
        hash === '#analytics'
      ) {
        setCurrentSection('analytics');
      } else if (
        path.includes('/admin/audit-logs') ||
        hash.includes('admin/audit-logs') ||
        hash === '#audit-logs'
      ) {
        setCurrentSection('audit-logs');
      } else if (path === '/admin' || hash === '#admin') {
        setCurrentSection('dashboard');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleSelectSection = (section: AdminSectionId) => {
    setCurrentSection(section);
    if (section === 'catalogue') {
      window.history.pushState(null, '', '#admin/academic-catalogue');
    } else if (section === 'materials') {
      window.history.pushState(null, '', '#admin/materials');
    } else if (section === 'lecturers') {
      window.history.pushState(null, '', '#admin/lecturers');
    } else if (section === 'students') {
      window.history.pushState(null, '', '#admin/students');
    } else if (section === 'announcements') {
      window.history.pushState(null, '', '#admin/announcements');
    } else if (section === 'analytics') {
      window.history.pushState(null, '', '#admin/analytics');
    } else if (section === 'audit-logs') {
      window.history.pushState(null, '', '#admin/audit-logs');
    } else if (section === 'dashboard') {
      window.history.pushState(null, '', '#admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row antialiased font-sans">
      {/* Sidebar (Desktop Persistent & Mobile Slide-over) */}
      <AdminSidebar
        currentSection={currentSection}
        onSelectSection={handleSelectSection}
        onExitToStudent={onExitToStudent}
        adminUser={adminUser}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Admin Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Header */}
        <AdminHeader
          adminUser={adminUser}
          currentSection={currentSection}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          onExitToStudent={onExitToStudent}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentSection === 'dashboard' ? (
            <AdminDashboard onNavigateSection={handleSelectSection} />
          ) : currentSection === 'catalogue' ? (
            <AcademicCataloguePage />
          ) : currentSection === 'materials' ? (
            <MaterialsManagementPage />
          ) : currentSection === 'lecturers' ? (
            <LecturersManagementPage />
          ) : currentSection === 'students' ? (
            <StudentsManagementPage />
          ) : currentSection === 'announcements' ? (
            <AnnouncementsManagementPage />
          ) : currentSection === 'analytics' ? (
            <AdminAnalyticsPage />
          ) : currentSection === 'audit-logs' ? (
            <AdminAuditLogsPage />
          ) : (
            /* Coming Soon Screen for other sections */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
                <Construction className="h-8 w-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight capitalize">
                {currentSection} Management
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-md">
                This administrative module is scheduled for implementation in subsequent stages of the
                VENUE Admin Dashboard rollout.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleSelectSection('dashboard')}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Overview</span>
                </button>
                <button
                  onClick={onExitToStudent}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  Return to Student Campus
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
