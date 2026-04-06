/**
 * Security utilities for the LMS frontend.
 * Since this is a frontend-only demo app, we use Web Crypto for hashing
 * and implement client-side rate limiting + session management.
 */

// ── Password hashing ──────────────────────────────────────────────────────────

/** SHA-256 hash a string using Web Crypto API (async). */
export async function hashPassword(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Synchronous hash using a simple deterministic function for seeding mock data.
 *  Only used at module init time to pre-hash the mock passwords. */
export function hashPasswordSync(plain: string): string {
  // djb2 hash → hex string (good enough for demo data seeding)
  let hash = 5381;
  for (let i = 0; i < plain.length; i++) {
    hash = ((hash << 5) + hash) ^ plain.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  // Stretch to 64 chars to look like a real hash
  const base = hash.toString(16).padStart(8, '0');
  return (base + base + base + base + base + base + base + base).slice(0, 64);
}

// ── Brute-force / rate limiting ───────────────────────────────────────────────

const LOCKOUT_THRESHOLD = 5;   // failed attempts before lockout
const LOCKOUT_DURATION  = 30;  // seconds

interface AttemptRecord {
  count: number;
  lockedUntil: number | null; // epoch ms
}

const attemptStore = new Map<string, AttemptRecord>();

export function recordFailedAttempt(email: string): { locked: boolean; remaining: number; waitSeconds: number } {
  const now = Date.now();
  const rec = attemptStore.get(email) ?? { count: 0, lockedUntil: null };

  // If currently locked, check if lockout expired
  if (rec.lockedUntil && now < rec.lockedUntil) {
    const waitSeconds = Math.ceil((rec.lockedUntil - now) / 1000);
    return { locked: true, remaining: 0, waitSeconds };
  }

  // Reset if lockout expired
  if (rec.lockedUntil && now >= rec.lockedUntil) {
    rec.count = 0;
    rec.lockedUntil = null;
  }

  rec.count += 1;

  if (rec.count >= LOCKOUT_THRESHOLD) {
    rec.lockedUntil = now + LOCKOUT_DURATION * 1000;
    attemptStore.set(email, rec);
    return { locked: true, remaining: 0, waitSeconds: LOCKOUT_DURATION };
  }

  attemptStore.set(email, rec);
  return { locked: false, remaining: LOCKOUT_THRESHOLD - rec.count, waitSeconds: 0 };
}

export function isLockedOut(email: string): { locked: boolean; waitSeconds: number } {
  const now = Date.now();
  const rec = attemptStore.get(email);
  if (!rec || !rec.lockedUntil) return { locked: false, waitSeconds: 0 };
  if (now >= rec.lockedUntil) {
    attemptStore.delete(email);
    return { locked: false, waitSeconds: 0 };
  }
  return { locked: true, waitSeconds: Math.ceil((rec.lockedUntil - now) / 1000) };
}

export function clearAttempts(email: string) {
  attemptStore.delete(email);
}

// ── Session expiry ────────────────────────────────────────────────────────────

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export function setSessionTimestamp() {
  sessionStorage.setItem('lms_session_ts', String(Date.now()));
}

export function isSessionExpired(): boolean {
  const ts = sessionStorage.getItem('lms_session_ts');
  if (!ts) return true;
  return Date.now() - parseInt(ts) > SESSION_DURATION_MS;
}

export function refreshSession() {
  sessionStorage.setItem('lms_session_ts', String(Date.now()));
}

export function clearSession() {
  sessionStorage.removeItem('lms_session_ts');
}

// ── Input sanitisation ────────────────────────────────────────────────────────

/** Strip HTML tags and trim whitespace from user input. */
export function sanitizeInput(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

/** Validate email format. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
