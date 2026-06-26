const configuredApiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://demo.schoolsoft.online').replace(/\/+$/, '');
export const API_BASE = configuredApiBase.endsWith('/api') ? configuredApiBase : `${configuredApiBase}/api`;

export function apiUrl(path: string) {
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

export function getAdminToken() {
  return typeof window === 'undefined' ? null : localStorage.getItem('admin-token');
}

export function clearAdminToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('admin-token');
}

function flattenApiErrors(value: unknown, prefix = ''): string[] {
  if (!value) return [];
  if (typeof value === 'string') return [prefix ? `${prefix}: ${value}` : value];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenApiErrors(item, prefix ? `${prefix} ${index + 1}` : ''));
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, val]) => {
      const label = prefix ? `${prefix}.${key}` : key;
      return flattenApiErrors(val, label);
    });
  }
  return [String(value)];
}

function friendlyApiMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('invalid pk') || lower.includes('no longer available') || lower.includes('object does not exist')) return 'One selected service is no longer available. Please remove it and select again.';
  if (lower.includes('bullet_points') && (lower.includes('valid json') || lower.includes('not a valid list') || lower.includes('not a valid string'))) return 'Please check your bullet points. Write one short point per row.';
  if (lower.includes('items') && (lower.includes('required') || lower.includes('empty') || lower.includes('select at least one'))) return 'Please select at least one service.';
  if (lower.includes('full_name')) return 'Please enter your full name.';
  if (lower.includes('phone')) return 'Please enter your phone number.';
  if (lower.includes('location')) return 'Please enter project location.';
  return message;
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
    console.error('API network error:', url, error);
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
    const errors = flattenApiErrors(body);
    const message = errors.length > 0 ? errors.map(friendlyApiMessage).join(' ') : `Request failed with status ${response.status}`;
    throw new Error(message);
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
