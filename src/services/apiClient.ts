import { auth } from './firebase';

/**
 * Retrieves the current authenticated user's Firebase ID token if signed in.
 * Never throws; returns null if no user is currently signed in or token retrieval fails.
 */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    return await currentUser.getIdToken(forceRefresh);
  } catch (err) {
    console.warn('apiClient: Could not retrieve Firebase ID token:', err);
    return null;
  }
}

/**
 * Builds request headers with `Authorization: Bearer <idToken>` automatically attached
 * when a Firebase user is signed in.
 */
export async function buildAuthenticatedHeaders(
  existingHeaders?: HeadersInit
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  if (existingHeaders) {
    if (existingHeaders instanceof Headers) {
      existingHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(existingHeaders)) {
      for (const [key, value] of existingHeaders) {
        headers[key] = value;
      }
    } else {
      Object.assign(headers, existingHeaders);
    }
  }

  const token = await getFirebaseIdToken(false);
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Drop-in wrapper around `fetch` that automatically attaches the current user's
 * Firebase ID token (`Authorization: Bearer <token>`) when available.
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = await buildAuthenticatedHeaders(init?.headers);
  return fetch(input, {
    ...init,
    headers,
  });
}

// [TEMPORARY STAGE 1 DIAGNOSTIC HELPER — REMOVE AFTER VERIFICATION]
export interface WhoAmIDiagnosticResult {
  status: number;
  authenticated: boolean;
  uid?: string;
  email?: string | null;
  emailVerified?: boolean;
  role?: string;
  isOwner?: boolean;
  error?: string;
  message?: string;
}

export async function verifyCurrentSessionWhoAmI(): Promise<WhoAmIDiagnosticResult> {
  try {
    const res = await authenticatedFetch('/api/auth/whoami', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    const result: WhoAmIDiagnosticResult = {
      status: res.status,
      authenticated: Boolean(res.ok && data?.authenticated),
      ...data,
    };
    if (typeof window !== 'undefined') {
      (window as any).__venueAuthDiagnosticResult = result;
      console.info('[VENUE Stage 1 Auth Diagnostic /api/auth/whoami]:', result);
    }
    return result;
  } catch (err: any) {
    const fallback: WhoAmIDiagnosticResult = {
      status: 0,
      authenticated: false,
      error: err?.message || 'Network error calling /api/auth/whoami',
    };
    if (typeof window !== 'undefined') {
      (window as any).__venueAuthDiagnosticResult = fallback;
    }
    return fallback;
  }
}

if (typeof window !== 'undefined') {
  (window as any).__venueVerifyWhoAmI = verifyCurrentSessionWhoAmI;
}

// ---------------------------------------------------------------------------
// Global /api interceptor: every request to our own API carries the student's
// sign-in token (so the server can apply Premium limits), and Premium-related
// refusals (402) raise a "venue:premium-required" event that the app turns into
// an upgrade prompt.
// ---------------------------------------------------------------------------
let interceptorInstalled = false;

export function installApiInterceptor(): void {
  if (interceptorInstalled || typeof window === 'undefined') return;
  interceptorInstalled = true;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url = '';
    try {
      url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : (input as Request).url;
    } catch {
      /* ignore */
    }
    const path = url.startsWith('http') ? (() => { try { return new URL(url).pathname; } catch { return ''; } })() : url;
    const isApi = path.startsWith('/api/') && !path.startsWith('/api/health');

    let finalInit = init;
    if (isApi) {
      const existing = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      if (!existing.has('Authorization')) {
        const token = await getFirebaseIdToken(false);
        if (token) {
          existing.set('Authorization', `Bearer ${token}`);
          finalInit = { ...init, headers: existing };
        }
      }
    }

    const response = await nativeFetch(input, finalInit);

    if (isApi && response.status === 402) {
      try {
        const data = await response.clone().json();
        window.dispatchEvent(
          new CustomEvent('venue:premium-required', {
            detail: { code: data?.error || 'PREMIUM_REQUIRED', message: data?.message || '' },
          })
        );
      } catch {
        /* ignore */
      }
    }
    return response;
  };
}
