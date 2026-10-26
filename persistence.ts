/**
 * Durable persistence for the server's JSON stores.
 *
 * Why: the server keeps profiles, announcements, audit logs, etc. in `.storage/*.json`.
 * On hosts with an ephemeral disk (Render Free) those files are wiped on every deploy or
 * restart, which produces "old data / missing data" symptoms.
 *
 * How: the JSON files stay as a fast, synchronous local cache (the rest of server.ts is
 * unchanged). Every save is mirrored to Firestore (collection `server_store`), and on boot
 * the files are rebuilt from Firestore. If Firestore credentials are not configured, the
 * server behaves exactly as before (file-only).
 *
 * Env: FIREBASE_SERVICE_ACCOUNT_JSON  (service-account JSON, raw or base64)
 *      FIRESTORE_DATABASE_ID          (optional; defaults to firebase-applet-config.json)
 */
import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, cert, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

type StoreKind = 'map' | 'array';
interface StoreDef {
  kind: StoreKind;
  shards?: number; // maps: number of shard documents
}

const COLLECTION = 'server_store';
const ARRAY_CHUNK = 100;

const STORE_DEFS: Record<string, StoreDef> = {
  'student_profiles.json': { kind: 'map', shards: 64 },
  'student_results.json': { kind: 'map', shards: 64 },
  'announcements.json': { kind: 'map', shards: 8 },
  'announcement_reads.json': { kind: 'map', shards: 64 },
  'academic_materials.json': { kind: 'map', shards: 16 },
  'audit_logs.json': { kind: 'array' },
  'analytics_events.json': { kind: 'array' },
  'ai_usage_logs.json': { kind: 'array' },
  'subscriptions.json': { kind: 'map', shards: 16 },
  'payment_requests.json': { kind: 'map', shards: 8 },
};

let firestore: Firestore | null = null;
let initError: string | null = null;
let storageDirPath = '';

// per store: last known remote doc contents (docId -> json) used to write only changes
const synced = new Map<string, Map<string, string>>();
// stores whose hydration succeeded: only these are ever written to Firestore
const ready = new Set<string>();
const pending = new Map<string, any>();
let flushTimer: NodeJS.Timeout | null = null;
let flushing: Promise<void> | null = null;
let lastError: string | null = null;
let lastFlushAt: string | null = null;

function storeName(file: string): string {
  return path.basename(file);
}

function loadDatabaseId(): string | undefined {
  if (process.env.FIRESTORE_DATABASE_ID && process.env.FIRESTORE_DATABASE_ID.trim()) {
    const envId = process.env.FIRESTORE_DATABASE_ID.trim();
    return envId === '(default)' ? undefined : envId;
  }
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
    const id = JSON.parse(raw)?.firestoreDatabaseId;
    return typeof id === 'string' && id && id !== '(default)' ? id : undefined;
  } catch {
    return undefined;
  }
}

function parseServiceAccount(): Record<string, any> | null {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();
  if (!raw) return null;
  try {
    const text = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8');
    const parsed = JSON.parse(text);
    if (parsed.private_key && typeof parsed.private_key === 'string') {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    return parsed;
  } catch (err: any) {
    initError = `FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON/base64: ${err?.message || err}`;
    return null;
  }
}

export function initPersistence(storageDir: string): void {
  storageDirPath = storageDir;
  const sa = parseServiceAccount();
  // On Google Cloud (Cloud Run) the platform provides credentials automatically (no key file needed).
  const onGoogleCloud = Boolean(process.env.K_SERVICE || process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (!sa && !onGoogleCloud) {
    if (!initError) initError = 'No Firestore credentials (set FIREBASE_SERVICE_ACCOUNT_JSON or run on Google Cloud): file-only mode';
    return;
  }
  try {
    let app: App | undefined = getApps().find((a) => a.name === 'venue-store');
    if (!app) {
      app = sa
        ? initializeApp({ credential: cert(sa as any), projectId: sa.project_id }, 'venue-store')
        : initializeApp({ credential: applicationDefault(), projectId: loadProjectId() }, 'venue-store');
    }
    const dbId = loadDatabaseId();
    firestore = dbId ? getFirestore(app, dbId) : getFirestore(app);
    firestore.settings({ ignoreUndefinedProperties: true });
  } catch (err: any) {
    firestore = null;
    initError = `Firestore init failed: ${err?.message || err}`;
  }
}

function loadProjectId(): string | undefined {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID.trim()) {
    return process.env.FIREBASE_PROJECT_ID.trim();
  }
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
    const id = JSON.parse(raw)?.projectId;
    return typeof id === 'string' && id ? id : undefined;
  } catch {
    return undefined;
  }
}

