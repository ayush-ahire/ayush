"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_CLASS = "dark";

/**
 * Applies a theme to the document. Mirrored by the blocking script in the root
 * layout, which runs before first paint — the duplication is deliberate, since
 * an import from a "use client" module can't be used in the server tree.
 */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle(DARK_CLASS, theme === "dark");
  root.style.colorScheme = theme;
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", theme === "dark" ? "#08080a" : "#fafafa");
  }
}

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    // Private browsing and blocked storage both throw here; fall back to the
    // system preference rather than failing to render.
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(): Theme {
  return readStoredTheme() ?? systemTheme();
}

/*
 * The `dark` class on <html> is the single source of truth for the active
 * theme, and React reads it as an external store.
 *
 * An effect that resolved the theme and pushed it into state would render the
 * light palette once before correcting itself, and would then need a
 * MutationObserver anyway to notice later changes. Reading the class directly
 * means there is no second copy of the theme to keep in step: the store
 * reports the class that is actually on the document, before paint.
 */

function subscribeToTheme(onStoreChange: () => void) {
  /*
   * The layout's blocking script has normally already resolved the theme. It
   * cannot run when storage throws, though, so re-resolve here — in the commit
   * phase, where touching the DOM is what effects are for — before observing.
   */
  applyTheme(resolveTheme());

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains(DARK_CLASS) ? "dark" : "light";
}

/** Matches the class the server rendered with: no `dark`, so light. */
function getServerThemeSnapshot(): Theme {
  return "light";
}

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The theme still applies for this visit even if it can't be persisted.
    }
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === "dark", setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}