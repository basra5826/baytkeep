/**
 * Simple screen header with a back button and title.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { goBackOrHome } from '@/lib/navigation';

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
};

export function ScreenHeader({ title, showBack = true }: ScreenHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable
          style={styles.backButton}
          onPress={goBackOrHome}
          hitSlop={8}>
          <Text style={[styles.backText, { color: AppStyles.primary }]}>Back</Text>
        </Pressable>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.backPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    minWidth: 56,
    minHeight: AppStyles.minTapTarget,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 17,
    fontWeight: '500',
  },
  backPlaceholder: {
    minWidth: 56,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
});
