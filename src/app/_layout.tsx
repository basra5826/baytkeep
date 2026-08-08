/**
 * Root layout — providers, tab navigation, and stack screens for modals/details.
 */

import 'react-native-gesture-handler';

import {
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { InventoryProvider } from '@/context/inventory-context';
import { ListsProvider } from '@/context/lists-context';
import { NeededProvider } from '@/context/needed-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <InventoryProvider>
          <ListsProvider>
            <NeededProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen
                  name="welcome"
                  options={{ gestureEnabled: false, animation: 'fade' }}
                />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="add-item"
                  options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen name="manage-locations" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="item/[id]" />
                <Stack.Screen name="list/[id]" />
              </Stack>
            </NeededProvider>
          </ListsProvider>
        </InventoryProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
