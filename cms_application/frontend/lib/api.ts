export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://demo.schoolsoft.online/api').replace(/\/$/, '');

export function apiUrl(path: string) {
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

export function getAdminToken() {
  return typeof window === 'undefined' ? null : localStorage.getItem('admin-token');
}

export function clearAdminToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('admin-token');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const headers = new Headers(init.headers);
  const token = getAdminToken();
  // Admin callers should not have to remember this header. Public requests stay
  // anonymous unless a caller explicitly supplies a different credential.
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !isFormData && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const url = apiUrl(path);
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers, mode: 'cors' });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('API network error:', url, error);
    throw new Error(`Cannot connect to the backend. Check CORS, HTTPS, and whether ${API_BASE} is online.`);
  }
  const text = await response.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (response.status === 401 && typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    clearAdminToken();
    if (!window.location.pathname.includes('/admin/login')) window.location.assign('/admin/login');
  }
  if (!response.ok) {
    const data = body as { detail?: string; non_field_errors?: string[] } | null;
    const detail = data?.detail || data?.non_field_errors?.join(' ') || (data && typeof data === 'object' ? Object.values(data).flat().join(' ') : '') || `Request failed (${response.status})`;
    throw new Error(detail);
  }
  return response.status === 204 ? (undefined as T) : body as T;
}

export async function loginAdmin(username: string, password: string) {
  try {
    return await api<{ access: string; refresh: string }>('/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error).toLowerCase();
    if (message.includes('no active account') || message.includes('credentials') || message.includes('401')) {
      throw new Error('Invalid username or password.');
    }
    if (message.includes('403') || message.includes('permission')) {
      throw new Error('Access denied. Please use an authorised staff account.');
    }
    throw error;
  }
}

export const imageUrl = (value?: string) => value || '';
