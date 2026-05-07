import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import 'vitest-localstorage-mock';

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    ALLOWED_EMAIL_DOMAIN: 'sun-asterisk.com',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

import { useLanguage } from '@/hooks/use-language';

beforeEach(() => {
  localStorage.clear();
  document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  vi.clearAllMocks();
});

describe('useLanguage', () => {
  it('reads locale from localStorage on mount', async () => {
    localStorage.setItem('NEXT_LOCALE', 'en');

    const { result } = renderHook(() => useLanguage());
    // useEffect runs after mount
    await act(async () => {});

    expect(result.current.locale).toBe('en');
  });

  it('defaults to "vi" when localStorage has no value', async () => {
    const { result } = renderHook(() => useLanguage());
    await act(async () => {});

    expect(result.current.locale).toBe('vi');
  });

  it('writes to localStorage on setLanguage', async () => {
    const { result } = renderHook(() => useLanguage());
    await act(async () => {});

    act(() => {
      result.current.setLanguage('en');
    });

    expect(localStorage.getItem('NEXT_LOCALE')).toBe('en');
    expect(result.current.locale).toBe('en');
  });

  it('writes NEXT_LOCALE cookie on setLanguage', async () => {
    const { result } = renderHook(() => useLanguage());
    await act(async () => {});

    act(() => {
      result.current.setLanguage('en');
    });

    expect(document.cookie).toContain('NEXT_LOCALE=en');
  });

  it('falls back to "vi" if localStorage throws on read', async () => {
    const originalGetItem = window.localStorage.getItem;
    Object.defineProperty(window, 'localStorage', {
      value: {
        ...window.localStorage,
        getItem: () => { throw new Error('localStorage unavailable'); },
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useLanguage());
    await act(async () => {});

    expect(result.current.locale).toBe('vi');

    // Restore
    Object.defineProperty(window, 'localStorage', {
      value: { ...window.localStorage, getItem: originalGetItem },
      writable: true,
      configurable: true,
    });
  });
});
