import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    ALLOWED_EMAIL_DOMAIN: 'sun-asterisk.com',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

const mockRedirect = vi.fn((url: string) => {
  throw { digest: `NEXT_REDIRECT:${url}` };
});
vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}));

const mockGetUser = vi.fn();
vi.mock('@/services/auth-service', () => ({
  getUser: (...args: unknown[]) => mockGetUser(...args),
}));

const mockCreateServerClient = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => mockCreateServerClient(),
}));

vi.mock('@/components/login/login-page', () => ({
  default: function LoginPage() { return null; },
}));

import LoginPageRoute from '@/app/login/page';
import LoginPageComponent from '@/components/login/login-page';

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateServerClient.mockReturnValue({});
});

describe('Login page server component', () => {
  it('redirects to / when user is already authenticated', async () => {
    mockGetUser.mockResolvedValue({
      user: { id: 'u1', email: 'user@sun-asterisk.com' },
      error: null,
    });

    await expect(LoginPageRoute({ searchParams: Promise.resolve({}) })).rejects.toMatchObject({
      digest: expect.stringContaining('/'),
    });
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('renders LoginPage when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ user: null, error: null });

    const element = await LoginPageRoute({ searchParams: Promise.resolve({}) }) as ReactElement;

    expect(element).toBeTruthy();
    expect((element as ReactElement).type).toBe(LoginPageComponent);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('passes initialError="unauthorized" when ?error=unauthorized in URL', async () => {
    mockGetUser.mockResolvedValue({ user: null, error: null });

    const element = await LoginPageRoute({ searchParams: Promise.resolve({ error: 'unauthorized' }) }) as ReactElement;

    expect((element as ReactElement).props).toMatchObject({ initialError: 'unauthorized' });
  });

  it('passes initialError="session_expired" when ?error=session_expired in URL', async () => {
    mockGetUser.mockResolvedValue({ user: null, error: null });

    const element = await LoginPageRoute({ searchParams: Promise.resolve({ error: 'session_expired' }) }) as ReactElement;

    expect((element as ReactElement).props).toMatchObject({ initialError: 'session_expired' });
  });

  it('does not pass initialError when no error param', async () => {
    mockGetUser.mockResolvedValue({ user: null, error: null });

    const element = await LoginPageRoute({ searchParams: Promise.resolve({}) }) as ReactElement;

    expect((element as ReactElement).props.initialError).toBeUndefined();
  });
});
