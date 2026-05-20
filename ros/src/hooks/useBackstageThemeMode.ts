import { useState, useEffect } from 'react';

/**
 * Reads Backstage's theme mode from the `data-theme-mode` attribute on `document.body`.
 * Observes mutations so the returned value stays in sync when Backstage toggles the mode.
 */
export function useBackstageThemeMode(): 'light' | 'dark' {
  const read = () =>
    document.body.getAttribute('data-theme-mode') === 'dark' ? 'dark' : 'light';

  const [mode, setMode] = useState<'light' | 'dark'>(read);

  useEffect(() => {
    const observer = new MutationObserver(() => setMode(read()));
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme-mode'],
    });
    return () => observer.disconnect();
  }, []);

  return mode;
}
