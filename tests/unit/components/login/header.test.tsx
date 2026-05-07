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

const messages = {
  login: { lang: { vi: 'VN', en: 'EN' } },
};

import Header from '@/components/login/header';

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="vi" messages={messages}>
      <Header />
    </NextIntlClientProvider>,
  );
}

describe('Header', () => {
  it('renders SAA logo with correct src and alt text', () => {
    renderHeader();
    const logo = screen.getByAltText(/SAA.*logo|logo.*SAA/i);
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('src')).toContain('logo');
  });

  it('renders LanguageSelector', () => {
    renderHeader();
    // LanguageSelector renders a button with aria-haspopup="listbox"
    const langButton = screen.getByRole('button', { name: /VN/i });
    expect(langButton).toBeInTheDocument();
  });
});
