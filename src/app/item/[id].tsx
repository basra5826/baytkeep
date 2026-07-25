/**
 * Item detail screen — view and edit all item fields, including status and photos.
 */

import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
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

import {
  ItemDetailsFields,
  itemDetailsToInput,
  type ItemDetailsValues,
} from '@/components/item-details-fields';
import { FoodDateFields, type FoodDateValues } from '@/components/food-date-fields';
import { OptionButton } from '@/components/ui/option-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AppStyles } from '@/constants/app-styles';
import { BrandColors, Colors } from '@/constants/theme';
import { useInventory } from '@/context/inventory-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  formatDisplayDate,
  formatItemLabel,
  getItemLocationPath,
  getItemStatus,
  getRoomsForLocation,
  isFoodLocation,
  sortLocationsFoodFirst,
} from '@/lib/inventory-utils';
import { goBackOrHome, goHome } from '@/lib/navigation';
import { confirmAction } from '@/lib/confirm';

export default function ItemDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { items, locations, rooms, updateItem, deleteItem, isLoaded } = useInventory();

  const item = useMemo(() => items.find((entry) => entry.id === id), [items, id]);

  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [details, setDetails] = useState<ItemDetailsValues>({ status: 'works' });
  const [foodDates, setFoodDates] = useState<FoodDateValues>({});

  useEffect(() => {
    if (!item) return;
    setName(item.name);
    setLocationId(item.locationId ?? null);
    setRoomId(item.roomId ?? null);
    setDetails({
      status: getItemStatus(item),
      condition: item.condition,
      purchaseDate: item.purchaseDate,
      photo: item.photo,
      warrantyPhoto: item.warrantyPhoto,
    });
    setFoodDates({
      expiryDate: item.expiryDate,
      finishDate: item.finishDate,
    });
  }, [item]);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === locationId) ?? null,
    [locations, locationId],
  );

  const sortedLocations = useMemo(() => sortLocationsFoodFirst(locations), [locations]);

  const roomsForLocation = useMemo(
    () => (locationId ? getRoomsForLocation(rooms, locationId) : []),
    [rooms, locationId],
  );

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.missing}>
          <ScreenHeader title="Item" />
          <Text style={[styles.missingText, { color: colors.textSecondary }]}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.missing}>
          <ScreenHeader title="Item" />
          <Text style={[styles.missingText, { color: colors.textSecondary }]}>Item not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canSave = name.trim().length > 0 && locationId !== null;

  const handleSave = async () => {
    if (!canSave || !locationId) return;

    const detailInput = itemDetailsToInput(details);
    const isFood = isFoodLocation(selectedLocation);
    await updateItem(item.id, {
      name: name.trim(),
      locationId,
      roomId: roomId ?? undefined,
      status: isFood ? 'works' : detailInput.status ?? 'works',
      condition: detailInput.condition,
      purchaseDate: detailInput.purchaseDate,
      photo: detailInput.photo,
      warrantyPhoto: detailInput.warrantyPhoto,
      expiryDate: isFood ? foodDates.expiryDate : undefined,
      finishDate: isFood ? foodDates.finishDate : undefined,
    });
    goBackOrHome();
  };

  const handleDelete = () => {
    void (async () => {
      const confirmed = await confirmAction({
        title: 'Delete this item?',
        message: 'This cannot be undone.',
        confirmLabel: 'Delete',
      });
      if (!confirmed) return;

      await deleteItem(item.id);
      goHome();
    })();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Item Details" />

          {details.status === 'broken' && !isFoodLocation(selectedLocation) ? (
            <View
              style={[
                styles.brokenBanner,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? BrandColors.dangerBackgroundDark
                      : BrandColors.dangerBackground,
                },
              ]}>
              <View style={styles.brokenBannerContent}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={AppStyles.danger}
                />
                <Text style={styles.brokenBannerText}>This item is marked as broken</Text>
              </View>
            </View>
          ) : null}

          <Text style={[styles.pathLabel, { color: colors.textSecondary }]}>
            {formatItemLabel(item, locations, rooms)}
          </Text>

          <Text style={[styles.fieldLabel, { color: colors.text }]}>Name</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundElement }]}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.fieldLabel, { color: colors.text }]}>Location</Text>
          <View style={styles.optionList}>
            {sortedLocations.map((location) => (
              <OptionButton
                key={location.id}
                label={location.isFood ? `${location.name} · Food` : location.name}
                selected={locationId === location.id}
                onPress={() => {
                  setLocationId(location.id);
                  setRoomId(null);
                  if (!location.isFood) setFoodDates({});
                }}
              />
            ))}
          </View>

          {selectedLocation?.hasRooms ? (
            <>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Room (optional)</Text>
              <View style={styles.optionList}>
                <OptionButton
                  label="No room / whole list"
                  selected={roomId === null}
                  onPress={() => setRoomId(null)}
                />
                {roomsForLocation.map((room) => (
                  <OptionButton
                    key={room.id}
                    label={room.name}
                    selected={roomId === room.id}
                    onPress={() => setRoomId(room.id)}
                  />
                ))}
              </View>
            </>
          ) : null}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
          <ItemDetailsFields
            values={details}
            onChange={setDetails}
            showStatus={!isFoodLocation(selectedLocation)}
          />

          {isFoodLocation(selectedLocation) ? (
            <FoodDateFields values={foodDates} onChange={setFoodDates} />
          ) : null}

          {details.photo ? (
            <View style={styles.previewBlock}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Item photo</Text>
              <Image source={{ uri: details.photo }} style={styles.previewImage} contentFit="cover" />
            </View>
          ) : null}

          {details.warrantyPhoto ? (
            <View style={styles.previewBlock}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Warranty photo</Text>
              <Image
                source={{ uri: details.warrantyPhoto }}
                style={styles.previewImage}
                contentFit="cover"
              />
            </View>
          ) : null}

          {details.purchaseDate ? (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Purchased: {formatDisplayDate(details.purchaseDate)}
            </Text>
          ) : null}

          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            Stored in: {getItemLocationPath(item, locations, rooms)}
          </Text>

          <Pressable
            style={[styles.saveButton, { opacity: canSave ? 1 : 0.5 }]}
            onPress={handleSave}
            disabled={!canSave}>
            <Text style={styles.saveButtonText}>Save changes</Text>
          </Pressable>

          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete item</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    gap: 12,
  },
  missing: {
    paddingHorizontal: AppStyles.screenPadding,
  },
  missingText: {
    fontSize: 17,
    marginTop: 24,
    textAlign: 'center',
  },
  brokenBanner: {
    borderRadius: AppStyles.cardRadius,
    padding: 12,
  },
  brokenBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brokenBannerText: {
    color: AppStyles.dangerText,
    fontSize: 15,
    fontWeight: '600',
  },
  pathLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
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
  previewBlock: {
    gap: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: AppStyles.cardRadius,
  },
  meta: {
    fontSize: 14,
  },
  saveButton: {
    minHeight: AppStyles.minTapTarget,
    borderRadius: AppStyles.buttonRadius,
    backgroundColor: AppStyles.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: AppStyles.primaryText,
    fontSize: 17,
    fontWeight: '600',
  },
  deleteButton: {
    minHeight: AppStyles.minTapTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: AppStyles.danger,
    fontSize: 17,
    fontWeight: '600',
  },
});
