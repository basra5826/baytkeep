/**
 * Add Item screen — single-page form; only name and location are required.
 */

import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OptionButton } from '@/components/ui/option-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { FoodDateFields, type FoodDateValues } from '@/components/food-date-fields';
import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useInventory } from '@/context/inventory-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDisplayDate, getRoomsForLocation, getTodayISO, isFoodLocation, sortLocationsFoodFirst } from '@/lib/inventory-utils';
import { goBackOrHome } from '@/lib/navigation';
import { pickPhoto } from '@/lib/photo-picker';
import type { ItemCondition, ItemDetailsInput, ItemStatus } from '@/types/inventory';

export default function AddItemScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { locations, rooms, addItem } = useInventory();

  const [itemName, setItemName] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const [status, setStatus] = useState<ItemStatus>('works');
  const [conditionTouched, setConditionTouched] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>();
  const [warrantyPhoto, setWarrantyPhoto] = useState<string | undefined>();
  const [purchaseDate, setPurchaseDate] = useState<string | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [foodDates, setFoodDates] = useState<FoodDateValues>({});

  const trimmedName = itemName.trim();
  const canAdd = trimmedName.length > 0 && selectedLocationId !== null;

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId) ?? null,
    [locations, selectedLocationId],
  );

  const sortedLocations = useMemo(() => sortLocationsFoodFirst(locations), [locations]);

  const roomsForLocation = useMemo(
    () => (selectedLocationId ? getRoomsForLocation(rooms, selectedLocationId) : []),
    [rooms, selectedLocationId],
  );

  const handlePhotoPick = (field: 'photo' | 'warrantyPhoto') => {
    pickPhoto((result) => {
      if (result.ok) {
        if (field === 'photo') setPhoto(result.uri);
        else setWarrantyPhoto(result.uri);
        return;
      }
      if (result.message) {
        Alert.alert('Photo unavailable', result.message);
      }
    });
  };

  const handleAddPurchaseDate = () => {
    setPurchaseDate((current) => current ?? getTodayISO());
  };

  const handleSave = () => {
    if (!canAdd || !selectedLocationId) return;

    const condition: ItemCondition | undefined = conditionTouched
      ? isNew
        ? 'new'
        : 'used'
      : undefined;

    const details: ItemDetailsInput = {
      status: isFoodLocation(selectedLocation) ? 'works' : status,
      ...(condition ? { condition } : {}),
      ...(purchaseDate ? { purchaseDate } : {}),
      ...(photo ? { photo } : {}),
      ...(warrantyPhoto ? { warrantyPhoto } : {}),
      ...(isFoodLocation(selectedLocation) && foodDates.expiryDate
        ? { expiryDate: foodDates.expiryDate }
        : {}),
      ...(isFoodLocation(selectedLocation) && foodDates.finishDate
        ? { finishDate: foodDates.finishDate }
        : {}),
    };

    void addItem(trimmedName, selectedLocationId, selectedRoomId ?? undefined, details);
    goBackOrHome();
  };

  const pickerDate = purchaseDate
    ? new Date(`${purchaseDate}T12:00:00`)
    : new Date();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Add Item" />

          <Pressable
            style={[styles.manageLocationsBar, { backgroundColor: colors.backgroundElement }]}
            onPress={() => router.push('/manage-locations')}>
            <Text style={styles.manageLocationsBarText}>Manage locations</Text>
            <Text style={styles.manageLocationsBarHint}>Create Fridge, Pantry, etc.</Text>
          </Pressable>

          <Text style={[styles.label, { color: colors.text }]}>Item name</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundElement }]}
            placeholder="What are you adding?"
            placeholderTextColor={colors.textSecondary}
            value={itemName}
            onChangeText={setItemName}
            autoFocus
            returnKeyType="done"
          />

          <Text style={[styles.label, { color: colors.text }]}>Where is it?</Text>
          {locations.length === 0 ? (
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              No locations yet.{' '}
              <Text style={styles.link} onPress={() => router.push('/manage-locations')}>
                Manage locations
              </Text>{' '}
              to create one first.
            </Text>
          ) : (
            <View style={styles.optionList}>
              {sortedLocations.map((location) => (
                <OptionButton
                  key={location.id}
                  label={location.isFood ? `${location.name} · Food` : location.name}
                  selected={selectedLocationId === location.id}
                  onPress={() => {
                    setSelectedLocationId(location.id);
                    setSelectedRoomId(null);
                    if (!location.isFood) setFoodDates({});
                  }}
                />
              ))}
            </View>
          )}

          {selectedLocation?.hasRooms ? (
            <View style={styles.roomBlock}>
              <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
                Room (optional)
              </Text>
              <View style={styles.optionList}>
                <OptionButton
                  label="No room / whole list"
                  selected={selectedRoomId === null}
                  onPress={() => setSelectedRoomId(null)}
                />
                {roomsForLocation.map((room) => (
                  <OptionButton
                    key={room.id}
                    label={room.name}
                    selected={selectedRoomId === room.id}
                    onPress={() => setSelectedRoomId(room.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={[styles.divider, { backgroundColor: colors.backgroundSelected }]} />

          <Text style={[styles.optionalLabel, { color: colors.textSecondary }]}>
            Optional — tap only what you want
          </Text>

          {!isFoodLocation(selectedLocation) ? (
            <>
              <CheckRow
                label="Working"
                checked={status === 'works'}
                colors={colors}
                onPress={() => setStatus('works')}
              />
              <CheckRow
                label="Broken"
                checked={status === 'broken'}
                colors={colors}
                onPress={() => setStatus('broken')}
              />
            </>
          ) : null}
          <CheckRow
            label="New"
            checked={isNew}
            colors={colors}
            onPress={() => {
              setConditionTouched(true);
              setIsNew((current) => !current);
            }}
          />

          <Pressable
            style={[styles.photoButton, { backgroundColor: colors.backgroundElement }]}
            onPress={() => handlePhotoPick('photo')}>
            <Text style={styles.photoButtonText}>
              {photo ? '✓ 📷 Photo added — tap to replace' : '📷 Add photo'}
            </Text>
          </Pressable>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.thumbnail} contentFit="cover" />
          ) : null}

          {isFoodLocation(selectedLocation) ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.backgroundSelected }]} />
              <FoodDateFields values={foodDates} onChange={setFoodDates} />
            </>
          ) : null}

          <Pressable
            style={[styles.photoButton, { backgroundColor: colors.backgroundElement }]}
            onPress={() => handlePhotoPick('warrantyPhoto')}>
            <Text style={styles.photoButtonText}>
              {warrantyPhoto
                ? '✓ 📄 Warranty added — tap to replace'
                : '📄 Add warranty photo'}
            </Text>
          </Pressable>
          {warrantyPhoto ? (
            <Image source={{ uri: warrantyPhoto }} style={styles.thumbnail} contentFit="cover" />
          ) : null}

          {purchaseDate ? (
            <View style={styles.dateBlock}>
              <Text style={[styles.dateText, { color: colors.text }]}>
                Purchased: {formatDisplayDate(purchaseDate)}
              </Text>
              <Pressable onPress={() => setShowDatePicker((open) => !open)}>
                <Text style={styles.link}>Change date</Text>
              </Pressable>
              <Pressable onPress={() => setPurchaseDate(undefined)}>
                <Text style={[styles.removeLink, { color: colors.textSecondary }]}>
                  Remove date
                </Text>
              </Pressable>
              {showDatePicker ? (
                <DateTimePicker
                  value={pickerDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={(_event, date) => {
                    if (Platform.OS === 'android') setShowDatePicker(false);
                    if (date) setPurchaseDate(date.toISOString().slice(0, 10));
                  }}
                />
              ) : null}
            </View>
          ) : (
            <Pressable style={styles.dateAddButton} onPress={handleAddPurchaseDate}>
              <Text style={styles.link}>Add purchase date</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.addButton, { opacity: canAdd ? 1 : 0.45 }]}
            onPress={handleSave}
            disabled={!canAdd}>
            <Text style={styles.addButtonText}>Add Item</Text>
          </Pressable>

          <Pressable
            style={styles.manageLink}
            onPress={() => router.push('/manage-locations')}>
            <Text style={styles.manageLinkText}>Manage locations</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CheckRow({
  label,
  checked,
  colors,
  onPress,
}: {
  label: string;
  checked: boolean;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.checkRow} onPress={onPress}>
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? AppStyles.primary : colors.backgroundSelected,
            backgroundColor: checked ? AppStyles.primary : colors.backgroundElement,
          },
        ]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <Text style={[styles.checkLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: AppStyles.screenPadding,
    paddingBottom: 32,
    gap: 10,
  },
  manageLocationsBar: {
    borderRadius: AppStyles.cardRadius,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
    marginBottom: 4,
  },
  manageLocationsBarText: {
    color: AppStyles.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  manageLocationsBarHint: {
    color: AppStyles.primary,
    fontSize: 13,
    opacity: 0.8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  sublabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: AppStyles.minTapTarget,
    borderRadius: AppStyles.inputRadius,
    paddingHorizontal: 14,
    fontSize: 17,
  },
  optionList: {
    gap: 8,
  },
  roomBlock: {
    gap: 8,
    marginTop: 2,
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    color: AppStyles.primary,
    fontWeight: '500',
  },
  removeLink: {
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  optionalLabel: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: AppStyles.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  checkLabel: {
    fontSize: 16,
  },
  photoButton: {
    minHeight: AppStyles.minTapTarget,
    borderRadius: AppStyles.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  photoButtonText: {
    color: AppStyles.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  thumbnail: {
    width: '100%',
    height: 120,
    borderRadius: AppStyles.cardRadius,
    marginTop: -4,
  },
  dateBlock: {
    gap: 6,
    paddingVertical: 4,
  },
  dateText: {
    fontSize: 16,
  },
  dateAddButton: {
    minHeight: 40,
    justifyContent: 'center',
  },
  addButton: {
    minHeight: 52,
    borderRadius: AppStyles.buttonRadius,
    backgroundColor: AppStyles.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: AppStyles.primaryText,
    fontSize: 18,
    fontWeight: '700',
  },
  manageLink: {
    minHeight: AppStyles.minTapTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageLinkText: {
    color: AppStyles.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
