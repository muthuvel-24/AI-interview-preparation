const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { params, headers: customHeaders, ...restOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
    credentials: 'include',
  });

  const data = await response.json();

  return {
    data: data as T,
    status: response.status,
    ok: response.ok,
  };
}

// Convenience methods
export const apiGet = <T = unknown>(endpoint: string, options?: ApiOptions) =>
  api<T>(endpoint, { ...options, method: 'GET' });

export const apiPost = <T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions) =>
  api<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });

export const apiPut = <T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions) =>
  api<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });

export const apiDelete = <T = unknown>(endpoint: string, options?: ApiOptions) =>
  api<T>(endpoint, { ...options, method: 'DELETE' });
