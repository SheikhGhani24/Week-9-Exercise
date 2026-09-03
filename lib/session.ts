const SESSION_KEY = 'access_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(SESSION_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(SESSION_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(SESSION_KEY);
}