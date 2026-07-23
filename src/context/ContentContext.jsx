import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { resolveContent } from '../data/content';

// Fetches dashboard content overrides once and exposes useContent(key), which
// returns the override or the hardcoded default. Prerendered HTML already has
// the resolved copy baked in; this handles live SPA navigation and edits made
// since the last build.
const ContentContext = createContext({ overrides: {} });

export function ContentProvider({ children }) {
  const [overrides, setOverrides] = useState({});

  useEffect(() => {
    let alive = true;
    fetch('/api/content')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && data?.content) setOverrides(data.content);
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => ({ overrides }), [overrides]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

// useContent('home.hero.title') -> override or default.
export function useContent(key) {
  const { overrides } = useContext(ContentContext);
  return resolveContent(overrides, key);
}

// A resolver bound to the current overrides, for components that read several
// keys: const c = useContentResolver(); c('home.hero.title').
export function useContentResolver() {
  const { overrides } = useContext(ContentContext);
  return (key) => resolveContent(overrides, key);
}
