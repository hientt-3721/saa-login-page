'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/hooks/use-language';

type Locale = 'vi' | 'en';

interface LanguageOption {
  value: Locale;
  label: string;
  flagSrc: string;
  flagAlt: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    value: 'vi',
    label: 'VN',
    flagSrc: '/assets/login/icons/flag-vn.png',
    flagAlt: 'VN flag',
  },
  {
    value: 'en',
    label: 'EN',
    flagSrc: '/assets/login/icons/flag-en.svg',
    flagAlt: 'EN flag',
  },
];

export default function LanguageSelector(): ReactNode {
  const t = useTranslations('login.lang');
  const router = useRouter();
  const { locale, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const currentOption =
    LANGUAGE_OPTIONS.find((o) => o.value === locale) ?? LANGUAGE_OPTIONS[0];

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(0);
  }, []);

  const openDropdown = useCallback(() => {
    setIsOpen(true);
    setFocusedIndex(0);
  }, []);

  const selectOption = useCallback(
    (option: LanguageOption) => {
      setLanguage(option.value);
      closeDropdown();
      router.refresh();
    },
    [setLanguage, closeDropdown, router],
  );

  // Close on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [closeDropdown]);

  // Focus management when dropdown opens
  useEffect(() => {
    if (isOpen) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen) { closeDropdown(); } else { openDropdown(); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      openDropdown();
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  }

  function handleOptionKeyDown(e: React.KeyboardEvent, index: number, option: LanguageOption) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectOption(option);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(index + 1, LANGUAGE_OPTIONS.length - 1);
      setFocusedIndex(next);
      optionRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(index - 1, 0);
      setFocusedIndex(prev);
      optionRefs.current[prev]?.focus();
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleTriggerKeyDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-lang-btn-gap)',
          padding: 'var(--spacing-lang-btn-padding)',
          borderRadius: 'var(--radius-lang-btn)',
          backgroundColor: 'transparent',
          border: '1px solid var(--color-divider)',
          color: 'var(--color-text-on-dark)',
          fontSize: 'var(--font-size-lang-label)',
          lineHeight: 'var(--line-height-lang-label)',
          fontWeight: 700,
          fontFamily: 'Montserrat, sans-serif',
          cursor: 'pointer',
          minWidth: '44px',
          minHeight: '44px',
        }}
      >
        <Image
          src={currentOption.flagSrc}
          width={24}
          height={24}
          alt={currentOption.flagAlt}
        />
        <span>{t(currentOption.value)}</span>
        <Image
          src="/assets/login/icons/chevron-down.png"
          width={24}
          height={24}
          alt="chevron-down"
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Language selection"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            zIndex: 100,
            listStyle: 'none',
            margin: 0,
            padding: '4px 0',
            borderRadius: 'var(--radius-lang-btn)',
            backgroundColor: 'var(--color-lang-dropdown-bg)',
            border: '1px solid var(--color-divider)',
            minWidth: '100%',
          }}
        >
          {LANGUAGE_OPTIONS.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={locale === option.value}
              tabIndex={-1}
              ref={(el) => { optionRefs.current[index] = el; }}
              onClick={() => selectOption(option)}
              onKeyDown={(e) => handleOptionKeyDown(e, index, option)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-lang-btn-gap)',
                padding: 'var(--spacing-lang-btn-padding)',
                cursor: 'pointer',
                color: 'var(--color-text-on-dark)',
                fontSize: 'var(--font-size-lang-label)',
                fontWeight: locale === option.value ? 700 : 400,
                fontFamily: 'Montserrat, sans-serif',
                outline: 'none',
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLLIElement).style.backgroundColor =
                  'var(--color-lang-item-hover-bg)';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLLIElement).style.backgroundColor = '';
              }}
            >
              <Image
                src={option.flagSrc}
                width={24}
                height={24}
                alt={option.flagAlt}
              />
              <span>{t(option.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
