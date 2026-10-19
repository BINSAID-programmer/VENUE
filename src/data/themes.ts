/**
 * VENUE themes — 8 swappable palettes (4 light + 4 dark).
 * Colors for the UI live in src/index.css as --venue-* tokens (one block per
 * theme id). This file holds the metadata and the preview swatches.
 * To replace a theme: edit its entry here and its token block in index.css.
 */

export type ThemeMode = 'light' | 'dark';

export type LightThemeId = 'blue' | 'green' | 'purple' | 'beige';
export type DarkThemeId = 'dark-blue' | 'dark-teal' | 'dark-purple' | 'dark-gold';
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

const def = (
  id: ThemeId, name: string, mode: ThemeMode, shortDesc: string, fullDesc: string,
  pairedThemeId: ThemeId, swatches: ThemeSwatches
): ThemeDefinition => ({ id, name, mode, shortDesc, fullDesc, swatches, pairedThemeId });

export const LIGHT_THEMES: ThemeDefinition[] = [
  def('blue', 'Blue', 'light', 'Clean & fresh', 'Clean, bright blue — fresh and easy to read.', 'dark-blue', { page: '#eef4fc', card: '#ffffff', accent: '#2563eb', text: '#0f1b33', border: '#cfdcee' }),
  def('green', 'Green', 'light', 'Calm & focused', 'Calm natural green — relaxed and focused for long study sessions.', 'dark-teal', { page: '#eef6f0', card: '#ffffff', accent: '#15803d', text: '#0f2418', border: '#c9dfd0' }),
  def('purple', 'Purple', 'light', 'Modern & creative', 'Modern violet — creative and stylish.', 'dark-purple', { page: '#f4f0fb', card: '#ffffff', accent: '#7c3aed', text: '#1d1233', border: '#d9cdee' }),
  def('beige', 'Beige & Orange', 'light', 'Warm & friendly', 'Warm beige with orange accents — friendly and welcoming.', 'dark-gold', { page: '#faf4ea', card: '#fffdf8', accent: '#c2410c', text: '#2b1d0e', border: '#e6d8bd' }),
];

export const DARK_THEMES: ThemeDefinition[] = [
  def('dark-blue', 'Dark Blue', 'dark', 'Professional', 'Deep navy blue — professional and easy on the eyes.', 'blue', { page: '#0b1220', card: '#121b2e', accent: '#2563eb', text: '#f1f5f9', border: '#263552' }),
  def('dark-teal', 'Dark Teal', 'dark', 'Calm & modern', 'Deep teal — calm, modern and relaxing at night.', 'green', { page: '#08181a', card: '#0f2427', accent: '#0f766e', text: '#effafa', border: '#1f4044' }),
  def('dark-purple', 'Dark Purple', 'dark', 'Sleek & creative', 'Deep purple — sleek and creative.', 'purple', { page: '#130d20', card: '#1c1430', accent: '#7c3aed', text: '#f5f0ff', border: '#382a5c' }),
  def('dark-gold', 'Dark Gold', 'dark', 'Elegant & premium', 'Dark charcoal with amber-gold accents — elegant and premium.', 'beige', { page: '#14100a', card: '#1e1810', accent: '#b45309', text: '#fbf5e9', border: '#40331f' }),
];

export const ALL_THEMES: ThemeDefinition[] = [...LIGHT_THEMES, ...DARK_THEMES];

export const THEME_MAP: Record<string, ThemeDefinition> = ALL_THEMES.reduce(
  (acc, t) => { acc[t.id] = t; return acc; },
  {} as Record<string, ThemeDefinition>
);

export const DEFAULT_LIGHT_THEME: LightThemeId = 'blue';
export const DEFAULT_DARK_THEME: DarkThemeId = 'dark-blue';

/** Old theme ids → new ids, so saved preferences (localStorage / Firestore) keep working. */
export const LEGACY_THEME_ALIASES: Record<string, ThemeId> = {
  'soft-blue': 'blue',
  'sage': 'green',
  'lavender': 'purple',
  'rose': 'beige',
  'midnight-blue': 'dark-blue',
  'deep-sage': 'dark-teal',
  'deep-violet': 'dark-purple',
  'deep-rose': 'dark-gold',
  'light': 'blue',
  'dark': 'dark-blue',
};

export function getThemeDefinition(id: string): ThemeDefinition {
  if (THEME_MAP[id]) return THEME_MAP[id];
  const alias = LEGACY_THEME_ALIASES[id];
  if (alias) return THEME_MAP[alias];
  return THEME_MAP[DEFAULT_DARK_THEME];
}
