/**
 * Tab bar — Inventory, Extra Lists, and quick actions for add place/item.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppStyles.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="package-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Extra Lists',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-place"
        options={{
          title: 'Add place',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-plus-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.push('/manage-locations');
          },
        }}
      />
      <Tabs.Screen
        name="add-item-tab"
        options={{
          title: 'Add item',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-box" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.push('/add-item');
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
