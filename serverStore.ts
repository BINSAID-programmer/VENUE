/**
 * VENUE durable server storage.
 *
 * The server keeps its working data in local JSON files under `.storage/`.
 * On hosts with an ephemeral disk (e.g. Render Free) those files vanish on every
 * restart/redeploy, which makes the app alternate between "old" and "correct" data.
 *
 * This module mirrors those files to Firestore (JSON stores) and Firebase Storage
 * (uploaded material files) and restores them on boot, so the data survives restarts.
 *
 * It is a pure add-on: when no service account is configured it does nothing and
 * the server behaves exactly as before (see `getDurableStatus()` / /api/health).
 *
 * Required env var on the host (one of):
 *   FIREBASE_SERVICE_ACCOUNT_JSON    the service-account JSON (raw or base64)
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const STORE_COLLECTION = 'venue_server_store';
const BINARY_PREFIX = 'server_store/';
const CHUNK_CHARS = 240_000; // stays under Firestore's 1 MiB doc limit even for multi-byte text
const STORAGE_DIR = path.join(process.cwd(), '.storage');

let db: Firestore | null = null;
let app: App | null = null;
let bucketName = '';
let initError = '';
let lastHydrate: { ok: boolean; restored: string[]; migrated: string[]; files: number; at: string; error?: string } | null = null;
const lastFlushError: Record<string, string> = {};

interface Pending {
  content: string;
  timer: NodeJS.Timeout | null;
  delayMs: number;
}
const pending = new Map<string, Pending>();
const writtenHash = new Map<string, string>(); // name -> hash of last mirrored content
const writtenChunkHashes = new Map<string, string[]>(); // name -> per-chunk hashes
let flushChain: Promise<void> = Promise.resolve();

function sha(s: string): string {
  return crypto.createHash('sha1').update(s).digest('hex');
}

function parseServiceAccount(): Record<string, any> | null {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();
  if (!raw) return null;
  try {
    const text = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8');
    const json = JSON.parse(text);
    if (json && typeof json.private_key === 'string') {
      json.private_key = json.private_key.replace(/\\n/g, '\n');
    }
    return json;
  } catch (err: any) {
    initError = `FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON/base64: ${err?.message || err}`;
    return null;
  }
}

export function initDurableStore(opts: { projectId: string; firestoreDatabaseId?: string; storageBucket?: string }): boolean {
  if (db) return true;
  const sa = parseServiceAccount();
  if (!sa) {
    if (!initError) initError = 'FIREBASE_SERVICE_ACCOUNT_JSON is not set';
    return false;
  }
  try {
    bucketName = opts.storageBucket || '';
    const existing = getApps().find((a) => a.name === 'venue-durable-store');
    app =
      existing ||
      initializeApp(
        { credential: cert(sa as any), projectId: opts.projectId || sa.project_id, storageBucket: bucketName || undefined },
        'venue-durable-store'
      );
    db =
      opts.firestoreDatabaseId && opts.firestoreDatabaseId !== '(default)'
        ? getFirestore(app, opts.firestoreDatabaseId)
        : getFirestore(app);
    initError = '';
    return true;
  } catch (err: any) {
    initError = `Durable store init failed: ${err?.message || err}`;
    db = null;
    return false;
  }
}

export function isDurableStoreReady(): boolean {
  return Boolean(db);
}

export function getDurableStatus() {
  return {
    enabled: Boolean(db),
    reason: db ? undefined : initError || 'not initialised',
    lastHydrate,
    pendingFlushes: pending.size,
    flushErrors: Object.keys(lastFlushError).length ? lastFlushError : undefined,
  };
}

// ---------------------------------------------------------------------------
// JSON stores  <->  Firestore (chunked documents)
// ---------------------------------------------------------------------------

function splitChunks(content: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < content.length; i += CHUNK_CHARS) out.push(content.slice(i, i + CHUNK_CHARS));
  return out.length ? out : [''];
}

async function flushStore(name: string, content: string): Promise<void> {
  if (!db) return;
  const hash = sha(content);
  if (writtenHash.get(name) === hash) return;

  const chunks = splitChunks(content);
  const hashes = chunks.map(sha);
  const prev = writtenChunkHashes.get(name) || [];
  const col = db.collection(STORE_COLLECTION);

  // 1) write only the chunks that changed
  for (let i = 0; i < chunks.length; i++) {
    if (prev[i] === hashes[i]) continue;
    await col.doc(`${name}__${i}`).set({ name, index: i, data: chunks[i], hash: hashes[i] });
  }
  // 2) commit marker (readers trust meta only)
  await col.doc(`${name}__meta`).set({
    name,
    total: chunks.length,
    hash,
    length: content.length,
    updatedAt: Date.now(),
  });
  // 3) drop leftover chunks from a previously larger value
  for (let i = chunks.length; i < prev.length; i++) {
    await col.doc(`${name}__${i}`).delete().catch(() => undefined);
  }
  writtenHash.set(name, hash);
  writtenChunkHashes.set(name, hashes);
  delete lastFlushError[name];
}

function enqueueFlush(name: string) {
  const p = pending.get(name);
  if (!p) return;
  const content = p.content;
  if (p.timer) clearTimeout(p.timer);
  pending.delete(name);
  flushChain = flushChain
    .then(() => flushStore(name, content))
    .catch((err: any) => {
      lastFlushError[name] = err?.message || String(err);
      console.error(`[durable-store] flush failed for ${name}:`, err?.message || err);
      // retry later with the newest content that we still hold
      if (!pending.has(name)) scheduleJson(name, content, 15_000);
    });
}

/** Mirror a JSON store file's content to Firestore (debounced, coalesced per store). */
export function scheduleJson(name: string, content: string, delayMs = 2_000): void {
  if (!db) return;
  const existing = pending.get(name);
  if (existing?.timer) clearTimeout(existing.timer);
  const entry: Pending = { content, timer: null, delayMs };
  entry.timer = setTimeout(() => enqueueFlush(name), delayMs);
  if (typeof entry.timer.unref === 'function') entry.timer.unref();
  pending.set(name, entry);
}

