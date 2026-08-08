/**
 * Compact two-option horizontal segmented control.
 */

import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SegmentedControlProps = {
  options: [string, string];
  selectedIndex: 0 | 1 | null;
  onSelectIndex: (index: 0 | 1) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl({
  options,
  selectedIndex,
  onSelectIndex,
  style,
}: SegmentedControlProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.border, backgroundColor: colors.background },
        style,
      ]}>
      {options.map((option, index) => {
        const selected = selectedIndex === index;
        return (
          <Pressable
            key={option}
            style={[styles.segment, selected && styles.segmentSelected]}
            onPress={() => onSelectIndex(index as 0 | 1)}
            accessibilityRole="button"
            accessibilityState={{ selected }}>
            <Text
              style={[
                styles.segmentText,
                { color: selected ? AppStyles.primaryText : colors.text },
              ]}>
              {selected ? `✓ ${option}` : option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 36,
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentSelected: {
    backgroundColor: AppStyles.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
