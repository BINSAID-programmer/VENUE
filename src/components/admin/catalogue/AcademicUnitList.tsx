import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  Landmark,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Eye,
  Edit2,
  Archive,
  Trash2,
} from 'lucide-react';
import { AcademicUnitRecord, AcademicUnitType } from '../../../types';
import { EditAcademicUnitModal } from './EditAcademicUnitModal';
import { DeleteAcademicUnitModal } from './DeleteAcademicUnitModal';

interface AcademicUnitListProps {
  units: AcademicUnitRecord[];
  onSelectUnit: (unit: AcademicUnitRecord) => void;
  onUnitUpdated?: (updated: AcademicUnitRecord) => void;
  onUnitDeleted?: (deletedId: string) => void;
}

const TYPE_GROUPS: { type: AcademicUnitType; label: string; icon: React.ElementType; badgeColor: string }[] = [
  {
    type: 'College',
    label: 'Colleges',
    icon: Landmark,
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  {
    type: 'Constituent College',
    label: 'Constituent Colleges',
    icon: GraduationCap,
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    type: 'School',
    label: 'Schools',
    icon: BookOpen,
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  {
    type: 'Institute',
    label: 'Institutes',
    icon: Building2,
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    type: 'Centre',
    label: 'Centres',
    icon: Building2,
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
];

export const AcademicUnitList: React.FC<AcademicUnitListProps> = ({
  units,
  onSelectUnit,
  onUnitUpdated,
  onUnitDeleted,
}) => {
  const [viewingUnit, setViewingUnit] = useState<AcademicUnitRecord | null>(null);
  const [editingUnit, setEditingUnit] = useState<AcademicUnitRecord | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<AcademicUnitRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  const filteredUnits = units.filter((u) => {
    const isArchived = Boolean(u.archived || u.status === 'archived');
    if (statusFilter === 'active') return !isArchived;
    if (statusFilter === 'archived') return isArchived;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="text-xs text-slate-400">
          Showing <strong className="text-white">{filteredUnits.length}</strong> of{' '}
          <strong className="text-white">{units.length}</strong> Academic Units
        </div>
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 p-1 border border-slate-800 self-start sm:self-auto">
          {(['all', 'active', 'archived'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition ${
                statusFilter === f
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {TYPE_GROUPS.map((group) => {
        const groupUnits = filteredUnits.filter((u) => u.type === group.type);
        if (groupUnits.length === 0) return null;

        const GroupIcon = group.icon;

        return (
          <div key={group.type} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg border ${group.badgeColor}`}>
                  <GroupIcon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  {group.label}
                </h3>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                  {groupUnits.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupUnits.map((unit) => {
                const isArchived = Boolean(unit.archived || unit.status === 'archived');
                return (
                  <div
                    key={unit.id}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 ${
                      isArchived
                        ? 'border-amber-500/20 bg-slate-900/30 opacity-80'
                        : 'border-slate-800/80 bg-slate-900/50 hover:border-indigo-500/40 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-indigo-950/20'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide ${group.badgeColor}`}
                        >
                          {unit.shortName || unit.abbreviation || unit.id.toUpperCase()}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isArchived ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              <Archive className="h-3 w-3" />
                              <span>Archived</span>
                            </span>
                          ) : (
                            unit.verified && (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                                title="Official Verified Academic Unit"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Verified</span>
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <div
                        onClick={() => onSelectUnit(unit)}
                        className="cursor-pointer"
                      >
                        <h4 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                          {unit.name}
                        </h4>
                        <p className="mt-1 text-xs text-slate-400">
                          {unit.type} • {unit.academicYear || '2025/2026'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs">
                      {/* CRUD Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingUnit(unit);
                          }}
                          title="View Academic Unit Details"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingUnit(unit);
                          }}
                          title="Edit Academic Unit"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingUnit(unit);
                          }}
                          title="Archive or Delete Academic Unit"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectUnit(unit)}
                        className="inline-flex items-center gap-1 font-semibold text-slate-300 hover:text-indigo-400 transition"
                      >
                        <span>Departments</span>
                        <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform text-indigo-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {viewingUnit && (
        <EditAcademicUnitModal
          isOpen={Boolean(viewingUnit)}
          onClose={() => setViewingUnit(null)}
          unit={viewingUnit}
          mode="view"
          onUnitUpdated={(u) => {
            if (onUnitUpdated) onUnitUpdated(u);
          }}
        />
      )}

      {editingUnit && (
        <EditAcademicUnitModal
          isOpen={Boolean(editingUnit)}
          onClose={() => setEditingUnit(null)}
          unit={editingUnit}
          mode="edit"
          onUnitUpdated={(u) => {
            if (onUnitUpdated) onUnitUpdated(u);
          }}
        />
      )}

      {deletingUnit && (
        <DeleteAcademicUnitModal
          isOpen={Boolean(deletingUnit)}
          onClose={() => setDeletingUnit(null)}
          unit={deletingUnit}
          onUnitArchived={(u) => {
            if (onUnitUpdated) onUnitUpdated(u);
          }}
          onUnitDeleted={(id) => {
            if (onUnitDeleted) onUnitDeleted(id);
          }}
        />
      )}
    </div>
  );
};
