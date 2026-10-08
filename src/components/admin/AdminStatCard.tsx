import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  colorScheme: 'indigo' | 'sky' | 'emerald' | 'amber' | 'purple' | 'rose' | 'teal' | 'blue';
  emptyText?: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}

const colorStyles = {
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-400',
    glow: 'group-hover:border-indigo-500/40',
    badge: 'bg-indigo-500/20 text-indigo-300',
  },
  sky: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    text: 'text-sky-400',
    glow: 'group-hover:border-sky-500/40',
    badge: 'bg-sky-500/20 text-sky-300',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'group-hover:border-emerald-500/40',
    badge: 'bg-emerald-500/20 text-emerald-300',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'group-hover:border-amber-500/40',
    badge: 'bg-amber-500/20 text-amber-300',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    glow: 'group-hover:border-purple-500/40',
    badge: 'bg-purple-500/20 text-purple-300',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    glow: 'group-hover:border-rose-500/40',
    badge: 'bg-rose-500/20 text-rose-300',
  },
  teal: {
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    text: 'text-teal-400',
    glow: 'group-hover:border-teal-500/40',
    badge: 'bg-teal-500/20 text-teal-300',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    glow: 'group-hover:border-blue-500/40',
    badge: 'bg-blue-500/20 text-blue-300',
  },
};

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  emptyText = 'No records in database',
  badge,
  badgeColor,
  onClick,
}) => {
  const styles = colorStyles[colorScheme] || colorStyles.indigo;
  const isZero = value === 0;

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border bg-slate-900/60 p-5 backdrop-blur-md transition-all duration-200 ${styles.border} ${styles.glow} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {value.toLocaleString()}
            </span>
            {badge && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  badgeColor || styles.badge
                }`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className={`rounded-xl border p-2.5 ${styles.bg} ${styles.border} ${styles.text}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 border-t border-slate-800/80 pt-3">
        {isZero ? (
          <p className="text-xs text-slate-500 italic">{emptyText}</p>
        ) : (
          <p className="text-xs text-slate-400 line-clamp-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
