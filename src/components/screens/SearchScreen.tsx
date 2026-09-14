import React, { useState } from 'react';
import {
  Search as SearchIcon,
  BookOpen,
  Sparkles,
  FileText,
  HelpCircle,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { Course, ScreenId } from '../../types';

interface SearchScreenProps {
  courses: Course[];
  onNavigate: (screen: ScreenId) => void;
  onSelectCourse: (course: Course) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ courses, onNavigate, onSelectCourse }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Courses' | 'Theorems' | 'Exams' | 'Formulae'>('All');

  const popularSearches = [
    'Heine-Borel Theorem',
    'Poisson MGF',
    'MT 201 Past Papers',
    'Gram-Schmidt Orthonormalization',
    'ST 222 R Markdown',
    'Eigenvalues & Eigenvectors',
    'Riemann-Stieltjes Integrability',
    'HESLB Loan Disbursement',
  ];

  const searchableItems = [
    {
      id: 's1',
      title: 'Real Analysis I (MT 201)',
      category: 'Courses',
      description: 'Department of Mathematics • Metric Spaces, Sequences, Compactness & Integration',
      target: 'courses' as ScreenId,
      courseCode: 'MT 201',
    },
    {
      id: 's2',
      title: 'Probability Theory I (ST 210)',
      category: 'Courses',
      description: 'Department of Statistics • Probability Spaces, Continuous RVs, Transformations & MGFs',
      target: 'courses' as ScreenId,
      courseCode: 'ST 210',
    },
    {
      id: 's3',
      title: 'Linear Algebra II (MT 220)',
      category: 'Courses',
      description: 'Department of Mathematics • Vector Spaces, Linear Maps, SVD, Cayley-Hamilton',
      target: 'courses' as ScreenId,
      courseCode: 'MT 220',
    },
    {
      id: 's4',
      title: 'Statistical Computing with R & Python (ST 222)',
      category: 'Courses',
      description: 'Department of Statistics • Data wrangling, Monte Carlo simulation, Bootstrapping',
      target: 'courses' as ScreenId,
      courseCode: 'ST 222',
    },
    {
      id: 's5',
      title: 'Heine-Borel Theorem & Compact Sets Proof',
      category: 'Theorems',
      description: 'A subset of R^n is compact if and only if it is closed and bounded. Complete proof.',
      target: 'flashcards' as ScreenId,
    },
    {
      id: 's6',
      title: 'Central Limit Theorem & Weak Law of Large Numbers',
      category: 'Theorems',
      description: 'Characteristic function proof of asymptotic normality for i.i.d random variables.',
      target: 'ai-tutor' as ScreenId,
    },
    {
      id: 's7',
      title: '2023/2024 University Examination MT 201',
      category: 'Exams',
      description: 'Official 3-hour examination paper with complete solutions and Darboux proofs.',
      target: 'past-papers' as ScreenId,
    },
    {
      id: 's8',
      title: 'Moment Generating Function (MGF) of Continuous Distributions',
      category: 'Formulae',
      description: 'Formula sheet covering Normal, Exponential, Gamma, Beta, and Poisson distributions.',
      target: 'resources' as ScreenId,
    },
  ];

  const results = searchableItems.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesQuery =
      query.trim() === '' ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleResultClick = (item: typeof searchableItems[0]) => {
    if (item.courseCode) {
      const match = courses.find((c) => c.code === item.courseCode);
      if (match) {
        onSelectCourse(match);
        return;
      }
    }
    onNavigate(item.target);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      {/* Search Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Search VENUE</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Find syllabus topics, theorems, past examinations, flashcards, and resources
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="global-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search theorems, proofs, courses, exam years..."
          className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-lg"
          autoFocus
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Courses', 'Theorems', 'Exams', 'Formulae'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Suggested Terms if Query Empty */}
      {query.trim() === '' && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Popular Student Inquiries</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-slate-400">
          Results ({results.length})
        </div>

        {results.map((item) => (
          <button
            key={item.id}
            onClick={() => handleResultClick(item)}
            className="w-full p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="pr-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold text-sky-400 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25">
                  {item.category}
                </span>
                <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                  {item.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">{item.description}</p>
            </div>

            <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-blue-600/30 flex items-center justify-center text-slate-400 group-hover:text-sky-300 transition-all shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
