export type ThemeMode = 'light' | 'dark';

export type LightThemeId = 'soft-blue' | 'sage' | 'rose' | 'lavender';
export type DarkThemeId = 'midnight-blue' | 'deep-sage' | 'deep-rose' | 'deep-violet';

export type ThemeId = LightThemeId | DarkThemeId;

export interface ThemeSwatches {
  page: string;
  card: string;
  accent: string;
  text: string;
  border: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  mode: ThemeMode;
  shortDesc: string;
  fullDesc: string;
  swatches: ThemeSwatches;
  pairedThemeId: ThemeId;
}

export const LIGHT_THEMES: ThemeDefinition[] = [
  {
    id: 'soft-blue',
    name: 'Soft Blue',
    mode: 'light',
    shortDesc: 'Soft blue-gray • Gentle blue',
    fullDesc: 'Calm academic blue-gray canvas with gentle royal accents and soft neutral cards.',
    swatches: {
      page: '#f0f3f8',
      card: '#ffffff',
      accent: '#2563eb',
      text: '#0f172a',
      border: '#dbe2ec',
    },
    pairedThemeId: 'midnight-blue',
  },
  {
    id: 'sage',
    name: 'Sage',
    mode: 'light',
    shortDesc: 'Very light sage • Muted green',
    fullDesc: 'Restful botanical sage-gray canvas with earthy muted green accents and natural serenity.',
    swatches: {
      page: '#f0f4f1',
      card: '#ffffff',
      accent: '#2e6945',
      text: '#111b13',
      border: '#d1ded4',
    },
    pairedThemeId: 'deep-sage',
  },
  {
    id: 'rose',
    name: 'Rose',
    mode: 'light',
    shortDesc: 'Dusty rose • Muted berry',
    fullDesc: 'Subtle dusty rose-tinted neutral canvas with refined cranberry accents.',
    swatches: {
      page: '#f6f1f2',
      card: '#ffffff',
      accent: '#9b415a',
      text: '#201316',
      border: '#e2d2d6',
    },
    pairedThemeId: 'deep-rose',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    mode: 'light',
    shortDesc: 'Lavender-gray • Muted purple',
    fullDesc: 'Delicate mist-lavender neutral canvas with modern, gentle violet accents.',
    swatches: {
      page: '#f3f1f7',
      card: '#ffffff',
      accent: '#6c47a6',
      text: '#191424',
      border: '#d9d3e5',
    },
    pairedThemeId: 'deep-violet',
  },
];

export const DARK_THEMES: ThemeDefinition[] = [
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    mode: 'dark',
    shortDesc: 'Deep blue-gray • Muted blue',
    fullDesc: 'Deep navy-slate neutral canvas with calm, professional azure accents.',
    swatches: {
      page: '#0c101a',
      card: '#131926',
      accent: '#3b82f6',
      text: '#f1f5f9',
      border: '#232f45',
    },
    pairedThemeId: 'soft-blue',
  },
  {
    id: 'deep-sage',
    name: 'Deep Sage',
    mode: 'dark',
    shortDesc: 'Deep green-gray • Muted sage',
    fullDesc: 'Deep pine-charcoal neutral canvas with sophisticated, soft herbal accents.',
    swatches: {
      page: '#0d1410',
      card: '#141e18',
      accent: '#448a5c',
      text: '#edf4ef',
      border: '#263a2f',
    },
    pairedThemeId: 'sage',
  },
  {
    id: 'deep-rose',
    name: 'Deep Rose',
    mode: 'dark',
    shortDesc: 'Muted burgundy • Soft rose',
    fullDesc: 'Deep mulberry-charcoal neutral canvas with soft, non-aggressive dusky rose accents.',
    swatches: {
      page: '#140f12',
      card: '#1f161a',
      accent: '#b3566f',
      text: '#f6eff1',
      border: '#3b2b33',
    },
    pairedThemeId: 'rose',
  },
  {
    id: 'deep-violet',
    name: 'Deep Violet',
    mode: 'dark',
    shortDesc: 'Deep violet-gray • Soft purple',
    fullDesc: 'Deep amethyst-charcoal canvas with muted, modern lavender highlights.',
    swatches: {
      page: '#110e1a',
      card: '#191426',
      accent: '#855ec7',
      text: '#f3eff9',
      border: '#33294c',
    },
    pairedThemeId: 'lavender',
  },
];

export const ALL_THEMES: ThemeDefinition[] = [...LIGHT_THEMES, ...DARK_THEMES];

export const THEME_MAP: Record<ThemeId, ThemeDefinition> = ALL_THEMES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ThemeId, ThemeDefinition>
);

export const DEFAULT_LIGHT_THEME: ThemeId = 'soft-blue';
export const DEFAULT_DARK_THEME: ThemeId = 'midnight-blue';

export function getThemeDefinition(id: string | null | undefined): ThemeDefinition {
  if (id && id in THEME_MAP) {
    return THEME_MAP[id as ThemeId];
  }
  if (id === 'light') return THEME_MAP[DEFAULT_LIGHT_THEME];
  if (id === 'dark') return THEME_MAP[DEFAULT_DARK_THEME];
  return THEME_MAP[DEFAULT_DARK_THEME];
}
