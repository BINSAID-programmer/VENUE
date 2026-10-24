import React, { useState } from 'react';
import { DatabaseZap, Loader2 } from 'lucide-react';
import { migrateFromLegacyDatabase, type MigrationProgress } from '../../services/dbMigrationService';

/** Owner-only helper that copies data from the old AI Studio database into the standard database. */
export const DatabaseMigrationCard: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState<MigrationProgress[]>([]);
  const [message, setMessage] = useState('');

  const run = async () => {
    setRunning(true);
    setRows([]);
    setMessage('');
    try {
      const complete = await migrateFromLegacyDatabase((p) => setRows((prev) => [...prev, p]));
      setMessage(
        complete
          ? 'Finished. All available records were copied.'
          : 'Stopped before finishing (the old database is still rate-limited). Nothing was lost: try again later, only the missing records will be copied.'
      );
    } catch (err: any) {
      setMessage(err?.message || 'Migration failed.');
    } finally {
      setRunning(false);
    }
  };

  const copied = rows.reduce((n, r) => n + r.copied, 0);
  const failed = rows.filter((r) => r.error);

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
      <div className="flex items-center gap-2">
        <DatabaseZap className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Move data to the standard database</h3>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        VENUE now uses the standard Firestore database. This copies records that still exist only in the old AI Studio
        database. Nothing is overwritten and it is safe to run again.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={running}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold disabled:opacity-50"
      >
        {running && <Loader2 className="w-4 h-4 animate-spin" />}
        {running ? 'Copying...' : 'Copy data now'}
      </button>
      {rows.length > 0 && (
        <p className="text-[11px] text-slate-300">
          Collections checked: {rows.length} - records copied: <b>{copied}</b>
        </p>
      )}
      {failed.length > 0 && (
        <p className="text-[11px] text-rose-300">
          Stopped at "{failed[0].collection}": {failed[0].error}
        </p>
      )}
      {message && (
        <p className={`text-[11px] ${failed.length > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>{message}</p>
      )}
    </div>
  );
};
