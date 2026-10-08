import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Layers,
  Award,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { CourseRecord, ProgrammeRecord } from '../../../types';
import { CourseCard } from './CourseCard';
import { CatalogueEmptyState } from './CatalogueEmptyState';

interface CourseListProps {
  programme: ProgrammeRecord;
  year: number;
  semester: number;
  courses: CourseRecord[];
  onAddCourse?: () => void;
  onAssignCourse?: () => void;
  onViewCourseDetails?: (course: CourseRecord) => void;
  onEditCourse?: (course: CourseRecord) => void;
  onDeleteCourse?: (course: CourseRecord) => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  programme,
  year,
  semester,
  courses,
  onAddCourse,
  onAssignCourse,
  onViewCourseDetails,
  onEditCourse,
  onDeleteCourse,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'core' | 'elective'>('all');

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const code = (c.code || (c as any).courseCode || '').toLowerCase();
      const title = (c.title || (c as any).courseName || '').toLowerCase();
      const term = searchTerm.trim().toLowerCase();

      const matchesSearch = !term || code.includes(term) || title.includes(term);

      const status = (c.status || (c as any).courseType || '').toLowerCase();
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'core' && status === 'core') ||
        (statusFilter === 'elective' && status === 'elective');

      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  // Calculate term summary stats
  const coreCount = courses.filter(
    (c) => (c.status || (c as any).courseType || '').toLowerCase() === 'core'
  ).length;
  const electiveCount = courses.filter(
    (c) => (c.status || (c as any).courseType || '').toLowerCase() === 'elective'
  ).length;
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);

  if (courses.length === 0) {
    return (
      <div className="space-y-4">
        {/* Term Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-white">
              Year {year} • Semester {semester === 1 ? 'I' : 'II'} Courses
            </h4>
            <p className="text-xs text-slate-400">
              No courses configured yet for this term in {programme.shortName || programme.name}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onAssignCourse && (
              <button
                type="button"
                onClick={onAssignCourse}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>Assign Existing</span>
              </button>
            )}

            {onAddCourse && (
              <button
                type="button"
                onClick={onAddCourse}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Course</span>
              </button>
            )}
          </div>
        </div>

        <CatalogueEmptyState
          title="No courses configured for this term"
          message={`No courses have been assigned to ${programme.name} for Year ${year}, Semester ${semester === 1 ? 'I' : 'II'}. You can add a new course or assign existing canonical courses.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Term Summary & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800 p-4 sm:p-5 rounded-2xl backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-white">
              Year {year} • Semester {semester === 1 ? 'I' : 'II'} Courses
            </h4>
            <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold">
              {courses.length} Courses
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Authoritative curriculum offerings for {programme.shortName || programme.name}
          </p>
        </div>

        {/* Stats Pill & Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-emerald-400 font-semibold">
              {coreCount} Core
            </span>
            <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-amber-400 font-semibold">
              {electiveCount} Elective
            </span>
            <span className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-slate-300 font-bold">
              {totalCredits} Credits
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            {onAssignCourse && (
              <button
                type="button"
                onClick={onAssignCourse}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title="Assign an existing canonical course from the institutional catalogue"
              >
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>Assign Existing</span>
              </button>
            )}

            {onAddCourse && (
              <button
                type="button"
                onClick={onAddCourse}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Course</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter term courses by code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({courses.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('core')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              statusFilter === 'core'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Core ({coreCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('elective')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              statusFilter === 'elective'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Electives ({electiveCount})
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-2">
          <BookOpen className="h-6 w-6 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">
            No courses match the search filter &ldquo;{searchTerm}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="text-xs text-indigo-400 hover:underline font-semibold"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id || `${course.code}_y${year}s${semester}`}
              course={course}
              onViewDetails={onViewCourseDetails}
              onEdit={onEditCourse}
              onDelete={onDeleteCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
};
