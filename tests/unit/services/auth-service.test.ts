import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    ALLOWED_EMAIL_DOMAIN: 'sun-asterisk.com',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

import {
  signInWithGoogle,
  getSession,
  getUser,
  validateEmailDomain,
} from '@/services/auth-service';

const mockSignInWithOAuth = vi.fn();
const mockGetSession = vi.fn();
const mockGetUser = vi.fn();

const mockClient = {
  auth: {
    signInWithOAuth: mockSignInWithOAuth,
    getSession: mockGetSession,
    getUser: mockGetUser,
  },
} as unknown as SupabaseClient;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('signInWithGoogle', () => {
  it('calls signInWithOAuth with provider google and correct redirectTo', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

    await signInWithGoogle(mockClient, 'http://localhost:3000/auth/callback');

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
  });

  it('returns error when signInWithOAuth fails', async () => {
    const mockError = { message: 'OAuth error' };
    mockSignInWithOAuth.mockResolvedValue({ data: null, error: mockError });

    const result = await signInWithGoogle(mockClient, 'http://localhost:3000/auth/callback');

    expect(result.error).toBe(mockError);
  });
});

describe('getSession', () => {
  it('returns session when user is authenticated', async () => {
    const mockSession = { user: { id: 'u1', email: 'test@sun-asterisk.com' } };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });

    const result = await getSession(mockClient);

    expect(result.session).toBe(mockSession);
  });

  it('returns null session when no active session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const result = await getSession(mockClient);

    expect(result.session).toBeNull();
  });

  it('returns null and error when getSession errors', async () => {
    const mockError = { message: 'Network error' };
    mockGetSession.mockResolvedValue({ data: { session: null }, error: mockError });

    const result = await getSession(mockClient);

    expect(result.session).toBeNull();
    expect(result.error).toBe(mockError);
  });
});

describe('getUser', () => {
  it('returns user when JWT is valid', async () => {
    const mockUser = { id: 'u1', email: 'test@sun-asterisk.com' };
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const result = await getUser(mockClient);

    expect(result.user).toBe(mockUser);
  });

  it('returns null user when session is invalid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await getUser(mockClient);

    expect(result.user).toBeNull();
  });

  it('returns null and error when getUser errors', async () => {
    const mockError = { message: 'JWT expired' };
    mockGetUser.mockResolvedValue({ data: { user: null }, error: mockError });

    const result = await getUser(mockClient);

    expect(result.user).toBeNull();
    expect(result.error).toBe(mockError);
  });
});

describe('validateEmailDomain', () => {
  it('accepts an email matching the allowed domain', () => {
    expect(validateEmailDomain('user@sun-asterisk.com', 'sun-asterisk.com')).toBe(true);
  });

  it('rejects a personal gmail address', () => {
    expect(validateEmailDomain('user@gmail.com', 'sun-asterisk.com')).toBe(false);
  });

  it('rejects an email with allowed domain as substring', () => {
    expect(validateEmailDomain('user@fake-sun-asterisk.com', 'sun-asterisk.com')).toBe(false);
  });

  it('rejects an empty email', () => {
    expect(validateEmailDomain('', 'sun-asterisk.com')).toBe(false);
  });

  it('rejects email with no domain part', () => {
    expect(validateEmailDomain('nodomain', 'sun-asterisk.com')).toBe(false);
  });
});
