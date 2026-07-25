/**
 * Root layout — providers, tab navigation, and stack screens for modals/details.
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { InventoryProvider } from '@/context/inventory-context';
import { ListsProvider } from '@/context/lists-context';
import { NeededProvider } from '@/context/needed-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <InventoryProvider>
        <ListsProvider>
          <NeededProvider>
            <Stack screenOptions={{ headerShown: false }}>
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
  );
}
