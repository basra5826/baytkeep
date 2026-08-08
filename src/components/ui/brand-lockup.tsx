/**
 * Baytkeep wordmark — app icon beside the brand name.
 */

import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BrandColors } from '@/constants/theme';

const appIcon = require('@/assets/images/icon.png');

const ICON_SIZE = 30;
const ICON_RADIUS = 7;

type BrandLockupProps = {
  /** Default terracotta wordmark; overlay is white for photos. */
  variant?: 'default' | 'overlay';
  style?: StyleProp<ViewStyle>;
};

export function BrandLockup({ variant = 'default', style }: BrandLockupProps) {
  const isOverlay = variant === 'overlay';

  return (
    <View style={[styles.lockup, isOverlay && styles.lockupOverlay, style]}>
      <Image
        source={appIcon}
        style={[styles.icon, isOverlay && styles.iconOverlay]}
        accessibilityIgnoresInvertColors
      />
      <Text
        style={[
          styles.wordmark,
          isOverlay ? styles.wordmarkOverlay : styles.wordmarkDefault,
        ]}
        accessibilityRole="header">
        Baytkeep
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockupOverlay: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(28, 24, 20, 0.38)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
  },
  iconOverlay: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  wordmarkDefault: {
    color: BrandColors.primary,
  },
  wordmarkOverlay: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
