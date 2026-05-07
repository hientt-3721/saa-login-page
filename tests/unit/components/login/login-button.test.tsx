import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import LoginButton from '@/components/login/login-button';

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    ALLOWED_EMAIL_DOMAIN: 'sun-asterisk.com',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

const mockSignInWithGoogle = vi.fn();

vi.mock('@/services/auth-service', () => ({
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => ({})),
}));

const messages = {
  login: {
    buttonLabel: 'LOGIN With Google',
    error: {
      unauthorized: 'Account not authorized.',
      sessionExpired: 'Session expired.',
      oauthFailed: 'Login failed. Please try again.',
      popupBlocked: 'Popup blocked.',
    },
  },
};

function renderButton(props: { initialError?: string } = {}) {
  return render(
    <NextIntlClientProvider locale="vi" messages={messages}>
      <LoginButton {...props} />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginButton', () => {
  it('renders the button label and Google icon', () => {
    renderButton();
    expect(screen.getByRole('button', { name: /login with google/i })).toBeInTheDocument();
    expect(screen.getByAltText(/google/i)).toBeInTheDocument();
  });

  it('shows loading state and disables button on click', async () => {
    mockSignInWithGoogle.mockResolvedValue({ error: null });
    renderButton();

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(button).toBeDisabled();
  });

  it('re-enables button on OAuth error', async () => {
    mockSignInWithGoogle.mockResolvedValue({ error: { message: 'OAuth error' } });
    renderButton();

    const button = screen.getByRole('button');
    await userEvent.click(button);

    await waitFor(() => expect(button).not.toBeDisabled());
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls signInWithGoogle on click', async () => {
    mockSignInWithGoogle.mockResolvedValue({ error: null });
    renderButton();

    await userEvent.click(screen.getByRole('button'));

    expect(mockSignInWithGoogle).toHaveBeenCalledOnce();
  });

  it('renders initialError prop as an error message on mount', () => {
    renderButton({ initialError: 'unauthorized' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
  });

  it('renders session expired error when initialError is session_expired', () => {
    renderButton({ initialError: 'session_expired' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/session expired/i)).toBeInTheDocument();
  });
});
