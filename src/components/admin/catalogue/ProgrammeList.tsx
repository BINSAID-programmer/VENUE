import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Clock,
  Award,
  ChevronRight,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Building,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ProgrammeRecord, DepartmentRecord, AcademicUnitRecord } from '../../../types';
import { AddProgrammeModal } from './AddProgrammeModal';
import { EditProgrammeModal } from './EditProgrammeModal';
import { DeleteProgrammeModal } from './DeleteProgrammeModal';

interface ProgrammeListProps {
  department: DepartmentRecord;
  unit?: AcademicUnitRecord | null;
  programmes: ProgrammeRecord[];
  onSelectProgramme: (prog: ProgrammeRecord) => void;
  onBackToDepartments: () => void;
  onProgrammeCreated: (newProg: ProgrammeRecord) => void;
  onProgrammeUpdated: (updatedProg: ProgrammeRecord) => void;
  onProgrammeDeleted: (deletedId: string) => void;
}

export const ProgrammeList: React.FC<ProgrammeListProps> = ({
  department,
  unit,
  programmes,
  onSelectProgramme,
  onBackToDepartments,
  onProgrammeCreated,
  onProgrammeUpdated,
  onProgrammeDeleted,
}) => {
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<ProgrammeRecord | null>(null);
  const [deletingProg, setDeletingProg] = useState<ProgrammeRecord | null>(null);

  // Search & Filter state
  const [filterSearch, setFilterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter programmes
  const filteredProgrammes = useMemo(() => {
    return programmes.filter((prog) => {
      const q = filterSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (prog.name && prog.name.toLowerCase().includes(q)) ||
        (prog.code && prog.code.toLowerCase().includes(q)) ||
        (prog.shortName && prog.shortName.toLowerCase().includes(q)) ||
        (prog.id && prog.id.toLowerCase().includes(q));

      const isActive = prog.active !== false;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [programmes, filterSearch, statusFilter]);

  const activeCount = programmes.filter((p) => p.active !== false).length;
  const inactiveCount = programmes.length - activeCount;

  const formatDate = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-indigo-400">
              {department.id}
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              {department.name} — Programmes
            </h3>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-mono text-slate-300">
              {programmes.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Official degree and diploma curricula housed under {department.name}
            {unit?.name ? ` (${unit.name})` : ''}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Programme</span>
          </button>

          <button
            onClick={onBackToDepartments}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Departments</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Filter programmes by code, name, or slug..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          />
          {filterSearch && (
            <button
              onClick={() => setFilterSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/60 p-1 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-lg px-3 py-1 font-medium transition ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({programmes.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`rounded-lg px-3 py-1 font-medium transition ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`rounded-lg px-3 py-1 font-medium transition ${
              statusFilter === 'inactive'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Programme Cards Grid */}
      {filteredProgrammes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
          <GraduationCap className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          <h4 className="text-sm font-bold text-white">No Programmes match your query</h4>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            {filterSearch
              ? `No programmes matching "${filterSearch}" were found in ${department.name}.`
              : `No programmes are registered under ${department.name}. You can add the first one below.`}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {filterSearch && (
              <button
                onClick={() => setFilterSearch('')}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                Clear Filter
              </button>
            )}
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Programme</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProgrammes.map((prog) => {
            const isActive = prog.active !== false;
            const createdStr = formatDate(prog.createdAt);
            const updatedStr = formatDate(prog.updatedAt);
            const progCode = prog.code || prog.shortName || prog.id;

            return (
              <div
                key={prog.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-lg"
              >
                {/* Top Details */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        {prog.awardLevel || 'Bachelor Degree'}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          isActive
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {progCode}
                    </span>
                  </div>

                  <h4 className="mt-3 text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {prog.name}
                  </h4>

                  {/* Metadata Specs */}
                  <div className="mt-3 space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>Duration:</span>
                      </span>
                      <span className="text-slate-300 font-medium">
                        {prog.durationYears || 3} Years ({Number(prog.durationYears || 3) * 2} Semesters)
                      </span>
                    </div>

                    {prog.studyMode && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Study Mode:</span>
                        <span className="text-slate-300">{prog.studyMode}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="text-slate-300 truncate max-w-[140px]">
                        {department.name}
                      </span>
                    </div>

                    {unit?.name && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Academic Unit:</span>
                        <span className="text-slate-300 truncate max-w-[140px]">
                          {unit.shortName || unit.name}
                        </span>
                      </div>
                    )}

                    {createdStr && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px]">
                        <span className="text-slate-500">Created:</span>
                        <span className="text-slate-400">{createdStr}</span>
                      </div>
                    )}

                    {updatedStr && updatedStr !== createdStr && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Updated:</span>
                        <span className="text-slate-400">{updatedStr}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Toolbar */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectProgramme(prog)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-transparent py-1.5 px-3 text-xs font-semibold text-indigo-300 hover:text-white transition"
                  >
                    <span>Curriculum & Structure</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingProg(prog)}
                      className="p-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                      title="Edit Programme"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingProg(prog)}
                      className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 hover:border-rose-500/30 transition"
                      title="Delete Programme"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isAddOpen && unit && (
        <AddProgrammeModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          department={department}
          unit={unit}
          onProgrammeCreated={(newProg) => {
            onProgrammeCreated(newProg);
            setIsAddOpen(false);
          }}
        />
      )}

      {editingProg && (
        <EditProgrammeModal
          isOpen={Boolean(editingProg)}
          onClose={() => setEditingProg(null)}
          programme={editingProg}
          department={department}
          unit={unit}
          onProgrammeUpdated={(updated) => {
            onProgrammeUpdated(updated);
            setEditingProg(null);
          }}
        />
      )}

      {deletingProg && (
        <DeleteProgrammeModal
          isOpen={Boolean(deletingProg)}
          onClose={() => setDeletingProg(null)}
          programme={deletingProg}
          department={department}
          onProgrammeDeleted={(deletedId) => {
            onProgrammeDeleted(deletedId);
            setDeletingProg(null);
          }}
          onProgrammeUpdated={(updated) => {
            onProgrammeUpdated(updated);
            setDeletingProg(null);
          }}
        />
      )}
    </div>
  );
};
