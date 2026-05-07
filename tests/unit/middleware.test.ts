import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @supabase/ssr before importing middleware
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
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

// Mock next/server so NextResponse works outside Edge Runtime
vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server');
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({
        status: 200,
        headers: new Headers(),
        cookies: { set: vi.fn(), getAll: () => [] },
      })),
      redirect: vi.fn((url: URL | string) => ({
        status: 307,
        headers: new Headers({
          location: typeof url === 'string' ? url : url.toString(),
        }),
        cookies: { set: vi.fn(), getAll: () => [] },
      })),
    },
  };
});

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

function buildMockClient(userEmail: string | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userEmail ? { id: 'u1', email: userEmail } : null },
        error: null,
      }),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createServerClient).mockReturnValue(buildMockClient(null) as never);
});

function makeRequest(path: string): NextRequest {
  const url = new URL(`http://localhost:3000${path}`);
  // Add clone() as NextRequest.nextUrl has it but plain URL doesn't
  const nextUrl = Object.assign(url, { clone: () => new URL(url.toString()) });
  return {
    nextUrl,
    url: url.toString(),
    cookies: { getAll: () => [], set: vi.fn() },
    headers: new Headers(),
  } as unknown as NextRequest;
}

describe('middleware', () => {
  it('redirects unauthenticated request on a protected route to /login', async () => {
    vi.mocked(createServerClient).mockReturnValue(buildMockClient(null) as never);

    const req = makeRequest('/dashboard');
    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const callArg = vi.mocked(NextResponse.redirect).mock.calls[0][0];
    const redirectUrl = typeof callArg === 'string' ? callArg : (callArg as URL).toString();
    expect(redirectUrl).toContain('/login');
    expect(redirectUrl).toContain('next=');
  });

  it('redirects authenticated user from /login to /', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      buildMockClient('user@sun-asterisk.com') as never,
    );

    const req = makeRequest('/login');
    await middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const callArg = vi.mocked(NextResponse.redirect).mock.calls[0][0];
    const redirectUrl = typeof callArg === 'string' ? callArg : (callArg as URL).toString();
    expect(redirectUrl).toBe('http://localhost:3000/');
  });

  it('allows unauthenticated request to /login through without redirect', async () => {
    vi.mocked(createServerClient).mockReturnValue(buildMockClient(null) as never);

    const req = makeRequest('/login');
    await middleware(req);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('allows /auth/callback to always pass through', async () => {
    vi.mocked(createServerClient).mockReturnValue(buildMockClient(null) as never);

    const req = makeRequest('/auth/callback');
    await middleware(req);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
});
