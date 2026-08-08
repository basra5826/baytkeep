/**
 * First-launch welcome screen — shown once before the main app.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useAppFonts } from '@/context/font-context';
import { setOnboardingComplete } from '@/lib/onboarding-storage';

const welcomeBackground = require('@/assets/images/welcome-bg.jpg');
const WELCOME_HORIZONTAL_PADDING = 28;

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const lightColors = Colors.light;
  const { poppinsBold } = useAppFonts();
  const boldTitle = poppinsBold ? { fontFamily: poppinsBold } : { fontWeight: '700' as const };

  const handleGetStarted = () => {
    void (async () => {
      await setOnboardingComplete();
      router.replace('/(tabs)');
    })();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image source={welcomeBackground} style={styles.backgroundImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(28, 24, 20, 0.35)', 'rgba(28, 24, 20, 0.92)']}
        locations={[0, 0.42, 1]}
        style={styles.gradient}
      />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}>
        <View style={styles.wordmarkSection}>
          <Text style={[styles.wordmark, boldTitle]} accessibilityRole="header">
            Baytkeep
          </Text>
        </View>

        <View style={styles.headlineSection}>
          <Text style={[styles.headlineLine1, boldTitle]}>List what you own.</Text>
          <Text style={[styles.headlineLine2, boldTitle]}>Find it in seconds.</Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            onPress={handleGetStarted}>
            <Text style={[styles.primaryButtonText, { color: lightColors.text }]}>Get Started</Text>
          </Pressable>

          <Text style={styles.finePrint}>Your data stays on your device. Private by design.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B18',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    flex: 1,
    paddingHorizontal: WELCOME_HORIZONTAL_PADDING,
  },
  wordmarkSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 28,
  },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 46,
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  headlineSection: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    gap: 2,
    paddingBottom: 24,
  },
  headlineLine1: {
    color: '#FFFFFF',
    fontSize: 36,
    letterSpacing: -0.3,
    lineHeight: 40,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  headlineLine2: {
    color: '#FFFFFF',
    fontSize: 36,
    letterSpacing: -0.3,
    lineHeight: 40,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  footer: {
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    minHeight: AppStyles.minTapTarget,
    borderRadius: AppStyles.buttonRadius,
    backgroundColor: AppStyles.primaryText,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  finePrint: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
