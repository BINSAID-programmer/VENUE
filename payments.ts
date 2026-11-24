/**
 * In-app mobile-money payments (push / USSD PIN prompt).
 *
 * The flow is provider-neutral: the app creates an order, the provider sends a PIN prompt to the customer's phone and later
 * tells us (webhook) whether it was paid. Only a confirmed payment activates Premium. No provider is switched on until the
 * owner sets PAY_PROVIDER and its secrets in the server environment, so until then the app keeps the manual flow.
 *
 * Adding a real provider = add one object to PROVIDERS that implements `initiate` (and, if the provider cannot call our
 * webhook, `check`). Keys are read only from environment variables and are never sent to the browser or logged.
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import * as subs from './subscriptions';

export type Operator = 'mpesa' | 'tigo' | 'airtel' | 'halotel';
export const OPERATORS: Array<{ id: Operator; label: string }> = [
  { id: 'mpesa', label: 'M-Pesa' },
  { id: 'tigo', label: 'Tigo Pesa' },
  { id: 'airtel', label: 'Airtel Money' },
  { id: 'halotel', label: 'HaloPesa' },
];

export interface Order {
  id: string; // also used as the transaction reference, e.g. VNABCDEF1234
  uid: string;
  email: string;
  name?: string;
  kind: 'premium' | 'download_pack';
  plan?: string;
  amountTzs: number;
  operator: Operator;
  phone: string; // 2557XXXXXXXX
  status: 'waiting' | 'paid' | 'failed' | 'expired';
  providerRef?: string;
  createdAt: number;
  note?: string;
}

interface Provider {
  initiate(o: Order): Promise<{ providerRef: string }>;
  /** Optional: ask the provider for the result (used when the webhook did not arrive). */
  check?(o: Order): Promise<'paid' | 'failed' | 'waiting'>;
}

const PROVIDERS: Record<string, Provider> = {};

// Local test provider: confirms by itself after a few seconds. It refuses to run in production.
if (process.env.NODE_ENV !== 'production') {
  PROVIDERS.sandbox = {
    async initiate(o) {
      setTimeout(() => void markResult(o.id, 'paid'), 8000);
      return { providerRef: 'sandbox-' + o.id };
    },
  };
}

let dir = '';
const file = () => path.join(dir, 'pay_orders.json');
const ORDER_TTL_MS = 3 * 60 * 1000;

export function initPayments(storageDir: string) {
  dir = storageDir;
}

function readAll(): Record<string, Order> {
  try {
    return fs.existsSync(file()) ? JSON.parse(fs.readFileSync(file(), 'utf-8')) || {} : {};
  } catch {
    return {};
  }
}
function writeAll(all: Record<string, Order>) {
  const ids = Object.keys(all);
  if (ids.length > 2000) for (const id of ids.sort((a, b) => all[a].createdAt - all[b].createdAt).slice(0, ids.length - 2000)) delete all[id];
  const tmp = file() + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(all));
  fs.renameSync(tmp, file());
}

export function activeProvider(): string | null {
  const n = String(process.env.PAY_PROVIDER || '').toLowerCase();
  return n && PROVIDERS[n] ? n : null;
}

export function normalisePhone(input: string): string | null {
  const d = String(input || '').replace(/[^0-9]/g, '');
  let local = '';
  if (/^0[67]\d{8}$/.test(d)) local = d;
  else if (/^255[67]\d{8}$/.test(d)) local = '0' + d.slice(3);
  else if (/^[67]\d{8}$/.test(d)) local = '0' + d;
  else return null;
  return '255' + local.slice(1);
}

function amountFor(kind: string, plan?: string): number | null {
  if (kind === 'download_pack') return subs.DOWNLOAD_PACK_PRICE_TZS;
  if (kind === 'premium') {
    const p = subs.PLANS[(plan || 'month') as subs.PlanId];
    return p ? p.priceTzs : null;
  }
  return null;
}

