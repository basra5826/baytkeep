/**
 * Cross-platform date field — HTML input on web, DateTimePicker on native.
 */

import DateTimePicker from '@react-native-community/datetimepicker';
import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatFoodDate } from '@/lib/inventory-utils';

type DateFieldProps = {
  addLabel: string;
  displayLabel: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

function WebDateInput({
  value,
  onChange,
  minimumDate,
  maximumDate,
  backgroundColor,
  textColor,
  borderColor,
}: {
  value?: string;
  onChange: (value: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}) {
  return createElement('input', {
    type: 'date',
    value: value ?? '',
    min: minimumDate?.toISOString().slice(0, 10),
    max: maximumDate?.toISOString().slice(0, 10),
    onChange: (event: { currentTarget: { value: string } }) => {
      const next = event.currentTarget.value;
      if (next) onChange(next);
    },
    style: {
      height: 44,
      fontSize: 16,
      padding: '8px 12px',
      borderRadius: 8,
      border: `1px solid ${borderColor}`,
      width: '100%',
      boxSizing: 'border-box',
      backgroundColor,
      color: textColor,
    },
  });
}

export function DateField({
  addLabel,
  displayLabel,
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [editing, setEditing] = useState(false);
  const [showNativePicker, setShowNativePicker] = useState(false);

  if (!value && !editing) {
    return (
      <Pressable style={styles.addButton} onPress={() => setEditing(true)}>
        <Text style={styles.link}>{addLabel}</Text>
      </Pressable>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.dateBlock}>
        {value ? (
          <Text style={[styles.dateText, { color: colors.text }]}>
            {displayLabel}: {formatFoodDate(value)}
          </Text>
        ) : (
          <Text style={[styles.hint, { color: colors.textSecondary }]}>Pick a date</Text>
        )}
        <WebDateInput
          value={value}
          onChange={(next) => onChange(next)}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          backgroundColor={colors.backgroundElement}
          textColor={colors.text}
          borderColor={colors.textSecondary}
        />
        {value ? (
          <Pressable
            onPress={() => {
              onChange(undefined);
              setEditing(false);
            }}>
            <Text style={[styles.removeLink, { color: colors.textSecondary }]}>Remove</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => setEditing(false)}>
            <Text style={[styles.removeLink, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.dateBlock}>
      {value ? (
        <>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {displayLabel}: {formatFoodDate(value)}
          </Text>
          <Pressable onPress={() => setShowNativePicker((open) => !open)}>
            <Text style={styles.link}>Change {displayLabel.toLowerCase()}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              onChange(undefined);
              setEditing(false);
              setShowNativePicker(false);
            }}>
            <Text style={[styles.removeLink, { color: colors.textSecondary }]}>Remove</Text>
          </Pressable>
        </>
      ) : (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>Pick a date</Text>
      )}

      {(showNativePicker || !value) ? (
        <DateTimePicker
          value={value ? new Date(`${value}T12:00:00`) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(_event, date) => {
            if (Platform.OS === 'android') setShowNativePicker(false);
            if (date) {
              onChange(date.toISOString().slice(0, 10));
              setEditing(false);
            }
          }}
        />
      ) : null}

      {!value ? (
        <Pressable onPress={() => setEditing(false)}>
          <Text style={[styles.removeLink, { color: colors.textSecondary }]}>Cancel</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dateBlock: {
    gap: 8,
  },
  dateText: {
    fontSize: 16,
  },
  hint: {
    fontSize: 15,
  },
  addButton: {
    minHeight: 40,
    justifyContent: 'center',
  },
  link: {
    color: AppStyles.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  removeLink: {
    fontSize: 14,
  },
});