// ---------- sharding ----------

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function pad(n: number): string {
  return String(n).padStart(5, '0');
}

function toDocs(name: string, data: any): Map<string, string> {
  const def = STORE_DEFS[name];
  const docs = new Map<string, string>();
  if (def.kind === 'map') {
    const n = def.shards || 16;
    const buckets: Record<string, any>[] = Array.from({ length: n }, () => ({}));
    for (const [k, v] of Object.entries(data && typeof data === 'object' ? data : {})) {
      buckets[fnv1a(k) % n][k] = v;
    }
    buckets.forEach((b, i) => {
      if (Object.keys(b).length > 0) docs.set(`${name}__${pad(i)}`, JSON.stringify(b));
    });
  } else {
    const arr: any[] = Array.isArray(data) ? data : [];
    for (let i = 0; i < arr.length; i += ARRAY_CHUNK) {
      docs.set(`${name}__${pad(i / ARRAY_CHUNK)}`, JSON.stringify(arr.slice(i, i + ARRAY_CHUNK)));
    }
  }
  return docs;
}

function fromDocs(name: string, docs: Array<{ id: string; json: string }>): any {
  const def = STORE_DEFS[name];
  const sorted = [...docs].sort((a, b) => a.id.localeCompare(b.id));
  if (def.kind === 'map') {
    const out: Record<string, any> = {};
    for (const d of sorted) Object.assign(out, JSON.parse(d.json));
    return out;
  }
  const out: any[] = [];
  for (const d of sorted) out.push(...JSON.parse(d.json));
  return out;
}

function isEmpty(data: any): boolean {
  if (Array.isArray(data)) return data.length === 0;
  return !data || typeof data !== 'object' || Object.keys(data).length === 0;
}

// ---------- local files (atomic) ----------

function writeFileAtomic(file: string, content: string) {
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, content, 'utf-8');
  fs.renameSync(tmp, file);
}

/**
 * Save a store: writes the local file atomically and queues a mirror to Firestore.
 * Drop-in replacement for fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8').
 */
export function saveStoreFile(file: string, data: any): void {
  writeFileAtomic(file, JSON.stringify(data, null, 2));
  const name = storeName(file);
  if (!firestore || !STORE_DEFS[name] || !ready.has(name)) return;
  pending.set(name, data);
  scheduleFlush(900);
}

function scheduleFlush(ms: number) {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushPersistence();
  }, ms);
}

async function flushStore(name: string, data: any): Promise<void> {
  if (!firestore) return;
  const next = toDocs(name, data);
  const prev = synced.get(name) || new Map<string, string>();
  const batches: FirebaseFirestore.WriteBatch[] = [];
  let batch = firestore.batch();
  let count = 0;
  const push = (fn: (b: FirebaseFirestore.WriteBatch) => void) => {
    fn(batch);
    if (++count >= 400) {
      batches.push(batch);
      batch = firestore!.batch();
      count = 0;
    }
  };
  for (const [id, json] of next) {
    if (prev.get(id) !== json) {
      push((b) =>
        b.set(firestore!.collection(COLLECTION).doc(id), {
          store: name,
          json,
          updatedAt: new Date(),
        })
      );
    }
  }
  for (const id of prev.keys()) {
    if (!next.has(id)) push((b) => b.delete(firestore!.collection(COLLECTION).doc(id)));
  }
  if (count > 0) batches.push(batch);
  for (const b of batches) await b.commit();
  synced.set(name, next);
}

export async function flushPersistence(): Promise<void> {
  if (flushing) {
    await flushing;
  }
  if (!firestore || pending.size === 0) return;
  flushing = (async () => {
    const entries = Array.from(pending.entries());
    pending.clear();
    for (const [name, data] of entries) {
      try {
        await flushStore(name, data);
        lastFlushAt = new Date().toISOString();
        lastError = null;
      } catch (err: any) {
        lastError = `flush ${name}: ${err?.message || err}`;
        console.error('[persistence] flush failed:', lastError);
        if (!pending.has(name)) pending.set(name, data); // keep newest and retry
        scheduleFlush(15000);
      }
    }
  })();
  try {
    await flushing;
  } finally {
    flushing = null;
  }
}

// ---------- boot hydration ----------

