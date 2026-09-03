import { api } from '@/lib/api';
import { setToken, clearToken } from '@/lib/session';
import { lastRequest, mockFetchOnce } from './helpers/mockFetch';

describe('api()', () => {
  beforeEach(() => {
    clearToken();
  });

  it('adds Authorization header when a session token exists', async () => {
    setToken('test-token');

    mockFetchOnce(200, { success: true });

    await api('/tasks');

    const { init } = lastRequest();

    const headers = new Headers(init.headers);

    expect(headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('does not add Authorization header when no session exists', async () => {
    clearToken();

    mockFetchOnce(200, { success: true });

    await api('/tasks');

    const { init } = lastRequest();

    const headers = new Headers(init.headers);

    expect(headers.get('Authorization')).toBeNull();
  });
});