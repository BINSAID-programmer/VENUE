import React from 'react';
import { BadgeCheck } from 'lucide-react';

export interface UploaderInfo {
  label: string;
  badge: string | null;
}

/** Who shared a material and the verification badge it earns. Never exposes e-mail addresses. */
export function getUploaderInfo(m: any): UploaderInfo {
  const role = String(m?.uploaderRole || m?.uploadedBy?.role || '').toLowerCase();
  const name = typeof m?.uploadedBy === 'object' ? String(m.uploadedBy?.name || '').trim() : '';

  if (role === 'lecturer' || m?.lecturerId) {
    return { label: name || 'Course Lecturer', badge: 'Verified Lecturer' };
  }
  if (role === 'student') {
    const first = name.split(' ')[0];
    return { label: first ? `Student · ${first}` : 'Student contributor', badge: m?.verified ? 'Reviewed & verified' : null };
  }
  if (role === 'admin' || role === 'super_admin') {
    return { label: name || 'VENUE Team', badge: 'VENUE Official' };
  }
  return { label: name || 'University Repository', badge: null };
}

export const VerifiedBadge: React.FC<{ text: string | null; className?: string }> = ({ text, className = '' }) =>
  text ? (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 ${className}`}
    >
      <BadgeCheck className="w-3 h-3" />
      {text}
    </span>
  ) : null;
