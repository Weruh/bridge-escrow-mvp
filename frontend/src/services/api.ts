const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers = {}, ...rest } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const token = localStorage.getItem('bridge_escrow_token');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  try {
    const response = await fetch(url, {
      ...rest,
      headers: defaultHeaders,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.error || data.message || `Request failed with status ${response.status}`;
      throw new ApiError(response.status, message, data);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || 'Network error occurred');
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
