import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: () => [],
    set: vi.fn(),
  }),
}));

// Mock next/navigation
const mockRedirect = vi.fn((url: string) => {
  throw { digest: `NEXT_REDIRECT:${url}` };
});
vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}));

// Mock env
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    ALLOWED_EMAIL_DOMAIN: 'sun-asterisk.com',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

const mockExchangeCodeForSession = vi.fn();
const mockCreateServerClient = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => mockCreateServerClient(),
}));

vi.mock('@/services/auth-service', () => ({
  validateEmailDomain: vi.fn((email: string, domain: string) =>
    email.endsWith(`@${domain}`),
  ),
  getAllowedEmailDomain: vi.fn(() => 'sun-asterisk.com'),
}));

describe('GET /auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function callRoute(params: Record<string, string>) {
    const url = new URL('http://localhost:3000/auth/callback');
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const req = new NextRequest(url);

    mockCreateServerClient.mockReturnValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
    });

    const { GET } = await import('@/app/auth/callback/route');
    return GET(req);
  }

  it('redirects to / on valid code and corporate email', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: {
        session: { user: { email: 'user@sun-asterisk.com' } },
      },
      error: null,
    });

    await expect(callRoute({ code: 'valid-code' })).rejects.toBeDefined();
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('redirects to /login?error=unauthorized for non-corporate email', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: {
        session: { user: { email: 'user@gmail.com' } },
      },
      error: null,
    });

    await expect(callRoute({ code: 'valid-code' })).rejects.toBeDefined();
    expect(mockRedirect).toHaveBeenCalledWith('/login?error=unauthorized');
  });

  it('redirects to /login?error=session_expired on failed code exchange', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Code exchange failed' },
    });

    await expect(callRoute({ code: 'bad-code' })).rejects.toBeDefined();
    expect(mockRedirect).toHaveBeenCalledWith('/login?error=session_expired');
  });

  it('redirects to /login?error=session_expired when no code provided', async () => {
    await expect(callRoute({})).rejects.toBeDefined();
    expect(mockRedirect).toHaveBeenCalledWith('/login?error=session_expired');
  });

  it('falls back to / when next param is an external URL', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: {
        session: { user: { email: 'user@sun-asterisk.com' } },
      },
      error: null,
    });

    await expect(callRoute({ code: 'valid-code', next: 'https://evil.com' })).rejects.toBeDefined();
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('redirects to next param when it is a safe relative path', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: {
        session: { user: { email: 'user@sun-asterisk.com' } },
      },
      error: null,
    });

    await expect(callRoute({ code: 'valid-code', next: '/dashboard' })).rejects.toBeDefined();
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });
});
