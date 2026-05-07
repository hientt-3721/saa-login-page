import type { ReactNode } from 'react';
import Image from 'next/image';
import LanguageSelector from '@/components/login/language-selector';

export default function Header(): ReactNode {
  return (
    <header
      role="banner"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '24px',
        paddingBottom: '24px',
        paddingLeft: 'var(--spacing-page-padding-x)',
        paddingRight: 'var(--spacing-page-padding-x)',
        backgroundColor: 'var(--color-header-bg)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Image
        src="/assets/login/icons/logo.png"
        width={52}
        height={48}
        alt="SAA 2025 logo"
        style={{ objectFit: 'cover' }}
        priority
      />
      <LanguageSelector />
    </header>
  );
}
