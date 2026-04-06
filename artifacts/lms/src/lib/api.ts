/**
 * Centralized API client for the LMS backend.
 *
 * In development: Vite proxies /api/* → http://localhost:4000
 * In production: set VITE_API_URL to your deployed server (e.g. https://api.yourdomain.com)
 *
 * IMPORTANT: never use http:// directly from an https:// frontend — the browser
 * will block it as mixed content. Always go through the Vite proxy in dev.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ── Token management ──────────────────────────────────────────────────────────

export function getAccessToken() { return localStorage.getItem('lms_access_token'); }
export function getRefreshToken() { return localStorage.getItem('lms_refresh_token'); }
export function setTokens(access: string, refresh: string) {
  localStorage.setItem('lms_access_token', access);
  localStorage.setItem('lms_refresh_token', refresh);
}
export function clearTokens() {
  localStorage.removeItem('lms_access_token');
  localStorage.removeItem('lms_refresh_token');
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch { return null; }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch(path, options, false);
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error ?? 'Request failed'), { status: res.status });
  }

  return res.json();
}

// ── Upload helper ─────────────────────────────────────────────────────────────

export async function apiUpload(path: string, file: File, fieldName = 'file'): Promise<{ url: string }> {
  const token = getAccessToken();
  const form = new FormData();
  form.append(fieldName, file);
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string, role: string) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) }),
  register: (data: object) =>
    apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () =>
    apiFetch('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: getRefreshToken() }) }),
  me: () => apiFetch('/api/auth/me'),
};

// ── Libraries ─────────────────────────────────────────────────────────────────

export const libraries = {
  list: () => apiFetch('/api/libraries'),
  get: (id: string) => apiFetch(`/api/libraries/${id}`),
  create: (data: object) => apiFetch('/api/libraries', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) => apiFetch(`/api/libraries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/libraries/${id}`, { method: 'DELETE' }),
  updateSettings: (id: string, data: object) => apiFetch(`/api/libraries/${id}/settings`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── Books ─────────────────────────────────────────────────────────────────────

export const books = {
  list: (params?: Record<string, string>) => apiFetch(`/api/books?${new URLSearchParams(params ?? '')}`),
  get: (id: string) => apiFetch(`/api/books/${id}`),
  create: (data: object) => apiFetch('/api/books', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) => apiFetch(`/api/books/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/books/${id}`, { method: 'DELETE' }),
  updateInventory: (id: string, data: object) => apiFetch(`/api/books/${id}/inventory`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── Digital Resources ─────────────────────────────────────────────────────────

export const digital = {
  list: (params?: Record<string, string>) => apiFetch(`/api/digital?${new URLSearchParams(params ?? '')}`),
  get: (id: string) => apiFetch(`/api/digital/${id}`),
  create: (data: object) => apiFetch('/api/digital', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) => apiFetch(`/api/digital/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/digital/${id}`, { method: 'DELETE' }),
  logDownload: (id: string) => apiFetch(`/api/digital/${id}/download`, { method: 'POST' }),
};

// ── Borrow Requests ───────────────────────────────────────────────────────────

export const borrow = {
  list: (params?: Record<string, string>) => apiFetch(`/api/borrow?${new URLSearchParams(params ?? '')}`),
  create: (data: object) => apiFetch('/api/borrow', { method: 'POST', body: JSON.stringify(data) }),
  approve: (id: string, dueDate?: string) => apiFetch(`/api/borrow/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ dueDate }) }),
  reject: (id: string, reason: string) => apiFetch(`/api/borrow/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ rejectionReason: reason }) }),
  return: (id: string) => apiFetch(`/api/borrow/${id}/return`, { method: 'PATCH' }),
};

// ── Fines ─────────────────────────────────────────────────────────────────────

export const fines = {
  list: (params?: Record<string, string>) => apiFetch(`/api/fines?${new URLSearchParams(params ?? '')}`),
  create: (data: object) => apiFetch('/api/fines', { method: 'POST', body: JSON.stringify(data) }),
  pay: (id: string) => apiFetch(`/api/fines/${id}/pay`, { method: 'PATCH' }),
  waive: (id: string) => apiFetch(`/api/fines/${id}/waive`, { method: 'PATCH' }),
};

// ── Memberships ───────────────────────────────────────────────────────────────

export const memberships = {
  list: (libraryId?: string) => apiFetch(`/api/memberships${libraryId ? `?libraryId=${libraryId}` : ''}`),
  create: (data: object) => apiFetch('/api/memberships', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) => apiFetch(`/api/memberships/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/memberships/${id}`, { method: 'DELETE' }),
  issueCard: (data: object) => apiFetch('/api/memberships/card', { method: 'POST', body: JSON.stringify(data) }),
  myCard: () => apiFetch('/api/memberships/card/me'),
};

// ── Payments ──────────────────────────────────────────────────────────────────

export const payments = {
  createOrder: (data: object) => apiFetch('/api/payments/order', { method: 'POST', body: JSON.stringify(data) }),
  verify: (data: object) => apiFetch('/api/payments/verify', { method: 'POST', body: JSON.stringify(data) }),
  history: () => apiFetch('/api/payments/history'),
};

// ── Events ────────────────────────────────────────────────────────────────────

export const events = {
  list: (params?: Record<string, string>) => apiFetch(`/api/events?${new URLSearchParams(params ?? '')}`),
  create: (data: object) => apiFetch('/api/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) => apiFetch(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/events/${id}`, { method: 'DELETE' }),
  register: (id: string) => apiFetch(`/api/events/${id}/register`, { method: 'POST' }),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notifications = {
  list: () => apiFetch('/api/notifications'),
  markRead: (id: string) => apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiFetch('/api/notifications/read-all', { method: 'PATCH' }),
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const settings = {
  getSystem: () => apiFetch('/api/settings/system'),
  updateSystem: (data: object) => apiFetch('/api/settings/system', { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = {
  list: (params?: Record<string, string>) => apiFetch(`/api/users?${new URLSearchParams(params ?? '')}`),
  get: (id: string) => apiFetch(`/api/users/${id}`),
  create: (data: object) => apiFetch('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) => apiFetch(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/users/${id}`, { method: 'DELETE' }),
};

// ── Check-ins ─────────────────────────────────────────────────────────────────

export const checkIns = {
  list: (params?: Record<string, string>) => apiFetch(`/api/checkins?${new URLSearchParams(params ?? '')}`),
  checkIn: (data: object) => apiFetch('/api/checkins', { method: 'POST', body: JSON.stringify(data) }),
  checkOut: (id: string) => apiFetch(`/api/checkins/${id}/checkout`, { method: 'PATCH' }),
};

// ── Upload ────────────────────────────────────────────────────────────────────

export const upload = {
  photo: (file: File) => apiUpload('/api/upload/photo', file),
  media: (file: File) => apiUpload('/api/upload/media', file),
};
