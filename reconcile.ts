/**
 * One-time helper to line up the two Firestore databases the app has been using:
 * the named database (ai-studio-...) and the legacy "(default)" one.
 *
 * Controlled by env DB_RECONCILE:
 *   report  -> read-only comparison, results are logged and kept at /api/health
 *   apply   -> additionally COPIES documents that exist only in "(default)" into the named
 *              database. It never overwrites and never deletes anything.
 * Documents that exist in both but differ are only reported (ids listed in the log).
 */
import { getFirestoreHandles } from './persistence';

export interface CollectionReport {
  collection: string;
  defaultCount: number;
  namedCount: number;
  onlyDefault: number;
  onlyNamed: number;
  same: number;
  differ: number;
  copied: number;
  hasSubcollections: boolean;
  differIds: string[];
}

export interface ReconcileSummary {
  mode: 'report' | 'apply';
  startedAt: string;
  finishedAt?: string;
  error?: string;
  collections: CollectionReport[];
}

let lastSummary: ReconcileSummary | null = null;

export function getReconcileStatus() {
  if (!lastSummary) return null;
  return {
    mode: lastSummary.mode,
    startedAt: lastSummary.startedAt,
    finishedAt: lastSummary.finishedAt,
    error: lastSummary.error,
    collections: lastSummary.collections.map(({ differIds, ...rest }) => rest),
  };
}

function stable(v: unknown): string {
  return JSON.stringify(v, (_k, val) =>
    val && typeof val === 'object' && !Array.isArray(val)
      ? Object.keys(val)
          .sort()
          .reduce((o: any, k) => {
            o[k] = (val as any)[k];
            return o;
          }, {})
      : val
  );
}

export async function runReconcile(mode: 'report' | 'apply'): Promise<void> {
  const handles = getFirestoreHandles();
  const summary: ReconcileSummary = { mode, startedAt: new Date().toISOString(), collections: [] };
  lastSummary = summary;
  if (!handles) {
    summary.error = 'Firestore credentials not configured (FIREBASE_SERVICE_ACCOUNT_JSON)';
    console.warn('[reconcile]', summary.error);
    return;
  }
  const { named, legacyDefault } = handles;
  try {
    const cols = await legacyDefault.listCollections();
    for (const col of cols) {
      if (col.id === 'server_store') continue;
      const [defSnap, namedSnap] = await Promise.all([col.get(), named.collection(col.id).get()]);
      const namedMap = new Map(namedSnap.docs.map((d) => [d.id, stable(d.data())]));
      const rep: CollectionReport = {
        collection: col.id,
        defaultCount: defSnap.size,
        namedCount: namedSnap.size,
        onlyDefault: 0,
        onlyNamed: 0,
        same: 0,
        differ: 0,
        copied: 0,
        hasSubcollections: false,
        differIds: [],
      };
      const toCopy: Array<{ id: string; data: FirebaseFirestore.DocumentData }> = [];
      for (const d of defSnap.docs) {
        const other = namedMap.get(d.id);
        if (other === undefined) {
          rep.onlyDefault++;
          toCopy.push({ id: d.id, data: d.data() });
        } else if (other === stable(d.data())) {
          rep.same++;
        } else {
          rep.differ++;
          if (rep.differIds.length < 50) rep.differIds.push(d.id);
        }
      }
      const defIds = new Set(defSnap.docs.map((d) => d.id));
      rep.onlyNamed = namedSnap.docs.filter((d) => !defIds.has(d.id)).length;
      for (const d of defSnap.docs.slice(0, 20)) {
        if ((await d.ref.listCollections()).length > 0) {
          rep.hasSubcollections = true;
          break;
        }
      }
      if (mode === 'apply') {
        for (const item of toCopy) {
          try {
            await named.collection(col.id).doc(item.id).create(item.data); // fails if it already exists
            rep.copied++;
          } catch (err: any) {
            if (!/already exists|ALREADY_EXISTS|6 /.test(String(err?.message || err))) {
              console.error('[reconcile] copy failed', col.id, item.id, err?.message || err);
            }
          }
        }
      }
      summary.collections.push(rep);
      console.log(
        `[reconcile] ${col.id}: default=${rep.defaultCount} named=${rep.namedCount} onlyDefault=${rep.onlyDefault} onlyNamed=${rep.onlyNamed} same=${rep.same} differ=${rep.differ}${mode === 'apply' ? ` copied=${rep.copied}` : ''}${rep.hasSubcollections ? ' (has subcollections, not compared)' : ''}`
      );
      if (rep.differIds.length) console.log(`[reconcile] ${col.id} differing ids:`, rep.differIds.join(', '));
    }
  } catch (err: any) {
    summary.error = err?.message || String(err);
    console.error('[reconcile] failed:', summary.error);
  } finally {
    summary.finishedAt = new Date().toISOString();
    console.log(`[reconcile] ${mode} finished`);
  }
}
