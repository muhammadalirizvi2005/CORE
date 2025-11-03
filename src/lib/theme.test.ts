import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setTheme, getStoredTheme } from './theme';

// Vitest + JSDOM tests for theme helper. These tests assume a browser-like environment
// (provided by Vitest's default jsdom runner).

describe('theme helper', () => {
  beforeEach(() => {
    // reset DOM and storage
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('sets dark theme and persists', () => {
    setTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('sets light theme and persists', () => {
    setTheme('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('sets auto theme and follows system preference (dark)', () => {
    // mock matchMedia to return matches=true
    const original = window.matchMedia;
    // @ts-ignore
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: true,
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    setTheme('auto');
    expect(localStorage.getItem('theme')).toBe('auto');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    window.matchMedia = original;
  });

  it('sets auto theme and follows system preference (light)', () => {
    const original = window.matchMedia;
    // @ts-ignore
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: false,
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    setTheme('auto');
    expect(localStorage.getItem('theme')).toBe('auto');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    window.matchMedia = original;
  });

  it('getStoredTheme reads normalized values (white -> light)', () => {
    localStorage.setItem('theme', 'white');
    expect(getStoredTheme()).toBe('light');
  });
});
