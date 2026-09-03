import { getToken, clearToken } from './session';

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp: string;
  path: string;
}

export class ApiError extends Error {
  status: number;
  messages: string[];
  error?: string;
  timestamp: string;
  path: string;

  constructor(body: ApiErrorBody) {
    const messages =
      Array.isArray(body.message) ? body.message : [body.message];

    super(messages.join(', '));

    this.name = 'ApiError';
    this.status = body.statusCode;
    this.messages = messages;
    this.error = body.error;
    this.timestamp = body.timestamp;
    this.path = body.path;
  }
}
export async function api<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  const token = getToken();

  const headers = new Headers(init.headers);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let body: ApiErrorBody;

    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = {
        statusCode: response.status,
        message: 'Request failed',
        timestamp: new Date().toISOString(),
        path,
      };
    }

    if (response.status === 401 && path !== '/auth/login') {
      clearToken();

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    throw new ApiError(body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}