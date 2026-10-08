import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  BookOpen,
  FileText,
  Sparkles,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { Course, ScreenId, StudentProfile, AcademicMaterialRecord } from '../../types';
import { studentMaterialsService } from '../../services/studentMaterialsService';

interface SearchScreenProps {
  courses: Course[];
  profile?: StudentProfile;
  onNavigate: (screen: ScreenId) => void;
  onSelectCourse: (course: Course) => void;
  onBack: () => void;
  onOpenMaterialViewer?: (material: AcademicMaterialRecord) => void;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Course' | 'Material' | 'Past Paper';
  course?: Course;
  material?: AcademicMaterialRecord;
  targetScreen: ScreenId;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  courses,
  profile,
  onNavigate,
  onSelectCourse,
  onBack,
  onOpenMaterialViewer,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Course' | 'Material' | 'Past Paper'>('ALL');
  const [realMaterials, setRealMaterials] = useState<AcademicMaterialRecord[]>([]);

  useEffect(() => {
    let mounted = true;
    studentMaterialsService
      .getStudentCourseMaterials(profile)
      .then((items) => {
        if (mounted) setRealMaterials(items);
      })
      .catch(() => {
        if (mounted) setRealMaterials([]);
      });
    return () => {
      mounted = false;
    };
  }, [profile?.universityId, profile?.programmeId, profile?.yearOfStudy, profile?.semester]);

  const popularQueries = useMemo(() => {
    const suggestions: string[] = [];
    courses.slice(0, 4).forEach((c) => {
      if (c.code) suggestions.push(c.code);
    });
    realMaterials.slice(0, 2).forEach((m) => {
      if (m.title) suggestions.push(m.title);
    });
    return suggestions;
  }, [courses, realMaterials]);

  const allItems: SearchItem[] = useMemo(() => {
    const courseItems: SearchItem[] = courses.map((c) => {
      const lec =
        c.instructor?.name &&
        c.instructor.name !== 'Lecturer Not Assigned' &&
        c.instructor.name !== 'Faculty Instructor' &&
        c.instructor.name !== 'Faculty Academic Staff'
          ? c.instructor.name
          : 'Lecturer Not Assigned';
      return {
        id: `course-${c.id}`,
        title: `${c.code}: ${c.title || c.name}`,
        subtitle: `${c.credits} Credits • ${lec} • ${c.department || 'Academic Department'}`,
        category: 'Course',
        course: c,
        targetScreen: 'course-detail',
      };
    });

    const materialItems: SearchItem[] = realMaterials.map((m) => ({
      id: `mat-${m.id}`,
      title: m.title,
      subtitle: `${m.courseCode} • ${m.materialType} • ${m.fileSize || 'Document'}`,
      category: m.materialType === 'Past Papers' ? 'Past Paper' : 'Material',
      material: m,
      targetScreen: m.materialType === 'Past Papers' ? 'past-papers' : 'resources',
    }));

    return [...courseItems, ...materialItems];
  }, [courses, realMaterials]);

  const filteredItems = allItems.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesQuery =
      query.trim() === '' ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleItemClick = (item: SearchItem) => {
    if (item.course) {
      onSelectCourse(item.course);
      onNavigate('course-detail');
    } else if (item.material && onOpenMaterialViewer) {
      onOpenMaterialViewer(item.material);
    } else {
      onNavigate(item.targetScreen);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          id="search-back-btn"
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-sky-400" />
            <span>Search Academic Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Find your real courses, uploaded handouts, notes, and past papers
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, course codes, or uploaded materials..."
            className="w-full bg-slate-900 border border-slate-700/80 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['ALL', 'Course', 'Material', 'Past Paper'] as const).map((cat) => (
            <button
              key={cat}
              id={`search-cat-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Results' : `${cat}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Queries from Real Courses */}
      {query.trim() === '' && popularQueries.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Your Courses & Materials
          </span>
          <div className="flex flex-wrap gap-1.5">
            {popularQueries.map((pq) => (
              <button
                key={pq}
                onClick={() => setQuery(pq)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-sky-300 transition-colors cursor-pointer"
              >
                {pq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            id={`search-result-${item.id}`}
            onClick={() => handleItemClick(item)}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  item.category === 'Course'
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : item.category === 'Past Paper'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {item.category === 'Course' ? (
                  <GraduationCap className="w-5 h-5" />
                ) : item.category === 'Past Paper' ? (
                  <FileText className="w-5 h-5" />
                ) : (
                  <BookOpen className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    {item.category}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-300">
              {query.trim()
                ? `No matching results for "${query}"`
                : 'No courses or materials available yet'}
            </p>
            <p className="text-xs text-slate-500">
              Want custom explanations on any university topic? Ask the VENUE AI Tutor directly.
            </p>
            <button
              onClick={() => onNavigate('ai-tutor')}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
