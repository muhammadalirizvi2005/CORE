import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Apply saved theme (or system) before React mounts so the initial paint uses correct colors.
const applyInitialTheme = () => {
  const raw = localStorage.getItem('theme') || 'auto';
  const t = raw === 'white' ? 'light' : raw;
  const root = document.documentElement;
  if (t === 'dark') {
    root.classList.add('dark');
  } else if (t === 'light') {
    root.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) root.classList.add('dark'); else root.classList.remove('dark');
  }

  // If 'auto', keep listening to system changes
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    const current = localStorage.getItem('theme') || 'auto';
    if (current === 'auto') {
      const prefers = mq.matches;
      if (prefers) root.classList.add('dark'); else root.classList.remove('dark');
    }
  };
  if (mq && mq.addEventListener) mq.addEventListener('change', handler);
  else if (mq && mq.addListener) mq.addListener(handler as any);
};

applyInitialTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
