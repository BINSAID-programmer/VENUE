import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Code,
  Layers,
  Sparkles,
  Eye,
} from 'lucide-react';
import { Course } from '../../types';

interface ResourcesScreenProps {
  courses: Course[];
  onSelectCourse?: (course: Course) => void;
}

export const ResourcesScreen: React.FC<ResourcesScreenProps> = ({ courses, onSelectCourse }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Notes' | 'Formulae' | 'Textbooks' | 'Code'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);

  const academicResources = [
    {
      id: 'res-1',
      title: 'Heine-Borel & Metric Topology Comprehensive Summary',
      courseCode: 'MT 201',
      category: 'Notes',
      fileSize: '3.4 MB',
      format: 'PDF',
      updated: '2 days ago',
      downloads: 142,
      description: 'Step-by-step proofs of compactness, open covers, sequential compactness, and Bolzano-Weierstrass.',
    },
    {
      id: 'res-2',
      title: 'Probability Distributions & Moment Generating Functions Quick Reference',
      courseCode: 'ST 210',
      category: 'Formulae',
      fileSize: '1.8 MB',
      format: 'PDF',
      updated: '1 week ago',
      downloads: 289,
      description: 'Tables of PMF/PDF, MGF, expectation, variance, and Jacobian transformation formulas for bivariate distributions.',
    },
    {
      id: 'res-3',
      title: 'Linear Algebra Done Right (Reference Notes & Summaries)',
      courseCode: 'MT 220',
      category: 'Textbooks',
      fileSize: '8.2 MB',
      format: 'PDF',
      updated: '2 weeks ago',
      downloads: 98,
      description: 'Chapter-by-chapter summaries covering invariant subspaces, spectral theorems, and SVD decomposition.',
    },
    {
      id: 'res-4',
      title: 'R Script: Monte Carlo Simulation & Bootstrapping Lab Handout',
      courseCode: 'ST 222',
      category: 'Code',
      fileSize: '450 KB',
      format: 'R / Rmd',
      updated: '3 days ago',
      downloads: 165,
      description: 'Complete reproducible scripts for random sampling, empirical distribution functions, and ggplot2 visualizers.',
    },
    {
      id: 'res-5',
      title: 'Python NumPy & Pandas Statistical Analysis Cheatsheet',
      courseCode: 'ST 222',
      category: 'Code',
      fileSize: '620 KB',
      format: 'IPYNB',
      updated: 'May 28',
      downloads: 210,
      description: 'Matrix operations, vectorized calculations, hypothesis testing with scipy.stats, and seaborn plotting.',
    },
    {
      id: 'res-6',
      title: 'Riemann-Stieltjes Integrability Criteria and Proof Handbook',
      courseCode: 'MT 201',
      category: 'Notes',
      fileSize: '2.9 MB',
      format: 'PDF',
      updated: 'June 01',
      downloads: 87,
      description: 'Darboux sums, refinement of partitions, monotonic functions integrability, and fundamental theorem proofs.',
    },
    {
      id: 'res-7',
      title: 'Multivariate Normal Distribution & Covariance Matrix Handbook',
      courseCode: 'ST 210',
      category: 'Formulae',
      fileSize: '1.5 MB',
      format: 'PDF',
      updated: 'June 04',
      downloads: 190,
      description: 'Eigenvalue properties of covariance matrices, contour ellipses, and conditional bivariate normal equations.',
    },
  ];

  const filtered = academicResources.filter((r) => {
    const matchesTab = activeTab === 'All' || r.category === activeTab;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleDownload = (id: string) => {
    setDownloadedItem(id);
    setTimeout(() => {
      setDownloadedItem(null);
    }, 2500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
            Academic Repository
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">CoNAS Mathematics & Statistics</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Academic Resources</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Curated course notes, formula cheatsheets, reference handbooks, and computational labs
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by theorem, formula, course code (e.g. MT 201, ST 210)..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Notes', 'Formulae', 'Textbooks', 'Code'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab === 'All' ? 'All Resources' : tab}
          </button>
        ))}
      </div>

      {/* Resources List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-extrabold text-sky-400 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25">
                    {item.courseCode}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-md bg-slate-800">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-500">{item.fileSize}</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
              </div>

              <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/50 shrink-0">
                {item.format}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] text-slate-500">
              <span>Updated {item.updated} • {item.downloads} downloads</span>

              <button
                onClick={() => handleDownload(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  downloadedItem === item.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-blue-600/20 text-sky-400 hover:bg-blue-600 hover:text-white border border-blue-500/30'
                }`}
              >
                {downloadedItem === item.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved Offline</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
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
