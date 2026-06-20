const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://demo.schoolsoft.online/api').replace(/\/$/, '');

function apiUrl(path: string) {
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
  try {
    const response = await fetch(apiUrl(path), { ...init, headers });
    if (response.status === 401 && typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      clearAdminToken();
      window.location.assign('/admin/login');
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const detail = body?.detail || (body && typeof body === 'object' ? Object.values(body).flat().join(' ') : '');
      throw new Error(detail || `Request failed (${response.status})`);
    }
    return response.status === 204 ? (undefined as T) : response.json();
  } catch (error) {
    if (error instanceof TypeError) throw new Error('Unable to reach the server. Please try again shortly.');
    throw error;
  }
}

export const imageUrl = (value?: string) => value || '';
