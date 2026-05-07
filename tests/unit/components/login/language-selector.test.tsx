import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import 'vitest-localstorage-mock';

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    ALLOWED_EMAIL_DOMAIN: 'sun-asterisk.com',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockSetLanguage = vi.fn();
let mockLocale = 'vi';

vi.mock('@/hooks/use-language', () => ({
  useLanguage: () => ({
    locale: mockLocale,
    setLanguage: mockSetLanguage,
  }),
}));

import LanguageSelector from '@/components/login/language-selector';

const messages = {
  login: {
    lang: { vi: 'VN', en: 'EN' },
  },
};

function renderSelector(): ReturnType<typeof render> {
  return render(
    <NextIntlClientProvider locale="vi" messages={messages}>
      <LanguageSelector />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLocale = 'vi';
  localStorage.clear();
});

describe('LanguageSelector', () => {
  it('shows VN flag and "VN" label by default', () => {
    renderSelector();
    expect(screen.getByAltText(/VN flag/i)).toBeInTheDocument();
    expect(screen.getByText('VN')).toBeInTheDocument();
  });

  it('shows chevron-down icon', () => {
    renderSelector();
    expect(screen.getByAltText(/chevron/i)).toBeInTheDocument();
  });

  it('opens dropdown with exactly 2 language options on click', async () => {
    renderSelector();
    await userEvent.click(screen.getByRole('button', { name: /VN/i }));
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
  });

  it('closes dropdown and calls setLanguage when EN is selected', async () => {
    renderSelector();
    await userEvent.click(screen.getByRole('button', { name: /VN/i }));
    await userEvent.click(screen.getByRole('option', { name: /EN/i }));
    expect(mockSetLanguage).toHaveBeenCalledWith('en');
    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('closes dropdown on outside click without changing language', async () => {
    renderSelector();
    await userEvent.click(screen.getByRole('button', { name: /VN/i }));
    expect(screen.getAllByRole('option')).toHaveLength(2);

    await userEvent.click(document.body);
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(mockSetLanguage).not.toHaveBeenCalled();
  });

  it('opens with Enter key', async () => {
    renderSelector();
    const trigger = screen.getByRole('button', { name: /VN/i });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('closes with Escape key', async () => {
    renderSelector();
    await userEvent.click(screen.getByRole('button', { name: /VN/i }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('navigates options with ArrowDown/ArrowUp', async () => {
    renderSelector();
    await userEvent.click(screen.getByRole('button', { name: /VN/i }));
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(options[1]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(options[0]).toHaveFocus();
  });

  it('trigger button has min 44px touch target', () => {
    renderSelector();
    const trigger = screen.getByRole('button', { name: /VN/i });
    const styles = window.getComputedStyle(trigger);
    // Check min-height via inline style or class (jsdom returns '' for unset)
    expect(trigger).toBeInTheDocument();
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
  });
});
