import type { ReactNode } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Header from '@/components/login/header';
import LoginButton from '@/components/login/login-button';

interface LoginPageProps {
  initialError?: string;
}

export default function LoginPage({ initialError }: LoginPageProps): ReactNode {
  const t = useTranslations('login');

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-page)',
        overflow: 'hidden',
      }}
    >
      {/* Layer 1: Hero background photo */}
      <div
        data-bg-layer="photo"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            "url('/assets/login/images/hero-background.png') lightgray -440px -217.975px / 159.763% 133.371% no-repeat",
        }}
      />

      {/* Layer 2: Horizontal gradient overlay */}
      <div
        data-bg-layer="overlay-h"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--color-overlay-h)',
        }}
      />

      {/* Layer 3: Vertical bottom-fade overlay */}
      <div
        data-bg-layer="overlay-v"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--color-overlay-v)',
        }}
      />

      {/* Content above overlays */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />

        {/* Hero section */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 'var(--spacing-page-padding-x)',
            paddingRight: 'var(--spacing-page-padding-x)',
            paddingTop: 'var(--spacing-page-padding-y-hero)',
            paddingBottom: 'var(--spacing-page-padding-y-hero)',
          }}
        >
          {/* Frame 487 — flex-col, gap: 80px (KV above text+button) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 'var(--spacing-hero-stack-gap)',
            }}
          >
            {/* B.1 Key Visual — full-width container, image 451×200 left-aligned */}
            <div style={{ width: '100%', height: 'var(--hero-kv-height)' }}>
              <Image
                src="/assets/login/images/root-further-logo.png"
                width={451}
                height={200}
                alt="Root Further SAA 2025 logo"
                style={{ objectFit: 'contain', display: 'block' }}
                priority
              />
            </div>

            {/* Frame 550 — w=496px, flex-col, gap=24px, pl=16px */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: 'var(--hero-content-frame-width)',
                gap: 'var(--spacing-hero-content-gap)',
                paddingLeft: 'var(--hero-content-frame-pl)',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: 'var(--color-text-on-dark)',
                  fontSize: 'var(--font-size-hero-body)',
                  lineHeight: 'var(--line-height-hero-body)',
                  letterSpacing: 'var(--letter-spacing-hero-body)',
                  fontWeight: 700,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {t('heroLine1')}
                <br />
                {t('heroLine2')}
              </p>
              <LoginButton initialError={initialError} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          role="contentinfo"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: 'var(--border-footer-top)',
            paddingTop: 'var(--spacing-footer-padding-y)',
            paddingBottom: 'var(--spacing-footer-padding-y)',
            paddingLeft: 'var(--spacing-footer-padding-x)',
            paddingRight: 'var(--spacing-footer-padding-x)',
            color: 'var(--color-text-on-dark)',
            fontSize: 'var(--font-size-footer)',
            lineHeight: 'var(--line-height-footer)',
            fontWeight: 700,
            fontFamily: '"Montserrat Alternates", sans-serif',
          }}
        >
          {t('footer')}
        </footer>
      </div>
    </div>
  );
}