/** Flush everything immediately (used on shutdown). */
export async function flushAllNow(timeoutMs = 8_000): Promise<void> {
  if (!db) return;
  for (const name of Array.from(pending.keys())) enqueueFlush(name);
  await Promise.race([flushChain, new Promise<void>((r) => setTimeout(r, timeoutMs))]);
}

async function readRemoteStore(name: string): Promise<{ content: string; updatedAt: number } | null> {
  if (!db) return null;
  const col = db.collection(STORE_COLLECTION);
  const meta = await col.doc(`${name}__meta`).get();
  if (!meta.exists) return null;
  const m = meta.data() as any;
  const parts: string[] = [];
  for (let i = 0; i < m.total; i++) {
    const d = await col.doc(`${name}__${i}`).get();
    if (!d.exists) throw new Error(`chunk ${i}/${m.total} of "${name}" is missing`);
    parts.push((d.data() as any).data as string);
  }
  const content = parts.join('');
  if (sha(content) !== m.hash) throw new Error(`checksum mismatch for "${name}"`);
  writtenHash.set(name, m.hash);
  writtenChunkHashes.set(name, parts.map(sha));
  return { content, updatedAt: Number(m.updatedAt) || 0 };
}

// ---------------------------------------------------------------------------
// Binary material files  <->  Firebase Storage
// ---------------------------------------------------------------------------

function bucket() {
  if (!app) throw new Error('durable store not initialised');
  return bucketName ? getStorage(app).bucket(bucketName) : getStorage(app).bucket();
}

export function uploadBinary(relPath: string, buffer: Buffer, contentType?: string): void {
  if (!db) return;
  const key = BINARY_PREFIX + relPath.replace(/^\/+/, '');
  bucket()
    .file(key)
    .save(buffer, { contentType: contentType || 'application/octet-stream', resumable: false })
    .catch((err: any) => {
      lastFlushError[`file:${relPath}`] = err?.message || String(err);
      console.error('[durable-store] file upload failed:', relPath, err?.message || err);
    });
}

export function deleteBinary(relPath: string): void {
  if (!db) return;
  const key = BINARY_PREFIX + relPath.replace(/^\/+/, '');
  bucket()
    .file(key)
    .delete({ ignoreNotFound: true })
    .catch((err: any) => console.error('[durable-store] file delete failed:', relPath, err?.message || err));
}

// ---------------------------------------------------------------------------
// Boot: restore from Firestore / Storage (and migrate pre-existing local data once)
// ---------------------------------------------------------------------------

/**
 * @param stores  map of store name -> absolute local file path
 */
export async function hydrateOnBoot(stores: Record<string, string>): Promise<void> {
  if (!db) return;
  const restored: string[] = [];
  const migrated: string[] = [];
  let files = 0;
  try {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    for (const [name, file] of Object.entries(stores)) {
      const remote = await readRemoteStore(name);
      const localExists = fs.existsSync(file);
      if (remote) {
        const localTime = localExists ? fs.statSync(file).mtimeMs : 0;
        if (!localExists || remote.updatedAt > localTime) {
          fs.writeFileSync(file, remote.content, 'utf-8');
          restored.push(name);
        }
      } else if (localExists) {
        // first run with durable storage: upload what this server already has
        const local = fs.readFileSync(file, 'utf-8');
        await flushStore(name, local);
        migrated.push(name);
      }
    }

    // material files
    const [list] = await bucket().getFiles({ prefix: BINARY_PREFIX });
    for (const f of list) {
      const rel = f.name.slice(BINARY_PREFIX.length);
      if (!rel || rel.endsWith('/')) continue;
      const target = path.resolve(STORAGE_DIR, rel);
      if (!target.startsWith(STORAGE_DIR + path.sep)) continue; // never write outside .storage
      if (fs.existsSync(target)) continue;
      fs.mkdirSync(path.dirname(target), { recursive: true });
      const [buf] = await f.download();
      fs.writeFileSync(target, buf);
      files++;
    }
    lastHydrate = { ok: true, restored, migrated, files, at: new Date().toISOString() };
    console.log(`[durable-store] boot restore ok: restored=${restored.join(',') || '-'} migrated=${migrated.join(',') || '-'} files=${files}`);
  } catch (err: any) {
    lastHydrate = { ok: false, restored, migrated, files, at: new Date().toISOString(), error: err?.message || String(err) };
    console.error('[durable-store] boot restore FAILED (continuing with local files):', err?.message || err);
  }
}

export function installShutdownFlush(): void {
  let running = false;
  const handler = async (sig: string) => {
    if (running) return;
    running = true;
    console.log(`[durable-store] ${sig}: flushing pending data…`);
    try {
      await flushAllNow();
    } finally {
      process.exit(0);
    }
  };
  process.once('SIGTERM', () => void handler('SIGTERM'));
  process.once('SIGINT', () => void handler('SIGINT'));
}
