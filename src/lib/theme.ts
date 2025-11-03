// Theme helper utilities: normalize, apply, initialize and read stored theme.
export type ThemeMode = 'light' | 'dark' | 'auto';

export const normalizeTheme = (raw?: string | null): ThemeMode => {
  if (!raw) return 'auto';
  if (raw === 'white') return 'light';
  if (raw === 'light' || raw === 'dark' || raw === 'auto') return raw;
  return 'auto';
};

const dispatch = (theme: ThemeMode) => {
  try {
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
  } catch {}
};

export const applyTheme = (theme: ThemeMode) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) root.classList.add('dark'); else root.classList.remove('dark');
  }
  dispatch(theme);
};

export const setTheme = (themeRaw?: string | null) => {
  const t = normalizeTheme(themeRaw || undefined);
  try {
    localStorage.setItem('theme', t);
  } catch {}
  applyTheme(t);
};

export const getStoredTheme = (): ThemeMode => {
  try {
    return normalizeTheme(localStorage.getItem('theme'));
  } catch {
    return 'auto';
  }
};

// Initialize theme on first load. Applies initial class and listens for system changes when 'auto' is selected.
export const initTheme = () => {
  const current = getStoredTheme();
  applyTheme(current);

  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    const stored = getStoredTheme();
    if (stored === 'auto') applyTheme('auto');
  };

  if (mq && mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq && mq.addListener) mq.addListener(onChange as any);
};
