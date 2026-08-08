/**
 * Entry redirect — first launch goes to welcome; returning users go to tabs.
 * Renders nothing while checking so the splash screen stays visible (no home flash).
 */

import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { hasCompletedOnboarding } from '@/lib/onboarding-storage';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Index() {
  useEffect(() => {
    void (async () => {
      try {
        const onboarded = await hasCompletedOnboarding();
        if (onboarded) {
          router.replace('/(tabs)');
        } else {
          router.replace('/welcome');
        }
      } finally {
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  return null;
}
