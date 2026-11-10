/**
 * Opportunities posted by the platform owner (internships, attachments, jobs, scholarships...).
 * Shown to students in Scholarships / Opportunities. Stored server-side, mirrored to Firestore.
 */
import fs from 'fs';
import path from 'path';
import { saveStoreFile } from './persistence';

export const OPP_TYPES = ['Internship', 'Attachment', 'Job', 'Scholarship', 'Fellowship', 'Training', 'Competition'] as const;
export const OPP_FUNDING = ['Paid / Stipend', 'Fully Funded', 'Partially Funded', 'Unpaid / Experience', 'Training / Certificate'] as const;
export const OPP_REGIONS = ['Tanzania', 'Africa', 'International'] as const;

export interface PostedOpportunity {
  id: string;
  title: string;
  organization: string;
  type: string;
  location: string;
  regionScope: string;
  fundingType: string;
  benefit: string;
  deadline: string; // YYYY-MM-DD or ''
  description: string;
  eligibility: string;
  applyUrl: string;
  featured: boolean;
  active: boolean;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

let dir = '';
const file = () => path.join(dir, 'opportunities.json');

export function initOpportunities(storageDir: string) {
  dir = storageDir;
}

function readAll(): Record<string, PostedOpportunity> {
  try {
    if (!fs.existsSync(file())) return {};
    return JSON.parse(fs.readFileSync(file(), 'utf-8')) || {};
  } catch {
    return {};
  }
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const oneOf = <T extends readonly string[]>(list: T, v: unknown, fallback: T[number]): T[number] =>
  (list as readonly string[]).includes(String(v)) ? String(v) : fallback;

function safeUrl(v: unknown): string {
  try {
    const u = new URL(String(v ?? '').trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : '';
  } catch {
    return '';
  }
}

const isOpen = (o: PostedOpportunity, now = Date.now()) => {
  if (!o.active) return false;
  if (o.deadline && now > Date.parse(o.deadline) + 24 * 3600 * 1000) return false;
  return true;
};

export function listPublic(): PostedOpportunity[] {
  return Object.values(readAll())
    .filter((o) => isOpen(o))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 100);
}

export function listAdmin(): PostedOpportunity[] {
  return Object.values(readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function upsert(input: Record<string, unknown>): { ok: true; item: PostedOpportunity } | { ok: false; error: string } {
  const all = readAll();
  const existing = input.id ? all[String(input.id)] : undefined;
  const now = new Date().toISOString();
  const deadline = clean(input.deadline, 10);
  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return { ok: false, error: 'Deadline must be a date.' };
  const item: PostedOpportunity = {
    id: existing?.id || `opp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: clean(input.title, 140),
    organization: clean(input.organization, 100),
    type: oneOf(OPP_TYPES, input.type, 'Internship'),
    location: clean(input.location, 100) || 'Tanzania',
    regionScope: oneOf(OPP_REGIONS, input.regionScope, 'Tanzania'),
    fundingType: oneOf(OPP_FUNDING, input.fundingType, 'Unpaid / Experience'),
    benefit: clean(input.benefit, 200),
    deadline,
    description: clean(input.description, 800),
    eligibility: clean(input.eligibility, 500),
    applyUrl: safeUrl(input.applyUrl),
    featured: Boolean(input.featured),
    active: input.active === undefined ? existing?.active ?? true : Boolean(input.active),
    clicks: existing?.clicks || 0,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  if (item.title.length < 3) return { ok: false, error: 'Enter a title.' };
  if (item.organization.length < 2) return { ok: false, error: 'Enter the organisation.' };
  if (!item.applyUrl) return { ok: false, error: 'Add an application link starting with https://' };
  all[item.id] = item;
  saveStoreFile(file(), all);
  return { ok: true, item };
}

export function remove(id: string): boolean {
  const all = readAll();
  if (!all[id]) return false;
  delete all[id];
  saveStoreFile(file(), all);
  return true;
}

export function recordClick(id: string) {
  const all = readAll();
  if (!all[id]) return;
  all[id].clicks = (all[id].clicks || 0) + 1;
  saveStoreFile(file(), all);
}
