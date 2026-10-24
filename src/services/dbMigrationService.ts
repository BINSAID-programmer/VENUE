import { collection, doc, getDocs, getFirestore, initializeFirestore, writeBatch, type Firestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';
import { db } from './firebase';

/**
 * One-time helper: copies records that exist in the OLD AI Studio database (shared quota) into the
 * standard (default) database, WITHOUT overwriting anything already there. Safe to run repeatedly:
 * if the old database is rate-limited it stops and the next run continues with what is still missing.
 * (Live presence/typing, analytics events and raw file chunks are intentionally not copied.)
 */
export const MIGRATION_COLLECTIONS: string[] = ["admin_users", "countries", "universities", "academic_units", "departments", "programmes", "academic_years", "catalogue_courses", "canonical_courses", "programme_courses", "service_courses", "catalogue_audit_logs", "lecturer_audit_logs", "student_audit_logs", "announcements", "announcementReads", "audit_logs", "materials", "academic_materials", "learning_materials", "material_file_manifests", "lecturers", "lecturer_courses", "users", "students", "ai_career_reports", "student_results", "community_posts", "lecturer_course_announcements", "community_reactions", "community_acknowledgements", "community_read_states", "user_blocked_peers", "user_muted_conversations", "user_muted_users", "user_muted_communities", "user_community_privacy_settings", "community_user_restrictions", "community_bans", "user_notifications", "community_comments", "community_poll_votes", "community_event_rsvps", "community_study_groups", "user_saved_items", "community_likes", "community_bookmarks", "community_reports", "chat_conversations", "community_ai_conversations", "community_ai_feedback"];

export interface MigrationProgress {
  collection: string;
  copied: number;
  skipped: number;
  error?: string;
}

function legacyDb(): Firestore | null {
  const id = (firebaseConfig as { legacyAiStudioDatabaseId?: string }).legacyAiStudioDatabaseId;
  if (!id) return null;
  const app = getApp();
  try {
    return initializeFirestore(app, { experimentalForceLongPolling: true }, id);
  } catch {
    return getFirestore(app, id);
  }
}

async function copyCollection(
  source: Firestore,
  pathParts: string[],
  onProgress: (p: MigrationProgress) => void,
  label: string
): Promise<boolean> {
  const progress: MigrationProgress = { collection: label, copied: 0, skipped: 0 };
  try {
    const [first, ...rest] = pathParts;
    const [srcSnap, dstSnap] = await Promise.all([
      getDocs(collection(source, first, ...rest)),
      getDocs(collection(db, first, ...rest)),
    ]);
    const existing = new Set(dstSnap.docs.map((d) => d.id));
    let batch = writeBatch(db);
    let pending = 0;
    for (const d of srcSnap.docs) {
      if (existing.has(d.id)) {
        progress.skipped++;
        continue;
      }
      batch.set(doc(db, first, ...rest, d.id), d.data());
      pending++;
      progress.copied++;
      if (pending >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        pending = 0;
      }
    }
    if (pending > 0) await batch.commit();
    onProgress(progress);
    return true;
  } catch (err: any) {
    progress.error = String(err?.code || err?.message || err);
    onProgress(progress);
    // Stop on quota / permission problems: carrying on would only repeat the failure.
    return !(progress.error.includes('resource-exhausted') || progress.error.includes('permission'));
  }
}

export async function migrateFromLegacyDatabase(onProgress: (p: MigrationProgress) => void): Promise<boolean> {
  const source = legacyDb();
  if (!source) throw new Error('No legacy database is configured.');
  for (const name of MIGRATION_COLLECTIONS) {
    const keepGoing = await copyCollection(source, [name], onProgress, name);
    if (!keepGoing) return false;
  }
  // Chat messages live in a sub-collection of every conversation.
  try {
    const convs = await getDocs(collection(source, 'chat_conversations'));
    for (const c of convs.docs) {
      const keepGoing = await copyCollection(
        source,
        ['chat_conversations', c.id, 'messages'],
        onProgress,
        `chat_conversations/${c.id}/messages`
      );
      if (!keepGoing) return false;
    }
  } catch {
    /* already reported by the top-level pass */
  }
  return true;
}
