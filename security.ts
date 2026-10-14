import type { Request, Response, NextFunction } from 'express';
import { initializeApp, getApps, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

// Resolve Firebase Project ID from environment or firebase-applet-config.json
function resolveFirebaseProjectId(): string {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID.trim()) {
    return process.env.FIREBASE_PROJECT_ID.trim();
  }
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (raw?.projectId) {
        return String(raw.projectId).trim();
      }
    }
  } catch {
    // Fallback to known project ID
  }
  return 'venue-e6f65';
}

export const FIREBASE_PROJECT_ID = resolveFirebaseProjectId();

// Preserve existing Platform Owner UID & email checks while supporting environment configuration
export const VERIFIED_OWNER_UID = (process.env.OWNER_UID || 'Faz9X1kqMZWkujTMKYaRfvM4jvw1').trim();
export const VERIFIED_OWNER_EMAIL = (process.env.OWNER_EMAIL || 'binsaid679@gmail.com')
  .trim()
  .toLowerCase();

// Initialize Firebase Admin SDK with projectId only (no service-account private key required for verifyIdToken)
let firebaseAdminApp: App | null = null;
try {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseAdminApp = existingApps[0];
  } else {
    firebaseAdminApp = initializeApp({
      projectId: FIREBASE_PROJECT_ID,
    });
  }
} catch (err) {
  console.error('Firebase Admin initialization error:', err);
}

export function isFirebaseAdminReady(): boolean {
  return Boolean(firebaseAdminApp && getApps().length > 0);
}

export interface VerifiedServerUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  role: 'super_admin' | 'admin' | 'lecturer' | 'student';
  isOwner: boolean;
  status: 'active' | 'inactive';
  claims?: Record<string, any>;
}

declare global {
  namespace Express {
    interface Request {
      user?: VerifiedServerUser;
    }
  }
}

/**
 * Checks whether a UID or email belongs to the verified Platform Owner.
 * Preserves both the existing hardcoded owner checks and environment variable overrides.
 */
export function isVerifiedOwnerIdentity(uid?: string, email?: string, emailVerified = true): boolean {
  const cleanUid = (uid || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (cleanUid && (cleanUid === 'Faz9X1kqMZWkujTMKYaRfvM4jvw1' || cleanUid === VERIFIED_OWNER_UID)) {
    return true;
  }
  if (
    cleanEmail &&
    emailVerified !== false &&
    (cleanEmail === 'binsaid679@gmail.com' || cleanEmail === VERIFIED_OWNER_EMAIL)
  ) {
    return true;
  }
  return false;
}

/**
 * Resolves the server-side role and account status for a verified Firebase token.
 */
export function resolveServerUserFromToken(
  decodedToken: DecodedIdToken,
  studentProfileLookup?: (uid: string) => Record<string, any> | undefined
): VerifiedServerUser {
  const uid = decodedToken.uid;
  const email = (decodedToken.email || '').trim().toLowerCase();
  const emailVerified = Boolean(decodedToken.email_verified);
  const isOwner = isVerifiedOwnerIdentity(uid, email, emailVerified);

  const profile = studentProfileLookup ? studentProfileLookup(uid) : undefined;
  const profileStatus =
    isOwner
      ? 'active'
      : profile?.status === 'inactive' || profile?.accountStatus === 'inactive'
      ? 'inactive'
      : 'active';

  let role: VerifiedServerUser['role'] = 'student';
  if (isOwner || decodedToken.role === 'super_admin' || decodedToken.superAdmin === true) {
    role = 'super_admin';
  } else if (
    decodedToken.role === 'admin' ||
    decodedToken.admin === true ||
    profile?.role === 'admin' ||
    profile?.role === 'super_admin'
  ) {
    role = 'admin';
  } else if (
    decodedToken.role === 'lecturer' ||
    decodedToken.role === 'verified_lecturer' ||
    profile?.role === 'lecturer' ||
    profile?.role === 'verified_lecturer'
  ) {
    role = 'lecturer';
  }

  return {
    uid,
    email,
    emailVerified,
    name: decodedToken.name || profile?.name || profile?.fullName || undefined,
    role,
    isOwner,
    status: profileStatus,
    claims: decodedToken,
  };
}

/**
 * Extracts and verifies a Firebase Bearer token from the Authorization header if present.
 */
export async function verifyBearerTokenFromRequest(
  req: Request,
  studentProfileLookup?: (uid: string) => Record<string, any> | undefined
): Promise<VerifiedServerUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const idToken = authHeader.slice(7).trim();
  if (!idToken || !firebaseAdminApp) {
    return null;
  }

  try {
    const decoded = await getAuth(firebaseAdminApp).verifyIdToken(idToken);
    return resolveServerUserFromToken(decoded, studentProfileLookup);
  } catch {
    return null;
  }
}

/**
 * Non-blocking authentication context middleware (Stage 1).
 * Populates `req.user` whenever a valid `Authorization: Bearer <idToken>` header is present,
 * without rejecting unauthenticated requests yet.
 */
export function createOptionalAuthMiddleware(
  studentProfileLookup?: (uid: string) => Record<string, any> | undefined
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const verifiedUser = await verifyBearerTokenFromRequest(req, studentProfileLookup);
      if (verifiedUser) {
        req.user = verifiedUser;
      }
    } catch {
      // Non-blocking in optional mode
    }
    next();
  };
}

/**
 * Strict authentication middleware (prepared in Stage 1 for staged route activation in Stages 2-5).
 */
export function createRequireAuthMiddleware(
  studentProfileLookup?: (uid: string) => Record<string, any> | undefined
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const verifiedUser = await verifyBearerTokenFromRequest(req, studentProfileLookup);
      if (verifiedUser) {
        req.user = verifiedUser;
      }
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required. Please sign in with a valid session.',
      });
    }

    if (!req.user.isOwner && req.user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        error: 'ACCOUNT_INACTIVE',
        message: 'Access denied: Your account is currently inactive.',
      });
    }

    return next();
  };
}

/**
 * Strict role-based authorization middleware (prepared in Stage 1 for Stages 2-5).
 */
export function requireRoles(allowedRoles: Array<VerifiedServerUser['role']>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required.',
      });
    }

    if (req.user.isOwner || req.user.role === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Insufficient permissions to perform this action.',
      });
    }

    return next();
  };
}

/**
 * Safe HTTP security headers middleware compatible with AI Studio preview iframe and PDF.js viewer.
 * Avoids X-Frame-Options: DENY so the AI Studio preview iframe is never blocked.
 */
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
}

/**
 * Lightweight in-memory rate limiter factory for API protection.
 */
export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}) {
  const buckets = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const cutoff = now - options.windowMs;
    const identity = req.user?.uid || req.ip || 'anon';
    const key = `${options.keyPrefix}:${identity}`;

    const timestamps = (buckets.get(key) || []).filter((ts) => ts > cutoff);
    if (timestamps.length >= options.maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a moment before trying again.',
      });
    }

    timestamps.push(now);
    buckets.set(key, timestamps);
    return next();
  };
}
