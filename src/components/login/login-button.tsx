'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@/lib/supabase/client';
import { signInWithGoogle } from '@/services/auth-service';

type AppAuthError = 'unauthorized' | 'session_expired' | 'oauth_failed' | 'popup_blocked';

const ERROR_KEY_MAP: Record<AppAuthError, string> = {
  unauthorized: 'error.unauthorized',
  session_expired: 'error.sessionExpired',
  oauth_failed: 'error.oauthFailed',
  popup_blocked: 'error.popupBlocked',
};

interface LoginButtonProps {
  initialError?: string;
}

type ButtonState = 'idle' | 'loading' | 'error';

function getErrorKey(errorCode: string): AppAuthError {
  const valid: AppAuthError[] = [
    'unauthorized',
    'session_expired',
    'oauth_failed',
    'popup_blocked',
  ];
  return valid.includes(errorCode as AppAuthError)
    ? (errorCode as AppAuthError)
    : 'oauth_failed';
}

export default function LoginButton({ initialError }: LoginButtonProps): ReactNode {
  const t = useTranslations('login');
  const [state, setState] = useState<ButtonState>('idle');
  const [errorKey, setErrorKey] = useState<AppAuthError | null>(
    initialError ? getErrorKey(initialError) : null,
  );

  useEffect(() => {
    if (initialError) {
      setErrorKey(getErrorKey(initialError));
      setState('error');
    }
  }, [initialError]);

  async function handleClick() {
    setState('loading');
    setErrorKey(null);

    const supabase = createBrowserClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`;

    const { error } = await signInWithGoogle(supabase, redirectTo);

    if (error) {
      setErrorKey('oauth_failed');
      setState('error');
    }
  }

  const isLoading = state === 'loading';
  const errorMessage = errorKey
    ? t(ERROR_KEY_MAP[errorKey] as Parameters<typeof t>[0])
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignSelf: 'flex-start' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-busy={isLoading}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 'var(--spacing-btn-login-padding-y)',
          paddingBottom: 'var(--spacing-btn-login-padding-y)',
          paddingLeft: 'var(--spacing-btn-login-padding-x)',
          paddingRight: 'var(--spacing-btn-login-padding-x)',
          gap: 'var(--spacing-btn-login-gap)',
          borderRadius: 'var(--radius-login-btn)',
          backgroundColor: 'var(--color-btn-login-bg)',
          color: 'var(--color-btn-login-text)',
          fontSize: 'var(--font-size-btn-login)',
          lineHeight: 'var(--line-height-btn-login)',
          letterSpacing: 'var(--letter-spacing-btn-login)',
          fontWeight: 700,
          fontFamily: 'Montserrat, sans-serif',
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          width: 'var(--width-btn-login)',
          height: 'var(--height-btn-login)',
          flexShrink: 0,
          transition: 'box-shadow 0.2s ease',
          boxShadow: 'none',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              'var(--shadow-login-btn-hover)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        }}
      >
        <span>{t('buttonLabel')}</span>
        {isLoading ? (
          <span
            aria-hidden="true"
            style={{
              width: 24,
              height: 24,
              border: '2px solid var(--color-btn-login-text)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }}
          />
        ) : (
          <Image
            src="/assets/login/icons/google.png"
            width={24}
            height={24}
            alt="Google"
            aria-hidden="true"
          />
        )}
      </button>

      {errorMessage && (
        <p
          role="alert"
          style={{
            color: 'var(--color-text-on-dark)',
            fontSize: 'var(--font-size-lang-label)',
            lineHeight: 'var(--line-height-lang-label)',
            maxWidth: '305px',
          }}
        >
          {errorMessage}
        </p>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