async function hydrateStore(name: string): Promise<void> {
  const file = path.join(storageDirPath, name);
  const snap = await firestore!.collection(COLLECTION).where('store', '==', name).get();
  if (!snap.empty) {
    const docs = snap.docs.map((d) => ({ id: d.id, json: String(d.get('json') || '') }));
    const data = fromDocs(name, docs); // throws on corrupt remote data -> store stays paused
    writeFileAtomic(file, JSON.stringify(data, null, 2));
    synced.set(name, new Map(docs.map((d) => [d.id, d.json])));
    ready.add(name);
    return;
  }
  // Nothing remote yet: seed Firestore from the local file (one-time migration)
  synced.set(name, new Map());
  ready.add(name);
  if (fs.existsSync(file)) {
    try {
      const local = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (!isEmpty(local)) {
        pending.set(name, local);
        scheduleFlush(500);
      }
    } catch {
      /* unreadable local file: nothing to seed */
    }
  }
}

export async function hydrateFromFirestore(): Promise<void> {
  if (!firestore) return;
  if (!fs.existsSync(storageDirPath)) fs.mkdirSync(storageDirPath, { recursive: true });
  for (const name of Object.keys(STORE_DEFS)) {
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        await hydrateStore(name);
        ok = true;
      } catch (err: any) {
        lastError = `hydrate ${name} (try ${attempt}): ${err?.message || err}`;
        console.error('[persistence]', lastError);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 2000));
      }
    }
    // A store that could not be hydrated stays paused: never overwrite remote data blindly.
  }
}

// ---------- uploaded material files (Firebase Storage) ----------

const MATERIAL_PREFIX = 'server_materials/';

function materialBucket() {
  if (!firestore) return null;
  try {
    const app = getApps().find((a) => a.name === 'venue-store');
    if (!app) return null;
    let name = (process.env.FIREBASE_STORAGE_BUCKET || '').trim();
    if (!name) {
      try {
        const raw = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
        name = JSON.parse(raw)?.storageBucket || '';
      } catch {
        /* ignore */
      }
    }
    return name ? getStorage(app).bucket(name) : null;
  } catch {
    return null;
  }
}

/** Keep a durable copy of an uploaded material file. Never throws. */
export async function backupMaterialFile(relPath: string, data: Buffer, contentType?: string): Promise<void> {
  const bucket = materialBucket();
  if (!bucket) return;
  try {
    await bucket.file(MATERIAL_PREFIX + relPath).save(data, {
      contentType: contentType || 'application/octet-stream',
      resumable: false,
    });
  } catch (err: any) {
    lastError = `material backup ${relPath}: ${err?.message || err}`;
    console.error('[persistence]', lastError);
  }
}

/** Bring a material file back to local disk if it only exists in Firebase Storage. */
export async function restoreMaterialFile(relPath: string, fullPath: string): Promise<boolean> {
  const bucket = materialBucket();
  if (!bucket) return false;
  try {
    const file = bucket.file(MATERIAL_PREFIX + relPath);
    const [exists] = await file.exists();
    if (!exists) return false;
    const [buf] = await file.download();
    if (!buf || buf.length === 0) return false;
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    writeFileAtomicBuffer(fullPath, buf);
    return true;
  } catch (err: any) {
    console.error('[persistence] material restore failed', relPath, err?.message || err);
    return false;
  }
}

export async function removeMaterialBackup(relPath: string): Promise<void> {
  const bucket = materialBucket();
  if (!bucket) return;
  try {
    await bucket.file(MATERIAL_PREFIX + relPath).delete({ ignoreNotFound: true });
  } catch (err: any) {
    console.error('[persistence] material backup delete failed', relPath, err?.message || err);
  }
}

function writeFileAtomicBuffer(file: string, data: Buffer) {
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, file);
}

/** Both Firestore databases (named + "(default)") using the same service account. */
export function getFirestoreHandles(): { named: Firestore; legacyDefault: Firestore } | null {
  if (!firestore) return null;
  try {
    const app = getApps().find((a) => a.name === 'venue-store');
    if (!app) return null;
    const legacyDefault = getFirestore(app);
    try {
      legacyDefault.settings({ ignoreUndefinedProperties: true });
    } catch {
      /* already configured */
    }
    return { named: firestore, legacyDefault };
  } catch {
    return null;
  }
}

export function getPersistenceStatus() {
  return {
    mode: firestore ? 'firestore' : 'file-only',
    reason: firestore ? undefined : initError,
    syncedStores: Array.from(ready),
    pausedStores: firestore ? Object.keys(STORE_DEFS).filter((n) => !ready.has(n)) : [],
    pendingWrites: pending.size,
    lastFlushAt,
    lastError,
  };
}

// exported for tests only
export const __test = { toDocs, fromDocs };
