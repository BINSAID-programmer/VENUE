import React, { useState } from 'react';
import {
  FileText,
  Download,
  BookOpen,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Share2,
  HelpCircle,
  Award,
  Calendar,
} from 'lucide-react';
import { Course, CourseMaterial } from '../../types';

interface CourseDetailScreenProps {
  course: Course;
  onBack: () => void;
  onAskAITutor: (course: Course) => void;
}

export const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({
  course,
  onBack,
  onAskAITutor,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'slides' | 'outline' | 'past-papers' | 'resources'>('overview');
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);

  const notesList = course.materials.filter((m) => m.type === 'notes');
  const slidesList = course.materials.filter((m) => m.type === 'slides');
  const pastPapersList = course.materials.filter((m) => m.type === 'past-paper');

  const handleDownload = (material: CourseMaterial) => {
    setDownloadNotification(`Downloaded: ${material.title}`);
    setTimeout(() => {
      setDownloadNotification(null);
    }, 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      {/* Toast Notification for Download simulation */}
      {downloadNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/90 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadNotification}</span>
        </div>
      )}

      {/* Course Hero Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/50 to-slate-900 border border-blue-500/25 p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-extrabold px-2.5 py-0.5 rounded-md"
                style={{ backgroundColor: `${course.accentColor}25`, color: course.accentColor }}
              >
                {course.code}
              </span>
              {course.year && course.semester && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-sky-300 font-semibold">
                  Year {course.year} • Sem {course.semester}
                </span>
              )}
              {course.type && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    course.type === 'Core'
                      ? 'bg-blue-500/20 text-sky-300 border border-blue-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {course.type}
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium">
                {course.credits} Credits
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {course.title}
            </h2>
            <p className="text-xs text-slate-300 mt-2">
              Lecturer: <span className="font-semibold text-white">{course.instructor.name}</span> ({course.instructor.title})
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Office: {course.instructor.office}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Syllabus Completion</span>
            <span className="font-bold text-white">{course.progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${course.progress}%`,
                backgroundColor: course.accentColor,
              }}
            />
          </div>
        </div>

        {/* "Ask AI Tutor" Floating/Prominent Action Button */}
        <div className="mt-4 flex gap-2">
          <button
            id="course-ask-ai-tutor-btn"
            onClick={() => onAskAITutor(course)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <span>Ask AI Tutor About {course.code}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/80 text-xs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'notes', label: `Notes (${notesList.length})` },
          { id: 'slides', label: `Slides (${slidesList.length})` },
          { id: 'outline', label: `Outline (${course.syllabus.length} Wks)` },
          { id: 'past-papers', label: `Past Papers (${pastPapersList.length})` },
          { id: 'resources', label: 'Recommended Books' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`course-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-lg font-semibold shrink-0 transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600/20 text-sky-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">Course Description</h3>
            <p className="text-slate-300 leading-relaxed">{course.overview}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Assessment Structure</span>
              <p className="font-bold text-slate-200 mt-1">40% CA + 60% UE</p>
              <p className="text-[10px] text-slate-400 mt-0.5">2 Tests (20% each) + University Exam</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Target Grade</span>
              <p className="font-bold text-sky-400 mt-1">Grade {course.gradeTarget} (≥ 70%)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Maintain First Class Honours</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Official synthesized student lecture notes for {course.code}
          </p>
          {notesList.map((material) => (
            <div
              key={material.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100">{material.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {material.fileSize} • {material.readTime || '30 min read'} • Uploaded {material.uploadDate}
                  </p>
                </div>
              </div>
              <button
                id={`download-notes-${material.id}`}
                onClick={() => handleDownload(material)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Download Lecture Notes"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Slides */}
      {activeTab === 'slides' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Presentation decks and visual handouts from lectures
          </p>
          {slidesList.map((material) => (
            <div
              key={material.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-sky-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100">{material.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {material.fileSize} • {material.readTime || '15 min read'} • Uploaded {material.uploadDate}
                  </p>
                </div>
              </div>
              <button
                id={`download-slides-${material.id}`}
                onClick={() => handleDownload(material)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Download Slides"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Course Outline / Syllabus */}
      {activeTab === 'outline' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Syllabus Breakdown</h4>
            <span className="text-[11px] text-slate-400">{course.syllabus.length} Weeks Curriculum</span>
          </div>

          <div className="space-y-2.5">
            {course.syllabus.map((item) => (
              <div
                key={item.week}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  item.completed
                    ? 'bg-slate-900/90 border-slate-800'
                    : 'bg-slate-950/50 border-slate-850'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    item.completed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.completed ? '✓' : item.week}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs sm:text-sm font-semibold text-slate-200">
                      Week {item.week}: {item.title}
                    </h5>
                    {item.completed && (
                      <span className="text-[10px] text-emerald-400 font-semibold">Taught</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Past Papers */}
      {activeTab === 'past-papers' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            Past examination papers are compiled for revision purposes. All questions conform to university academic guidelines.
          </div>

          {pastPapersList.map((material) => (
            <div
              key={material.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100">{material.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {material.fileSize} • University Examination Archive
                  </p>
                </div>
              </div>
              <button
                id={`download-paper-${material.id}`}
                onClick={() => handleDownload(material)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Download Past Paper"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Recommended Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Recommended textbooks and scholarly publications available at Dr. Wilbert Chagula Library
          </p>

          {course.recommendedResources.map((res, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-semibold border border-blue-500/30">
                  {res.type}
                </span>
                {res.edition && <span className="text-[10px] text-slate-400">{res.edition}</span>}
              </div>
              <h4 className="text-sm font-bold text-white">{res.title}</h4>
              <p className="text-xs text-sky-400 font-medium">By {res.author}</p>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">{res.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
