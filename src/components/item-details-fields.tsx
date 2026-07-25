/**
 * Reusable optional item detail fields — status, condition, purchase date, photos.
 */

import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionButton } from '@/components/ui/option-button';
import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDisplayDate, getTodayISO } from '@/lib/inventory-utils';
import { pickPhoto } from '@/lib/photo-picker';
import type { ItemCondition, ItemDetailsInput, ItemStatus } from '@/types/inventory';

export type ItemDetailsValues = {
  status: ItemStatus;
  condition?: ItemCondition;
  purchaseDate?: string;
  photo?: string;
  warrantyPhoto?: string;
};

type ItemDetailsFieldsProps = {
  values: ItemDetailsValues;
  onChange: (values: ItemDetailsValues) => void;
  showStatus?: boolean;
};

export function itemDetailsToInput(values: ItemDetailsValues): ItemDetailsInput {
  return {
    status: values.status,
    ...(values.condition ? { condition: values.condition } : {}),
    ...(values.purchaseDate ? { purchaseDate: values.purchaseDate } : {}),
    ...(values.photo ? { photo: values.photo } : {}),
    ...(values.warrantyPhoto ? { warrantyPhoto: values.warrantyPhoto } : {}),
  };
}

export function ItemDetailsFields({ values, onChange, showStatus = true }: ItemDetailsFieldsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [showDatePicker, setShowDatePicker] = useState(false);

  const boughtThis = values.purchaseDate !== undefined;

  const update = (patch: Partial<ItemDetailsValues>) => {
    onChange({ ...values, ...patch });
  };

  const handlePhotoPick = (field: 'photo' | 'warrantyPhoto') => {
    pickPhoto((result) => {
      if (result.ok) {
        update({ [field]: result.uri });
        return;
      }
      if (result.message) {
        Alert.alert('Photo unavailable', result.message);
      }
    });
  };

  const handleBoughtToggle = (enabled: boolean) => {
    if (enabled) {
      update({ purchaseDate: values.purchaseDate ?? getTodayISO() });
    } else {
      update({ purchaseDate: undefined });
      setShowDatePicker(false);
    }
  };

  const pickerDate = values.purchaseDate
    ? new Date(`${values.purchaseDate}T12:00:00`)
    : new Date();

  return (
    <View style={styles.container}>
      {showStatus ? (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
          <View style={styles.optionList}>
            <OptionButton
              label="Works"
              selected={values.status === 'works'}
              onPress={() => update({ status: 'works' })}
            />
            <OptionButton
              label="Broken"
              selected={values.status === 'broken'}
              onPress={() => update({ status: 'broken' })}
            />
          </View>
        </>
      ) : null}

      <Text style={[styles.label, { color: colors.textSecondary }]}>Condition</Text>
      <View style={styles.optionList}>
        <OptionButton
          label="New"
          selected={values.condition === 'new'}
          onPress={() =>
            update({ condition: values.condition === 'new' ? undefined : 'new' })
          }
        />
        <OptionButton
          label="Used"
          selected={values.condition === 'used'}
          onPress={() =>
            update({ condition: values.condition === 'used' ? undefined : 'used' })
          }
        />
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Purchase date</Text>
      <View style={styles.optionList}>
        <OptionButton
          label="I bought this"
          selected={boughtThis}
          onPress={() => handleBoughtToggle(!boughtThis)}
        />
      </View>

      {boughtThis ? (
        <View style={styles.dateBlock}>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDisplayDate(values.purchaseDate ?? getTodayISO())}
          </Text>
          <Pressable onPress={() => setShowDatePicker((open) => !open)}>
            <Text style={styles.dateLink}>Change date</Text>
          </Pressable>
          {showDatePicker ? (
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(_event, date) => {
                if (Platform.OS === 'android') {
                  setShowDatePicker(false);
                }
                if (date) {
                  update({ purchaseDate: date.toISOString().slice(0, 10) });
                }
              }}
            />
          ) : null}
        </View>
      ) : null}

      <Text style={[styles.label, { color: colors.textSecondary }]}>Photos</Text>
      <View style={styles.photoRow}>
        <PhotoSlot
          label="Add item photo"
          uri={values.photo}
          colors={colors}
          onPick={() => handlePhotoPick('photo')}
          onRemove={() => update({ photo: undefined })}
        />
        <PhotoSlot
          label="Add warranty photo"
          uri={values.warrantyPhoto}
          colors={colors}
          onPick={() => handlePhotoPick('warrantyPhoto')}
          onRemove={() => update({ warrantyPhoto: undefined })}
        />
      </View>
    </View>
  );
}

function PhotoSlot({
  label,
  uri,
  colors,
  onPick,
  onRemove,
}: {
  label: string;
  uri?: string;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.photoSlot}>
      {uri ? (
        <View style={styles.thumbnailWrap}>
          <Image source={{ uri }} style={styles.thumbnail} contentFit="cover" />
          <Pressable style={styles.removePhoto} onPress={onRemove}>
            <Text style={styles.removePhotoText}>Remove</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.photoButton, { backgroundColor: colors.backgroundElement }]}
          onPress={onPick}>
          <Text style={[styles.photoButtonText, { color: AppStyles.primary }]}>{label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  optionList: {
    gap: 8,
  },
  dateBlock: {
    gap: 6,
    paddingLeft: 4,
  },
  dateText: {
    fontSize: 16,
  },
  dateLink: {
    color: AppStyles.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  photoRow: {
    gap: 10,
  },
  photoSlot: {
    gap: 6,
  },
  photoButton: {
    minHeight: AppStyles.minTapTarget,
    borderRadius: AppStyles.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  thumbnailWrap: {
    gap: 6,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    borderRadius: AppStyles.cardRadius,
  },
  removePhoto: {
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
  },
  removePhotoText: {
    color: AppStyles.danger,
    fontSize: 15,
    fontWeight: '500',
  },
});
