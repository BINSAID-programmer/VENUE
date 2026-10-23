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
  def('blue', 'Blue', 'light', 'Clean & fresh', 'Clean, bright blue — fresh and easy to read.', 'dark-blue', { page: '#e4f0fc', card: '#f7fbff', accent: '#2563eb', text: '#0c2147', border: '#b9d4f1' }),
  def('green', 'Green', 'light', 'Calm & focused', 'Calm natural green — relaxed and focused for long study sessions.', 'dark-teal', { page: '#e0f5ec', card: '#f6fcf9', accent: '#0f7f6d', text: '#08271f', border: '#b0dac9' }),
  def('purple', 'Purple', 'light', 'Modern & creative', 'Modern violet — creative and stylish.', 'dark-purple', { page: '#ede6fc', card: '#faf7ff', accent: '#6a48dc', text: '#1b1240', border: '#cbbdf1' }),
  def('beige', 'Beige & Orange', 'light', 'Warm & friendly', 'Warm beige with orange accents — friendly and welcoming.', 'dark-gold', { page: '#faeedb', card: '#fffaf2', accent: '#b45f06', text: '#2c1a08', border: '#e8cfa3' }),
];

export const DARK_THEMES: ThemeDefinition[] = [
  def('dark-blue', 'Dark Blue', 'dark', 'Professional', 'Deep navy blue — professional and easy on the eyes.', 'blue', { page: '#031a45', card: '#08244f', accent: '#0b66d6', text: '#f1f6ff', border: '#1b4a8a' }),
  def('dark-teal', 'Dark Teal', 'dark', 'Calm & modern', 'Deep teal — calm, modern and relaxing at night.', 'green', { page: '#03191d', card: '#07272c', accent: '#0f766e', text: '#ecfdfb', border: '#14565c' }),
  def('dark-purple', 'Dark Purple', 'dark', 'Sleek & creative', 'Deep purple — sleek and creative.', 'purple', { page: '#12153a', card: '#1a2050', accent: '#6a48dc', text: '#f3f1ff', border: '#3c4388' }),
  def('dark-gold', 'Dark Gold', 'dark', 'Elegant & premium', 'Dark charcoal with amber-gold accents — elegant and premium.', 'beige', { page: '#121b24', card: '#1d2328', accent: '#b45309', text: '#fbf6ea', border: '#6b5a3d' }),
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
