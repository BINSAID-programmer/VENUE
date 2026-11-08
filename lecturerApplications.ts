/**
 * Lecturer self-service applications.
 * A signed-in user submits a request to become a VENUE lecturer; the platform owner reviews it
 * in the Admin dashboard. Stored on the server (mirrored to Firestore by persistence.ts).
 */
import fs from 'fs';
import path from 'path';
import { saveStoreFile } from './persistence';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface LecturerApplication {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  title: string;
  phone: string;
  staffId: string;
  university: string;
  college: string;
  department: string;
  courses: string;
  note: string;
  status: ApplicationStatus;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNote?: string;
}

let dir = '';
const file = () => path.join(dir, 'lecturer_applications.json');

export function initLecturerApplications(storageDir: string) {
  dir = storageDir;
}

function readAll(): Record<string, LecturerApplication> {
  try {
    if (!fs.existsSync(file())) return {};
    return JSON.parse(fs.readFileSync(file(), 'utf-8')) || {};
  } catch {
    return {};
  }
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export function submitApplication(
  user: { uid: string; email: string },
  input: Record<string, unknown>
): { ok: true; application: LecturerApplication } | { ok: false; error: string } {
  const app: LecturerApplication = {
    id: `lapp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    uid: user.uid,
    email: user.email,
    fullName: clean(input.fullName, 100),
    title: clean(input.title, 20),
    phone: clean(input.phone, 30),
    staffId: clean(input.staffId, 40),
    university: clean(input.university, 120),
    college: clean(input.college, 120),
    department: clean(input.department, 120),
    courses: clean(input.courses, 400),
    note: clean(input.note, 400),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  if (app.fullName.length < 3) return { ok: false, error: 'Enter your full name.' };
  if (app.university.length < 2) return { ok: false, error: 'Enter your university.' };
  if (app.department.length < 2) return { ok: false, error: 'Enter your department.' };
  if (app.courses.length < 2) return { ok: false, error: 'Enter the courses you teach.' };
  if (app.phone.replace(/[^0-9]/g, '').length < 9) return { ok: false, error: 'Enter a phone number we can reach you on.' };

  const all = readAll();
  if (Object.values(all).some((a) => a.uid === user.uid && a.status === 'pending')) {
    return { ok: false, error: 'You already have an application waiting for review.' };
  }
  all[app.id] = app;
  saveStoreFile(file(), all);
  return { ok: true, application: app };
}

export function listMine(uid: string): LecturerApplication[] {
  return Object.values(readAll())
    .filter((a) => a.uid === uid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
}

export function listAll(): LecturerApplication[] {
  return Object.values(readAll())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 200);
}

export function decide(
  id: string,
  approve: boolean,
  adminUid: string,
  note?: string
): { ok: true; application: LecturerApplication } | { ok: false; error: string } {
  const all = readAll();
  const a = all[id];
  if (!a) return { ok: false, error: 'Application not found.' };
  if (a.status !== 'pending') return { ok: false, error: 'This application was already decided.' };
  a.status = approve ? 'approved' : 'rejected';
  a.decidedAt = new Date().toISOString();
  a.decidedBy = adminUid;
  if (note) a.decisionNote = clean(note, 200);
  all[id] = a;
  saveStoreFile(file(), all);
  return { ok: true, application: a };
}
