import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  ThemeId,
  ThemeDefinition,
  LIGHT_THEMES,
  DARK_THEMES,
  ALL_THEMES,
  THEME_MAP,
  DEFAULT_LIGHT_THEME,
  DEFAULT_DARK_THEME,
  getThemeDefinition,
} from '../data/themes';

export type AppTheme = ThemeId | 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export interface ThemeContextType {
  theme: AppTheme;
  themeId: ThemeId;
  themeDef: ThemeDefinition;
  resolvedTheme: ResolvedTheme;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
  setThemeId: (id: ThemeId) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_DARK_THEME,
  themeId: DEFAULT_DARK_THEME,
  themeDef: THEME_MAP[DEFAULT_DARK_THEME],
  resolvedTheme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  setThemeId: () => {},
  isDark: true,
});

export const THEME_STORAGE_KEY = 'venue_theme_preference';
export const THEME_ID_STORAGE_KEY = 'venue_theme_id';

/**
 * Detects current system/device color scheme preference
 */
function getSystemPreference(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark'; // VENUE signature fallback
}

/**
 * Resolves a stored or provided theme string into a valid concrete ThemeId
 */
function resolveToThemeId(input: string | null | undefined, systemMode: ResolvedTheme): ThemeId {
  if (!input) {
    return systemMode === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
  }
  if (input in THEME_MAP) {
    return input as ThemeId;
  }
  if (input === 'light') return DEFAULT_LIGHT_THEME;
  if (input === 'dark') return DEFAULT_DARK_THEME;
  if (input === 'system') {
    return systemMode === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
  }
  return DEFAULT_DARK_THEME;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: AppTheme }> = ({
  children,
  initialTheme,
}) => {
  // Track system preference state
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemPreference);

  // 1. Initialize concrete themeId and theme preference
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const sysPref = getSystemPreference();
    if (initialTheme) {
      return resolveToThemeId(initialTheme, sysPref);
    }
    try {
      const storedId = localStorage.getItem(THEME_ID_STORAGE_KEY);
      if (storedId && storedId in THEME_MAP) {
        return storedId as ThemeId;
      }
      const legacyStored = localStorage.getItem(THEME_STORAGE_KEY);
      if (legacyStored) {
        return resolveToThemeId(legacyStored, sysPref);
      }
    } catch {
      // Ignore localStorage access issues
    }
    return DEFAULT_DARK_THEME;
  });

  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (initialTheme) return initialTheme;
    try {
      const storedId = localStorage.getItem(THEME_ID_STORAGE_KEY);
      if (storedId && storedId in THEME_MAP) {
        return storedId as ThemeId;
      }
      const legacyStored = localStorage.getItem(THEME_STORAGE_KEY);
      if (legacyStored === 'system' || legacyStored === 'light' || legacyStored === 'dark') {
        return legacyStored as AppTheme;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_DARK_THEME;
  });

  const activeDef = THEME_MAP[themeId] || getThemeDefinition(themeId);
  const resolvedTheme: ResolvedTheme = activeDef.mode;

  // Track last synced theme to avoid redundant Firestore writes
  const lastSyncedToFirestore = useRef<AppTheme | null>(null);

  // 2. Listen to system preference changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const newSysMode = e.matches ? 'dark' : 'light';
      setSystemTheme(newSysMode);
      if (theme === 'system') {
        const nextId = newSysMode === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
        setThemeIdState(nextId);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleSystemChange);
      return () => (mediaQuery as any).removeListener(handleSystemChange);
    }
  }, [theme]);

  // 3. Apply classes and data-theme attribute on document root and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const currentDef = THEME_MAP[themeId] || getThemeDefinition(themeId);
    const mode = currentDef.mode;

    // Set attributes for CSS variable styling
    root.setAttribute('data-color-theme', themeId);
    root.setAttribute('data-theme', mode);
    body.setAttribute('data-color-theme', themeId);

    // Remove any previously set theme classes
    ALL_THEMES.forEach((t) => {
      root.classList.remove(`theme-${t.id}`);
      body.classList.remove(`theme-${t.id}`);
    });

    if (mode === 'light') {
      root.classList.remove('theme-dark', 'dark');
      root.classList.add('theme-light', 'light', `theme-${themeId}`);
      body.classList.remove('theme-dark', 'dark');
      body.classList.add('theme-light', 'light', `theme-${themeId}`);
    } else {
      root.classList.remove('theme-light', 'light');
      root.classList.add('theme-dark', 'dark', `theme-${themeId}`);
      body.classList.remove('theme-light', 'light');
      body.classList.add('theme-dark', 'dark', `theme-${themeId}`);
    }

    // Persist to local cache immediately for zero-lag subsequent loads
    try {
      localStorage.setItem(THEME_ID_STORAGE_KEY, themeId);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore quota errors
    }
  }, [theme, themeId]);

  // 4. Helper function to persist theme to Firestore under student profile
  const syncThemeToFirestore = useCallback(async (themeToSync: AppTheme, uid?: string) => {
    const targetUid = uid || auth.currentUser?.uid;
    if (!targetUid) return;

    if (lastSyncedToFirestore.current === themeToSync) {
      return; // Deduplicated, avoid unnecessary Firestore write
    }

    try {
      lastSyncedToFirestore.current = themeToSync;
      const studentDocRef = doc(db, 'students', targetUid);
      await setDoc(
        studentDocRef,
        { themePreference: themeToSync, updatedAt: new Date().toISOString() },
        { merge: true }
      );

      // Also update local cached profile if present
      const cachedProfRaw = localStorage.getItem(`venue_profile_${targetUid}`);
      if (cachedProfRaw) {
        try {
          const parsed = JSON.parse(cachedProfRaw);
          parsed.themePreference = themeToSync;
          localStorage.setItem(`venue_profile_${targetUid}`, JSON.stringify(parsed));
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      console.warn('Firestore theme sync note (working offline):', err);
    }
  }, []);

  // 5. When auth state changes (or user logs in on another device), restore saved theme preference
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        // First check cached profile for immediate rendering
        const cachedProfRaw = localStorage.getItem(`venue_profile_${user.uid}`);
        if (cachedProfRaw) {
          const cached = JSON.parse(cachedProfRaw);
          if (cached.themePreference && !localStorage.getItem(THEME_ID_STORAGE_KEY)) {
            const resolved = resolveToThemeId(cached.themePreference, systemTheme);
            setThemeIdState(resolved);
            setThemeState(cached.themePreference);
            lastSyncedToFirestore.current = cached.themePreference;
            return;
          }
        }

        // Check remote Firestore preference
        const studentDoc = await getDoc(doc(db, 'students', user.uid));
        if (studentDoc.exists()) {
          const data = studentDoc.data();
          const remotePref = data?.themePreference as string | undefined;
          if (remotePref) {
            const resolved = resolveToThemeId(remotePref, systemTheme);
            const localStored = localStorage.getItem(THEME_ID_STORAGE_KEY);
            if (!localStored) {
              setThemeIdState(resolved);
              setThemeState(remotePref in THEME_MAP ? (remotePref as ThemeId) : resolved);
            }
            lastSyncedToFirestore.current = remotePref as AppTheme;
          } else {
            // Write current local theme to Firestore so user's account has it
            syncThemeToFirestore(themeId, user.uid);
          }
        }
      } catch (e) {
        console.warn('Could not read user theme from Firestore:', e);
      }
    });

    return () => unsubscribe();
  }, [syncThemeToFirestore, systemTheme, themeId]);

  // Set concrete themeId handler
  const setThemeId = (newThemeId: ThemeId) => {
    if (!THEME_MAP[newThemeId]) return;
    setThemeState(newThemeId);
    setThemeIdState(newThemeId);
    syncThemeToFirestore(newThemeId);
  };

  // Set theme handler (accepts ThemeId or legacy 'dark' | 'light' | 'system')
  const setTheme = (newTheme: AppTheme) => {
    if (newTheme === 'system') {
      setThemeState('system');
      const sys = getSystemPreference();
      const resolvedId = sys === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
      setThemeIdState(resolvedId);
      syncThemeToFirestore('system');
      return;
    }
    if (newTheme === 'light') {
      setThemeId(DEFAULT_LIGHT_THEME);
      return;
    }
    if (newTheme === 'dark') {
      setThemeId(DEFAULT_DARK_THEME);
      return;
    }
    if (newTheme in THEME_MAP) {
      setThemeId(newTheme as ThemeId);
    }
  };

  // Toggle theme handler (paired dark/light switch)
  const toggleTheme = () => {
    const currentDef = THEME_MAP[themeId] || getThemeDefinition(themeId);
    const nextId = currentDef.pairedThemeId;
    setThemeId(nextId);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeId,
        themeDef: activeDef,
        resolvedTheme,
        toggleTheme,
        setTheme,
        setThemeId,
        isDark: resolvedTheme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
