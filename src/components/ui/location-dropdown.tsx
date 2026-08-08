/**
 * Compact dropdown for choosing a storage location.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Location } from '@/types/inventory';

function formatLocationLabel(location: Location): string {
  return location.isFood ? `${location.name} · Food` : location.name;
}

type LocationDropdownProps = {
  locations: Location[];
  selectedLocationId: string | null;
  onSelectLocation: (locationId: string) => void;
  placeholder?: string;
};

export function LocationDropdown({
  locations,
  selectedLocationId,
  onSelectLocation,
  placeholder = 'Select location',
}: LocationDropdownProps) {
  const [open, setOpen] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const selectedLocation = locations.find((location) => location.id === selectedLocationId) ?? null;
  const displayLabel = selectedLocation ? formatLocationLabel(selectedLocation) : placeholder;

  const handleSelect = (locationId: string) => {
    onSelectLocation(locationId);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={[
          styles.trigger,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: open ? AppStyles.primary : colors.border,
          },
        ]}
        onPress={() => setOpen((current) => !current)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}>
        <Text
          style={[
            styles.triggerText,
            { color: selectedLocation ? colors.text : colors.textSecondary },
          ]}
          numberOfLines={1}>
          {displayLabel}
        </Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={colors.textSecondary}
        />
      </Pressable>

      {open ? (
        <View
          style={[
            styles.menu,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
          ]}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={styles.menuScroll}>
            {locations.map((location) => {
              const selected = location.id === selectedLocationId;
              return (
                <Pressable
                  key={location.id}
                  style={[
                    styles.option,
                    selected && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(location.id)}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: selected ? AppStyles.primaryText : colors.text },
                    ]}
                    numberOfLines={1}>
                    {selected ? `✓ ${formatLocationLabel(location)}` : formatLocationLabel(location)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  trigger: {
    minHeight: AppStyles.minTapTarget,
    borderRadius: AppStyles.inputRadius,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  triggerText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
  },
  menu: {
    borderRadius: AppStyles.inputRadius,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuScroll: {
    maxHeight: 220,
  },
  option: {
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: AppStyles.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
