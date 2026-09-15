import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'light';

interface ThemeContextType {
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: true,
});

const THEME_STORAGE_KEY = 'venue_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: AppTheme }> = ({
  children,
  initialTheme,
}) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    // 1. Initial prop or stored preference
    if (initialTheme) return initialTheme;
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Ignore
    }
    // Default to VENUE dark theme
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'light') {
      root.classList.remove('theme-dark', 'dark');
      root.classList.add('theme-light', 'light');
      root.setAttribute('data-theme', 'light');
      body.classList.remove('theme-dark', 'dark');
      body.classList.add('theme-light', 'light');
    } else {
      root.classList.remove('theme-light', 'light');
      root.classList.add('theme-dark', 'dark');
      root.setAttribute('data-theme', 'dark');
      body.classList.remove('theme-light', 'light');
      body.classList.add('theme-dark', 'dark');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
