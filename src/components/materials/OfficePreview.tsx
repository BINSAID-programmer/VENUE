import React, { useEffect, useRef, useState } from 'react';

export type OfficeKind = 'docx' | 'pptx' | 'xlsx';

interface Props {
  kind: OfficeKind;
  data: ArrayBuffer;
  onFailed: (message: string) => void;
}

/**
 * Renders Word, PowerPoint and Excel files inside the app, in the browser.
 * The original file is never modified or uploaded anywhere.
 * Libraries are loaded on demand so they don't slow down the rest of the app.
 */
export default function OfficePreview({ kind, data, onFailed }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(true);
  const [sheets, setSheets] = useState<{ name: string; rows: string[][] }[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    setBusy(true);

    (async () => {
      try {
        if (kind === 'docx') {
          const mod: any = await import('docx-preview');
          if (cancelled || !host) return;
          host.innerHTML = '';
          await mod.renderAsync(data, host, undefined, {
            inWrapper: true,
            ignoreWidth: true,
            ignoreHeight: true,
            breakPages: false,
          });
        } else if (kind === 'pptx') {
          const mod: any = await import('pptx-preview');
          if (cancelled || !host) return;
          host.innerHTML = '';
          const width = Math.max(280, Math.min(host.clientWidth || 360, 960));
          const viewer = mod.init(host, { width, height: Math.round((width * 9) / 16), mode: 'list' });
          await viewer.preview(data);
        } else {
          const XLSX: any = await import('xlsx');
          const wb = XLSX.read(new Uint8Array(data), { type: 'array' });
          const parsed = (wb.SheetNames as string[]).map((name) => {
            const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[name], {
              header: 1,
              raw: false,
              defval: '',
            });
            return {
              name,
              rows: rows.slice(0, 500).map((r) => r.slice(0, 40).map((c) => String(c ?? ''))),
            };
          });
          if (!cancelled) setSheets(parsed);
        }
        if (!cancelled) setBusy(false);
      } catch (err: any) {
        if (!cancelled) {
          setBusy(false);
          onFailed(err?.message || 'This file could not be previewed.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, data]);

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto">
      {busy && (
        <p className="text-center text-sm text-slate-400 py-10">Preparing preview…</p>
      )}

      {kind !== 'xlsx' && (
        <div
          ref={hostRef}
          className={`overflow-auto rounded-2xl ${kind === 'docx' ? 'bg-slate-200 p-2' : 'bg-slate-900/60 p-2'}`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        />
      )}

      {kind === 'xlsx' && !busy && (
        <div className="space-y-3">
          {sheets.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sheets.map((s, i) => (
                <button
                  key={s.name + i}
                  type="button"
                  onClick={() => setActiveSheet(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border cursor-pointer ${
                    i === activeSheet
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
          <div className="overflow-auto rounded-xl border border-slate-800 bg-slate-900 max-h-[75vh]">
            <table className="text-xs text-slate-200 border-collapse min-w-full">
              <tbody>
                {(sheets[activeSheet]?.rows || []).map((row, r) => (
                  <tr key={r} className={r === 0 ? 'bg-slate-800 font-bold' : r % 2 ? 'bg-slate-900' : 'bg-slate-950/60'}>
                    {row.map((cell, c) => (
                      <td key={c} className="border border-slate-800 px-2.5 py-1.5 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sheets[activeSheet] && sheets[activeSheet].rows.length >= 500 && (
            <p className="text-[11px] text-slate-500 text-center">
              Showing the first 500 rows. Download the original file to see everything.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
