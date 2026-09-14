import React, { useState } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Calendar,
  Award,
  ChevronRight,
} from 'lucide-react';
import { ScreenId } from '../../types';

interface PastPapersScreenProps {
  onAskAITutor?: (topic: string) => void;
  onNavigate?: (screen: ScreenId) => void;
}

export const PastPapersScreen: React.FC<PastPapersScreenProps> = ({ onAskAITutor, onNavigate }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const pastPapersList = [
    {
      id: 'pp-1',
      courseCode: 'MT 201',
      courseName: 'Real Analysis I',
      year: '2023/2024',
      examType: 'University Examination (UE)',
      duration: '3 Hours',
      questionsCount: 5,
      hasSolutions: true,
      fileSize: '1.2 MB',
      sampleTopic: 'Prove Heine-Borel Theorem & Darboux Integrability',
    },
    {
      id: 'pp-2',
      courseCode: 'ST 210',
      courseName: 'Probability Theory I',
      year: '2023/2024',
      examType: 'University Examination (UE)',
      duration: '3 Hours',
      questionsCount: 5,
      hasSolutions: true,
      fileSize: '1.4 MB',
      sampleTopic: 'Derivation of Poisson MGF & Bivariate Normal Marginals',
    },
    {
      id: 'pp-3',
      courseCode: 'MT 220',
      courseName: 'Linear Algebra II',
      year: '2023/2024',
      examType: 'University Examination (UE)',
      duration: '3 Hours',
      questionsCount: 5,
      hasSolutions: true,
      fileSize: '950 KB',
      sampleTopic: 'Cayley-Hamilton Theorem & Jordan Canonical Form',
    },
    {
      id: 'pp-4',
      courseCode: 'ST 222',
      courseName: 'Statistical Computing',
      year: '2023/2024',
      examType: 'Practical / Lab Exam',
      duration: '2.5 Hours',
      questionsCount: 4,
      hasSolutions: true,
      fileSize: '1.1 MB',
      sampleTopic: 'R Code for Bootstrap Confidence Intervals & Monte Carlo',
    },
    {
      id: 'pp-5',
      courseCode: 'MT 201',
      courseName: 'Real Analysis I',
      year: '2022/2023',
      examType: 'University Examination (UE)',
      duration: '3 Hours',
      questionsCount: 5,
      hasSolutions: true,
      fileSize: '1.0 MB',
      sampleTopic: 'Uniform Continuity of Lipschitz Functions & Cauchy Criterion',
    },
    {
      id: 'pp-6',
      courseCode: 'ST 210',
      courseName: 'Probability Theory I',
      year: '2022/2023',
      examType: 'University Examination (UE)',
      duration: '3 Hours',
      questionsCount: 5,
      hasSolutions: false,
      fileSize: '890 KB',
      sampleTopic: 'Chebyshev Inequality & Weak Law of Large Numbers',
    },
    {
      id: 'pp-7',
      courseCode: 'MT 201',
      courseName: 'Real Analysis I',
      year: '2023/2024',
      examType: 'Continuous Assessment (CA Test 1)',
      duration: '1.5 Hours',
      questionsCount: 3,
      hasSolutions: true,
      fileSize: '650 KB',
      sampleTopic: 'Supremum property of R and Archimedean field proofs',
    },
    {
      id: 'pp-8',
      courseCode: 'ST 210',
      courseName: 'Probability Theory I',
      year: '2023/2024',
      examType: 'Continuous Assessment (CA Test 1)',
      duration: '1.5 Hours',
      questionsCount: 3,
      hasSolutions: true,
      fileSize: '720 KB',
      sampleTopic: 'Conditional probability and Bayes Rule partitioning',
    },
  ];

  const filteredPapers = pastPapersList.filter((p) => {
    const matchCourse = selectedCourse === 'All' || p.courseCode === selectedCourse;
    const matchYear = selectedYear === 'All' || p.year === selectedYear;
    return matchCourse && matchYear;
  });

  const handleDownload = (id: string) => {
    setDownloadedId(id);
    setTimeout(() => setDownloadedId(null), 2500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
            Examination Archive
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">Past Papers & Solutions</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Past Papers Archive</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Official past university examinations and continuous assessment test papers with step-by-step solutions
        </p>
      </div>

      {/* Course Filter Pills */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Filter by Course
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'MT 201', 'ST 210', 'MT 220', 'ST 222'].map((code) => (
            <button
              key={code}
              onClick={() => setSelectedCourse(code)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCourse === code
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Year Filter Pills */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Filter by Academic Year
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', '2023/2024', '2022/2023'].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedYear === yr
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Past Papers List */}
      <div className="space-y-3">
        {filteredPapers.map((paper) => (
          <div
            key={paper.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold text-sky-400 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25">
                    {paper.courseCode}
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium">{paper.courseName}</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{paper.examType}</h3>
              </div>

              <span className="text-[11px] font-mono text-sky-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md shrink-0">
                {paper.year}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Key Exam Themes
              </div>
              <p className="italic text-sky-200/90 font-mono text-[11px]">"{paper.sampleTopic}"</p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span>{paper.duration}</span>
                <span>•</span>
                <span>{paper.questionsCount} Questions</span>
                {paper.hasSolutions && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Solutions Included
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={() => handleDownload(paper.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  downloadedId === paper.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-blue-600/20 text-sky-400 hover:bg-blue-600 hover:text-white border border-blue-500/30'
                }`}
              >
                {downloadedId === paper.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ({paper.fileSize})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
