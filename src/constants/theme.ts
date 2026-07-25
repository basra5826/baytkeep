/**
 * Baytkeep theme — warm, homey palette for light and dark mode.
 * Tweak brand and surface colors here; the rest of the app imports from this file.
 */

import { Platform, type ColorSchemeName } from 'react-native';

/** Accent, alert, and on-accent text — shared across modes. */
export const BrandColors = {
  primary: '#C4694A',
  primaryText: '#FFFBF7',
  danger: '#C44536',
  dangerText: '#8B2E24',
  dangerBackground: '#FDECEA',
  dangerBackgroundDark: '#3D2220',
} as const;

export const Colors = {
  light: {
    text: '#2C2419',
    background: '#FAF7F2',
    backgroundElement: '#F0EBE3',
    backgroundSelected: '#E5DDD2',
    textSecondary: '#6B5E50',
    border: '#DDD4C8',
  },
  dark: {
    text: '#F5F0E8',
    background: '#1E1B18',
    backgroundElement: '#2A2622',
    backgroundSelected: '#38322C',
    textSecondary: '#A89B8C',
    border: '#4A4238',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const CardShadow = {
  light: {
    shadowColor: '#2C2419',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  dark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;

export function getCardShadow(colorScheme: 'light' | 'dark' | null | undefined) {
  return colorScheme === 'dark' ? CardShadow.dark : CardShadow.light;
}

export function resolveColorScheme(colorScheme: ColorSchemeName): 'light' | 'dark' {
  return colorScheme === 'dark' ? 'dark' : 'light';
}

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
