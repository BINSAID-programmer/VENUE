import React, { useState } from 'react';
import {
  FolderKanban,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Edit2,
  Archive,
  Trash2,
} from 'lucide-react';
import { AcademicUnitRecord, DepartmentRecord } from '../../../types';
import { EditDepartmentModal } from './EditDepartmentModal';
import { DeleteDepartmentModal } from './DeleteDepartmentModal';

interface DepartmentListProps {
  unit: AcademicUnitRecord;
  departments: DepartmentRecord[];
  onSelectDepartment: (dept: DepartmentRecord) => void;
  onBackToUnits: () => void;
  onDepartmentUpdated?: (updated: DepartmentRecord) => void;
  onDepartmentDeleted?: (deletedId: string) => void;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({
  unit,
  departments,
  onSelectDepartment,
  onBackToUnits,
  onDepartmentUpdated,
  onDepartmentDeleted,
}) => {
  const [viewingDept, setViewingDept] = useState<DepartmentRecord | null>(null);
  const [editingDept, setEditingDept] = useState<DepartmentRecord | null>(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentRecord | null>(null);

  return (
    <div className="space-y-6">
      {/* Unit Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-400">
              {unit.shortName || unit.abbreviation || unit.id.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">• {unit.type}</span>
          </div>
          <h3 className="text-lg font-bold text-white">{unit.name}</h3>
          <p className="text-xs text-slate-400">
            Select a department below or manage existing department records ({departments.length} departments)
          </p>
        </div>

        <button
          onClick={onBackToUnits}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Academic Units</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const isArchived = Boolean(dept.archived || dept.status === 'archived');
          return (
            <div
              key={dept.id}
              className={`group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 ${
                isArchived
                  ? 'border-amber-500/20 bg-slate-900/30 opacity-80'
                  : 'border-slate-800/80 bg-slate-900/50 hover:border-indigo-500/40 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-indigo-950/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <FolderKanban className="h-4 w-4" />
                  </div>

                  {isArchived ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      <Archive className="h-3 w-3" />
                      <span>Archived</span>
                    </span>
                  ) : (
                    dept.verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Verified</span>
                      </span>
                    )
                  )}
                </div>

                <div
                  onClick={() => onSelectDepartment(dept)}
                  className="cursor-pointer"
                >
                  <h4 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {dept.name}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400">
                    Department ID: <span className="font-mono text-slate-300">{dept.id}</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingDept(dept);
                    }}
                    title="View Department Details"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDept(dept);
                    }}
                    title="Edit Department"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingDept(dept);
                    }}
                    title="Archive or Delete Department"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectDepartment(dept)}
                  className="inline-flex items-center gap-1 font-semibold text-slate-300 hover:text-indigo-400 transition"
                >
                  <span>Programmes</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform text-indigo-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {viewingDept && (
        <EditDepartmentModal
          isOpen={Boolean(viewingDept)}
          onClose={() => setViewingDept(null)}
          department={viewingDept}
          unit={unit}
          mode="view"
          onDepartmentUpdated={(d) => {
            if (onDepartmentUpdated) onDepartmentUpdated(d);
          }}
        />
      )}

      {editingDept && (
        <EditDepartmentModal
          isOpen={Boolean(editingDept)}
          onClose={() => setEditingDept(null)}
          department={editingDept}
          unit={unit}
          mode="edit"
          onDepartmentUpdated={(d) => {
            if (onDepartmentUpdated) onDepartmentUpdated(d);
          }}
        />
      )}

      {deletingDept && (
        <DeleteDepartmentModal
          isOpen={Boolean(deletingDept)}
          onClose={() => setDeletingDept(null)}
          department={deletingDept}
          onDepartmentArchived={(d) => {
            if (onDepartmentUpdated) onDepartmentUpdated(d);
          }}
          onDepartmentDeleted={(id) => {
            if (onDepartmentDeleted) onDepartmentDeleted(id);
          }}
        />
      )}
    </div>
  );
};
