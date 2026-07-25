/**
 * Settings screen — secondary app options behind the gear icon.
 */

import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Settings" />

        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundElement }]}>
          <Pressable
            style={styles.row}
            onPress={() => router.push('/manage-locations')}
            accessibilityLabel="Manage locations">
            <Text style={[styles.rowLabel, { color: colors.text }]}>Manage locations</Text>
            <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: AppStyles.screenPadding,
    paddingBottom: 32,
  },
  sectionCard: {
    borderRadius: AppStyles.cardRadius,
    overflow: 'hidden',
    marginTop: 8,
  },
  row: {
    minHeight: AppStyles.minTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 22,
    fontWeight: '400',
  },
});
