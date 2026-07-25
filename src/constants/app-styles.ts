/**
 * Shared layout and spacing — colors come from theme.ts (BrandColors).
 */

import { BrandColors } from '@/constants/theme';

export const AppStyles = {
  screenPadding: 20,
  cardRadius: 14,
  inputRadius: 12,
  buttonRadius: 12,
  fabSize: 56,
  primary: BrandColors.primary,
  primaryText: BrandColors.primaryText,
  danger: BrandColors.danger,
  dangerText: BrandColors.dangerText,
  sectionGap: 24,
  itemGap: 10,
  minTapTarget: 48,
} as const;
