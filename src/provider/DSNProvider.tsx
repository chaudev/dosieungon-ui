import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import '../styles/variables.css';

// ── Types ─────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  /** The active setting: 'light', 'dark', or 'system' */
  theme: Theme;
  /** The actual rendered theme — always 'light' or 'dark' */
  resolvedTheme: ResolvedTheme;
  /** Update the theme. Persists to localStorage unless controlled. */
  setTheme: (theme: Theme) => void;
}

export interface DSNProviderProps {
  children: React.ReactNode;
  /**
   * Initial theme when no localStorage value exists.
   * Default: 'system'
   */
  defaultTheme?: Theme;
  /**
   * Controlled theme. When provided the Provider becomes controlled
   * and setTheme() from useTheme() is a no-op.
   */
  theme?: Theme;
  /**
   * localStorage key used to persist the chosen theme.
   * Default: 'dsg-theme'
   */
  storageKey?: string;
  /**
   * When true, also mirrors the resolved theme onto
   * document.documentElement:
   *   - sets data-dsg-theme attribute  →  CSS cascade for portal
   *     elements (Modal, Drawer) that render outside this div
   *   - toggles class "dark" / "light"  →  Tailwind dark: utilities
   *
   * Default: true
   */
  syncDocument?: boolean;
}

// ── Context ───────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

// ── Helpers ───────────────────────────────────────────────────────

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStorage(key: string, fallback: Theme): Theme {
  try {
    const v = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch { /* private browsing / SSR */ }
  return fallback;
}

// ── Provider ──────────────────────────────────────────────────────

export function DSNProvider({
  children,
  defaultTheme = 'system',
  theme: themeProp,
  storageKey = 'dsg-theme',
  syncDocument = true,
}: DSNProviderProps) {
  const isControlled = themeProp !== undefined;

  // Initialise from localStorage (client) or default (SSR)
  const [theme, setThemeState] = useState<Theme>(() =>
    isControlled ? themeProp! : readStorage(storageKey, defaultTheme)
  );

  // Track system dark-mode preference
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Whether the component has mounted on the client
  // Used to defer data-dsg-theme on wrapper div, preventing SSR/hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Sync when controlled prop changes
  useEffect(() => {
    if (isControlled && themeProp !== undefined) setThemeState(themeProp);
  }, [isControlled, themeProp]);

  // Mark as mounted and sync system theme on the client
  useEffect(() => {
    setMounted(true);
    setSystemTheme(getSystemTheme());
  }, []);

  // Listen for OS-level dark mode changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) =>
      setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // Mirror onto <html> so portals (Modal/Drawer) and Tailwind dark: utilities work
  useEffect(() => {
    if (!syncDocument || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-dsg-theme', resolvedTheme);
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.classList.toggle('light', resolvedTheme === 'light');
  }, [syncDocument, resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    if (isControlled) return;
    setThemeState(next);
    try { localStorage.setItem(storageKey, next); } catch { /* ignore */ }
  }, [isControlled, storageKey]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {/* data-dsg-theme is omitted until mounted to avoid SSR/hydration mismatch.
          Before mount, dark mode is handled by the CSS media query on :root. */}
      <div data-dsg-theme={mounted ? resolvedTheme : undefined} style={{ display: 'contents' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────

/**
 * Returns the current theme state and a setter.
 * Must be used inside <DSNProvider>.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