export async function startPayment(
  user: { uid: string; email: string; name?: string },
  body: { kind?: string; plan?: string; operator?: string; phone?: string }
): Promise<{ ok: true; orderId: string } | { ok: false; error: string; status?: number }> {
  const prov = activeProvider();
  if (!prov) return { ok: false, status: 503, error: 'In-app payment is not available yet. Please use the manual payment option.' };
  const kind = String(body.kind || 'premium');
  const amount = amountFor(kind, body.plan);
  if (!amount) return { ok: false, error: 'Invalid plan.' };
  if (kind === 'download_pack' && !subs.isPremium(user.uid, false)) return { ok: false, error: 'Extra downloads are available only while your Premium is active.' };
  const operator = String(body.operator || '') as Operator;
  if (!OPERATORS.some((o) => o.id === operator)) return { ok: false, error: 'Choose a mobile operator.' };
  const phone = normalisePhone(String(body.phone || ''));
  if (!phone) return { ok: false, error: 'Enter a valid phone number, for example 0763143290.' };

  const all = readAll();
  const now = Date.now();
  const open = Object.values(all).find((o) => o.uid === user.uid && o.status === 'waiting' && now - o.createdAt < ORDER_TTL_MS);
  if (open) return { ok: false, error: 'You already have a payment waiting for your PIN. Finish it or wait a minute.' };

  const order: Order = {
    id: 'VN' + crypto.randomBytes(6).toString('hex').toUpperCase(),
    uid: user.uid,
    email: user.email,
    name: user.name,
    kind: kind as Order['kind'],
    plan: kind === 'premium' ? String(body.plan || 'month') : undefined,
    amountTzs: amount,
    operator,
    phone,
    status: 'waiting',
    createdAt: now,
  };
  all[order.id] = order;
  writeAll(all);
  try {
    const r = await PROVIDERS[prov].initiate(order);
    const again = readAll();
    if (again[order.id]) {
      again[order.id].providerRef = r.providerRef;
      writeAll(again);
    }
    return { ok: true, orderId: order.id };
  } catch {
    await markResult(order.id, 'failed', 'Could not reach the payment provider.');
    return { ok: false, status: 502, error: 'Could not start the payment. Please try again.' };
  }
}

/** Marks an order paid or failed (idempotent) and activates the plan on the first "paid". */
export async function markResult(orderId: string, result: 'paid' | 'failed', note?: string, paidAmount?: number): Promise<Order | null> {
  const all = readAll();
  const o = all[orderId];
  if (!o) return null;
  if (o.status === 'paid') return o;
  if (result === 'paid') {
    if (paidAmount !== undefined && paidAmount !== o.amountTzs) {
      o.status = 'failed';
      o.note = 'Amount mismatch';
    } else {
      const done = subs.settlePaidOrder({ uid: o.uid, email: o.email, name: o.name }, o.kind, o.plan, o.id, o.phone);
      if (done.ok) o.status = 'paid';
      else {
        o.status = 'failed';
        o.note = done.error;
      }
    }
  } else {
    o.status = 'failed';
    if (note) o.note = note.slice(0, 120);
  }
  all[orderId] = o;
  writeAll(all);
  return o;
}

export async function orderStatus(uid: string, orderId: string): Promise<{ status: Order['status']; note?: string } | null> {
  let all = readAll();
  let o = all[orderId];
  if (!o || o.uid !== uid) return null;
  if (o.status === 'waiting') {
    const prov = activeProvider();
    const check = prov ? PROVIDERS[prov].check : undefined;
    if (check) {
      try {
        const r = await check(o);
        if (r !== 'waiting') await markResult(o.id, r);
      } catch {
        /* keep waiting */
      }
      all = readAll();
      o = all[orderId] || o;
    }
    if (o.status === 'waiting' && Date.now() - o.createdAt > ORDER_TTL_MS) {
      o.status = 'expired';
      all[orderId] = o;
      writeAll(all);
    }
  }
  return { status: o.status, note: o.note };
}

/** Constant-time check of the shared webhook secret. */
export function webhookAuthorised(given: string): boolean {
  const secret = process.env.PAY_WEBHOOK_SECRET || '';
  if (secret.length < 16 || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
