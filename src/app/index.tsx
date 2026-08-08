/**
 * Entry redirect — first launch goes to welcome; returning users go to tabs.
 * Keeps splash visible until fonts, navigation, and onboarding check are ready.
 */

import { Redirect, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useAppFonts } from '@/context/font-context';
import { hasCompletedOnboarding } from '@/lib/onboarding-storage';

type EntryRoute = '/(tabs)' | '/welcome';

export default function Index() {
  const { fontsReady } = useAppFonts();
  const navigationState = useRootNavigationState();
  const navigationReady = Boolean(navigationState?.key);
  const [href, setHref] = useState<EntryRoute | null>(null);

  useEffect(() => {
    void hasCompletedOnboarding().then((onboarded) => {
      setHref(onboarded ? '/(tabs)' : '/welcome');
    });
  }, []);

  const appReady = fontsReady && navigationReady && href !== null;

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  if (!appReady || href === null) {
    return <View style={{ flex: 1 }} />;
  }

  return <Redirect href={href} />;
}
