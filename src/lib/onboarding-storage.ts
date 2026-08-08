/**
 * First-launch onboarding flag in AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDED_KEY = '@home-inventory/onboarded';

export async function hasCompletedOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDED_KEY);
  return value === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
}
