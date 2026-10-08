import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  FileText,
  Download,
  Search,
  CheckCircle2,
  BookOpen,
  Calendar,
  Award,
  Sparkles,
  FolderOpen,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ScreenId, AcademicMaterialRecord, StudentProfile, Course } from '../../types';
import { studentMaterialsService } from '../../services/studentMaterialsService';
import { StudentMaterialDetailModal } from '../student/StudentMaterialDetailModal';
import { PremiumDownloadModal } from '../student/PremiumDownloadModal';

interface PastPapersScreenProps {
  profile?: StudentProfile;
  courses?: Course[];
  onNavigate: (screen: ScreenId) => void;
  onBack: () => void;
  onOpenMaterialViewer?: (material: AcademicMaterialRecord) => void;
}

export const PastPapersScreen: React.FC<PastPapersScreenProps> = ({
  profile,
  courses = [],
  onNavigate,
  onBack,
  onOpenMaterialViewer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('ALL');
  const [pastPapers, setPastPapers] = useState<AcademicMaterialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedMaterialDetail, setSelectedMaterialDetail] = useState<AcademicMaterialRecord | null>(null);
  const [premiumGateMaterial, setPremiumGateMaterial] = useState<AcademicMaterialRecord | null>(null);

  const loadPastPapers = async () => {
    setLoading(true);
    try {
      const allMaterials = await studentMaterialsService.getStudentCourseMaterials(profile);
      const papersOnly = allMaterials.filter((m) => m.materialType === 'Past Papers');
      setPastPapers(papersOnly);
    } catch (err) {
      console.warn('PastPapersScreen: Failed to load real past papers:', err);
      setPastPapers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPastPapers();
  }, [
    profile?.universityId,
    profile?.programmeId,
    profile?.yearOfStudy,
    profile?.semester,
  ]);

  const courseCodesList = useMemo(() => {
    const codes = new Set<string>();
    courses.forEach((c) => {
      if (c.code) codes.add(c.code.trim().toUpperCase());
    });
    pastPapers.forEach((p) => {
      if (p.courseCode) codes.add(p.courseCode.trim().toUpperCase());
    });
    return ['ALL', ...Array.from(codes)];
  }, [courses, pastPapers]);

  const filteredPapers = useMemo(() => {
    return pastPapers.filter((paper) => {
      const codeUpper = (paper.courseCode || '').trim().toUpperCase();
      const matchesCourse = selectedCourseCode === 'ALL' || codeUpper === selectedCourseCode;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        paper.title?.toLowerCase().includes(q) ||
        paper.courseCode?.toLowerCase().includes(q) ||
        paper.courseTitle?.toLowerCase().includes(q) ||
        paper.description?.toLowerCase().includes(q);
      return matchesCourse && matchesQuery;
    });
  }, [pastPapers, selectedCourseCode, searchQuery]);

  const handleOpenPaper = (paper: AcademicMaterialRecord) => {
    if (onOpenMaterialViewer) {
      onOpenMaterialViewer(paper);
    } else {
      setSelectedMaterialDetail(paper);
    }
  };

  const handleDownloadPaper = async (paper: AcademicMaterialRecord) => {
    const res = await studentMaterialsService.requestMaterialDownload(paper, profile?.uid);
    if (res.requiresPremium) {
      setPremiumGateMaterial(paper);
      return;
    }
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/40 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            id="past-papers-back-btn"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>University Past Papers</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official past examination papers uploaded for your courses
            </p>
          </div>
        </div>

        <button
          onClick={loadPastPapers}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Refresh Past Papers"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
        </button>
      </div>

      {/* Search & Course Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="past-papers-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past papers by course code or title..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Course Pills */}
        {courseCodesList.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {courseCodesList.map((code) => (
              <button
                key={code}
                id={`past-paper-filter-${code.replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCourseCode(code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedCourseCode === code
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {code === 'ALL' ? 'All Courses' : code}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          <p className="text-xs">Loading official past examination papers...</p>
        </div>
      )}

      {/* Papers List */}
      {!loading && filteredPapers.length > 0 && (
        <div className="space-y-3">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              id={`past-paper-card-${paper.id}`}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      {paper.courseCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      Past Paper
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {studentMaterialsService.formatDate(paper.createdAt)}
                    </span>
                  </div>
                  <h3
                    onClick={() => handleOpenPaper(paper)}
                    className="text-sm font-bold text-white hover:text-sky-400 cursor-pointer transition-colors"
                  >
                    {paper.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {paper.courseTitle} • {paper.fileSize || 'PDF Document'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setSelectedMaterialDetail(paper)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Details</span>
                </button>
                <button
                  id={`open-past-paper-${paper.id}`}
                  onClick={() => handleOpenPaper(paper)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Paper</span>
                </button>
                <button
                  id={`download-past-paper-${paper.id}`}
                  onClick={() => handleDownloadPaper(paper)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPapers.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <FolderOpen className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-200">No Past Papers Uploaded Yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {searchQuery || selectedCourseCode !== 'ALL'
              ? 'No uploaded past examination papers matched your filter.'
              : 'Your lecturers or administrators have not uploaded past examination papers for your courses yet. Uploaded past papers will appear here automatically.'}
          </p>
          {(searchQuery || selectedCourseCode !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCourseCode('ALL');
              }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* AI Tutor Revision CTA */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/60 border border-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>AI Exam Preparation</span>
          </div>
          <p className="text-xs text-slate-300">
            Need step-by-step practice solutions or custom revision quizzes for your courses? Ask AI Tutor.
          </p>
        </div>
        <button
          id="past-papers-ai-tutor-btn"
          onClick={() => onNavigate('ai-tutor')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
        >
          Open AI Tutor
        </button>
      </div>

      {selectedMaterialDetail && (
        <StudentMaterialDetailModal
          material={selectedMaterialDetail}
          onClose={() => setSelectedMaterialDetail(null)}
          onOpenViewer={handleOpenPaper}
          userId={profile?.uid}
        />
      )}

      <PremiumDownloadModal
        isOpen={Boolean(premiumGateMaterial)}
        onClose={() => setPremiumGateMaterial(null)}
        material={premiumGateMaterial}
        onReadInsideVenue={
          premiumGateMaterial && premiumGateMaterial.fileUrl
            ? (mat) => {
                setPremiumGateMaterial(null);
                handleOpenPaper(mat);
              }
            : undefined
        }
      />
    </div>
  );
};
