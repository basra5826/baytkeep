/**
 * Expiry and finish date fields for food items in a food location.
 */

import { StyleSheet, Text, View } from 'react-native';

import { DateField } from '@/components/date-field';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type FoodDateValues = {
  expiryDate?: string;
  finishDate?: string;
};

type FoodDateFieldsProps = {
  values: FoodDateValues;
  onChange: (values: FoodDateValues) => void;
};

export function FoodDateFields({ values, onChange }: FoodDateFieldsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const update = (patch: Partial<FoodDateValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.text }]}>Food dates</Text>

      <DateField
        addLabel="Add expiry date"
        displayLabel="Expiry date"
        value={values.expiryDate}
        onChange={(expiryDate) => update({ expiryDate })}
      />

      <DateField
        addLabel="Add expected finish date"
        displayLabel="Expected finish date"
        value={values.finishDate}
        onChange={(finishDate) => update({ finishDate })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    marginTop: 4,
  },
  heading: {
    fontSize: 15,
    fontWeight: '600',
  },
});
