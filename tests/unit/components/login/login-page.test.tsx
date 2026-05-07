import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    ALLOWED_EMAIL_DOMAIN: 'sun-asterisk.com',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

vi.mock('@/hooks/use-language', () => ({
  useLanguage: () => ({ locale: 'vi', setLanguage: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => ({})),
}));

vi.mock('@/services/auth-service', () => ({
  signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
}));

const messages = {
  login: {
    heroLine1: 'Hero line 1',
    heroLine2: 'Hero line 2',
    buttonLabel: 'LOGIN With Google',
    footer: 'Copyright Sun*',
    lang: { vi: 'VN', en: 'EN' },
    error: {
      unauthorized: 'Not authorized.',
      sessionExpired: 'Session expired.',
      oauthFailed: 'Login failed.',
      popupBlocked: 'Popup blocked.',
    },
  },
};

import LoginPage from '@/components/login/login-page';

function renderLoginPage(props: { initialError?: string } = {}) {
  return render(
    <NextIntlClientProvider locale="vi" messages={messages}>
      <LoginPage {...props} />
    </NextIntlClientProvider>,
  );
}

describe('LoginPage', () => {
  it('renders header section', () => {
    renderLoginPage();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders 3 background layer divs', () => {
    renderLoginPage();
    expect(document.querySelector('[data-bg-layer="photo"]')).toBeInTheDocument();
    expect(document.querySelector('[data-bg-layer="overlay-h"]')).toBeInTheDocument();
    expect(document.querySelector('[data-bg-layer="overlay-v"]')).toBeInTheDocument();
  });

  it('renders hero section with content', () => {
    renderLoginPage();
    expect(screen.getByText(/Hero line 1/)).toBeInTheDocument();
    expect(screen.getByText(/Hero line 2/)).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderLoginPage();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText('Copyright Sun*')).toBeInTheDocument();
  });

  it('forwards initialError prop to LoginButton', () => {
    renderLoginPage({ initialError: 'unauthorized' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders Key Visual image', () => {
    renderLoginPage();
    const kv = screen.getByAltText('Root Further SAA 2025 logo');
    expect(kv).toBeInTheDocument();
  });
});
