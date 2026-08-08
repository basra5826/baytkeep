/**
 * Settings screen — grouped app options, support links, and about info.
 */

import Constants from 'expo-constants';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SUPPORT_EMAIL = 'ed_basra@yahoo.com';
const PRIVACY_POLICY_URL = 'https://sites.google.com/view/baytkeep-privacy/home';

function getAppVersionLabel(): string {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return `Version ${version}`;
}

async function openExternalUrl(url: string): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) return;
    await Linking.openURL(url);
  } catch {
    // Ignore — mail client or browser may be unavailable.
  }
}

function openSupportEmail(subject: string): void {
  const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  void openExternalUrl(url);
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Settings" />

        <SettingsSection title="General" colors={colors}>
          <SettingsLinkRow
            label="Manage locations"
            colors={colors}
            onPress={() => router.push('/manage-locations')}
            accessibilityLabel="Manage locations"
          />
        </SettingsSection>

        <SettingsSection title="Support" colors={colors}>
          <SettingsLinkRow
            label="Help & Feedback"
            colors={colors}
            onPress={() => openSupportEmail('Baytkeep Feedback')}
          />
          <SettingsLinkRow
            label="Contact Developer"
            colors={colors}
            onPress={() => openSupportEmail('Baytkeep Support')}
            showDivider={false}
          />
        </SettingsSection>

        <SettingsSection title="Legal" colors={colors}>
          <SettingsLinkRow
            label="Privacy Policy"
            colors={colors}
            onPress={() => void openExternalUrl(PRIVACY_POLICY_URL)}
            showDivider={false}
          />
        </SettingsSection>

        <SettingsSection title="About" colors={colors}>
          <SettingsInfoRow label="App version" value={getAppVersionLabel()} colors={colors} />
          <SettingsInfoRow label="Developer" value="Ahmed Aldarwish" colors={colors} />
          <SettingsDisplayRow text="Made by AAYHtech" colors={colors} />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsSection({
  title,
  colors,
  children,
}: {
  title: string;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.backgroundElement }]}>
        {children}
      </View>
    </View>
  );
}

function SettingsLinkRow({
  label,
  colors,
  onPress,
  accessibilityLabel,
  showDivider = true,
}: {
  label: string;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
  onPress: () => void;
  accessibilityLabel?: string;
  showDivider?: boolean;
}) {
  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
      </Pressable>
      {showDivider ? (
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
      ) : null}
    </>
  );
}

function SettingsInfoRow({
  label,
  value,
  colors,
  showDivider = true,
}: {
  label: string;
  value: string;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
  showDivider?: boolean;
}) {
  return (
    <>
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: colors.textSecondary }]} numberOfLines={2}>
          {value}
        </Text>
      </View>
      {showDivider ? (
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
      ) : null}
    </>
  );
}

function SettingsDisplayRow({
  text,
  colors,
}: {
  text: string;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.displayText, { color: colors.textSecondary }]}>{text}</Text>
    </View>
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
  section: {
    marginTop: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: AppStyles.cardRadius,
    overflow: 'hidden',
  },
  row: {
    minHeight: AppStyles.minTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '500',
    flexShrink: 0,
  },
  rowValue: {
    fontSize: 15,
    textAlign: 'right',
    flex: 1,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '400',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  displayText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
