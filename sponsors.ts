/**
 * Sponsor banners shown on the Home screen. Managed by the platform owner from Admin.
 * Stored server-side (mirrored to Firestore by persistence.ts); images are small data URLs.
 */
import fs from 'fs';
import path from 'path';
import { saveStoreFile } from './persistence';

export interface Sponsor {
  id: string;
  name: string;
  title: string;
  text: string;
  imageData: string;
  linkUrl: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

let dir = '';
const file = () => path.join(dir, 'sponsors.json');

export function initSponsors(storageDir: string) {
  dir = storageDir;
}

function readAll(): Record<string, Sponsor> {
  try {
    if (!fs.existsSync(file())) return {};
    return JSON.parse(fs.readFileSync(file(), 'utf-8')) || {};
  } catch {
    return {};
  }
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const MAX_IMAGE_CHARS = 220_000; // ~160KB image

function safeUrl(v: unknown): string {
  const s = String(v ?? '').trim();
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : '';
  } catch {
    return '';
  }
}

export function isLive(s: Sponsor, now = Date.now()): boolean {
  if (!s.active) return false;
  if (s.startsAt && now < Date.parse(s.startsAt)) return false;
  if (s.endsAt && now > Date.parse(s.endsAt) + 24 * 3600 * 1000) return false;
  return true;
}

export function listPublic() {
  return Object.values(readAll())
    .filter((s) => isLive(s))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6)
    .map(({ id, name, title, text, imageData, linkUrl }) => ({ id, name, title, text, imageData, linkUrl }));
}

export function listAdmin(): Sponsor[] {
  return Object.values(readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function upsert(input: Record<string, unknown>): { ok: true; sponsor: Sponsor } | { ok: false; error: string } {
  const all = readAll();
  const existing = input.id ? all[String(input.id)] : undefined;
  const now = new Date().toISOString();
  const image = String(input.imageData ?? existing?.imageData ?? '');
  if (image && (!/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > MAX_IMAGE_CHARS)) {
    return { ok: false, error: 'Image must be a small JPEG, PNG or WebP.' };
  }
  const s: Sponsor = {
    id: existing?.id || `sp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: clean(input.name, 80),
    title: clean(input.title, 80),
    text: clean(input.text, 160),
    imageData: image,
    linkUrl: safeUrl(input.linkUrl),
    active: input.active === undefined ? existing?.active ?? true : Boolean(input.active),
    startsAt: clean(input.startsAt, 10),
    endsAt: clean(input.endsAt, 10),
    clicks: existing?.clicks || 0,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  if (s.name.length < 2) return { ok: false, error: 'Enter the sponsor name.' };
  if (!s.title && !s.imageData) return { ok: false, error: 'Add a title or an image.' };
  if (String(input.linkUrl || '').trim() && !s.linkUrl) return { ok: false, error: 'The link must start with https://' };
  all[s.id] = s;
  saveStoreFile(file(), all);
  return { ok: true, sponsor: s };
}

export function remove(id: string): boolean {
  const all = readAll();
  if (!all[id]) return false;
  delete all[id];
  saveStoreFile(file(), all);
  return true;
}

export function recordClick(id: string): string | null {
  const all = readAll();
  const s = all[id];
  if (!s || !isLive(s)) return null;
  s.clicks = (s.clicks || 0) + 1;
  saveStoreFile(file(), all);
  return s.linkUrl || null;
}
