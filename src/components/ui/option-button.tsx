/**
 * Selectable row button with a checkmark for chosen options.
 */

import { Pressable, StyleSheet, Text } from 'react-native';

import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type OptionButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function OptionButton({ label, selected, onPress }: OptionButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: selected ? colors.backgroundSelected : colors.backgroundElement,
          borderColor: selected ? AppStyles.primary : colors.backgroundSelected,
        },
      ]}
      onPress={onPress}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {selected ? <Text style={[styles.checkmark, { color: AppStyles.primary }]}>✓</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: AppStyles.minTapTarget,
    borderWidth: 1,
    borderRadius: AppStyles.buttonRadius,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});
