/**
 * Manage Locations screen — create, view, and delete locations and rooms.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react';
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

import { OptionButton } from '@/components/ui/option-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useInventory } from '@/context/inventory-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRoomsForLocation, FOOD_LOCATION_SUGGESTIONS, LOCATION_SUGGESTIONS } from '@/lib/inventory-utils';
import { confirmAction } from '@/lib/confirm';
import type { Location } from '@/types/inventory';

function hasDuplicateName(location: Location, locations: Location[]): boolean {
  return (
    locations.filter((entry) => entry.name.toLowerCase() === location.name.toLowerCase())
      .length > 1
  );
}

export default function ManageLocationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { locations, rooms, items, addLocation, updateLocation, addRoom, deleteLocation, deleteRoom } =
    useInventory();

  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationHasRooms, setNewLocationHasRooms] = useState(true);
  const [newLocationIsFood, setNewLocationIsFood] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [roomMessage, setRoomMessage] = useState<string | null>(null);

  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => a.name.localeCompare(b.name)),
    [locations],
  );

  const handleAddLocation = useCallback(() => {
    const error = addLocation(newLocationName, newLocationHasRooms, newLocationIsFood);
    if (error) {
      setLocationMessage(error);
      return;
    }
    setNewLocationName('');
    setNewLocationHasRooms(true);
    setNewLocationIsFood(false);
    setLocationMessage(null);
  }, [addLocation, newLocationName, newLocationHasRooms, newLocationIsFood]);

  const handleAddRoom = useCallback(
    (locationId: string) => {
      const error = addRoom(locationId, newRoomName);
      if (error) {
        setRoomMessage(error);
        return;
      }
      setNewRoomName('');
      setRoomMessage(null);
    },
    [addRoom, newRoomName],
  );

  const confirmDeleteLocation = (location: Location) => {
    const locationRooms = getRoomsForLocation(rooms, location.id);
    const itemCount = items.filter((item) => item.locationId === location.id).length;
    const idHint = hasDuplicateName(location, locations)
      ? ` (ID …${location.id.slice(-4)})`
      : '';

    void (async () => {
      const confirmed = await confirmAction({
        title: 'Delete location',
        message: `Delete "${location.name}"${idHint}? Its ${itemCount} item(s) will move to Unassigned. Its ${locationRooms.length} room(s) will be removed.`,
        confirmLabel: 'Delete',
      });
      if (!confirmed) return;

      await deleteLocation(location.id);
      if (expandedLocationId === location.id) {
        setExpandedLocationId(null);
      }
    })();
  };

  const confirmDeleteRoom = (roomId: string, roomName: string, locationName: string) => {
    void (async () => {
      const confirmed = await confirmAction({
        title: 'Delete room',
        message: `Delete "${roomName}" from ${locationName}? Items will stay in the location without a room.`,
        confirmLabel: 'Delete',
      });
      if (!confirmed) return;

      await deleteRoom(roomId);
    })();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Manage Locations" />

          <SectionHeading colors={colors} title="Add location" />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Food quick picks</Text>
          <ChipRow>
            {FOOD_LOCATION_SUGGESTIONS.map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                selected={newLocationName === suggestion && newLocationIsFood}
                colors={colors}
                onPress={() => {
                  setNewLocationName(suggestion);
                  setNewLocationHasRooms(false);
                  setNewLocationIsFood(true);
                  setLocationMessage(null);
                }}
              />
            ))}
          </ChipRow>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Other quick picks</Text>
          <ChipRow>
            {LOCATION_SUGGESTIONS.map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                selected={newLocationName === suggestion}
                colors={colors}
                onPress={() => {
                  setNewLocationName(suggestion);
                  setLocationMessage(null);
                }}
              />
            ))}
          </ChipRow>

          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.backgroundElement },
            ]}
            placeholder="Location name (e.g. Fridge, Office)"
            placeholderTextColor={colors.textSecondary}
            value={newLocationName}
            onChangeText={(text) => {
              setNewLocationName(text);
              setLocationMessage(null);
            }}
            returnKeyType="done"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Has rooms?</Text>
          <View style={styles.optionList}>
            <OptionButton
              label="Yes"
              selected={newLocationHasRooms}
              onPress={() => setNewLocationHasRooms(true)}
            />
            <OptionButton
              label="No"
              selected={!newLocationHasRooms}
              onPress={() => setNewLocationHasRooms(false)}
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Food location?</Text>
          <Text style={[styles.foodHint, { color: colors.textSecondary }]}>
            Mark Fridge, Pantry, etc. to track expiry and finish dates.
          </Text>
          <View style={styles.optionList}>
            <OptionButton
              label="Yes"
              selected={newLocationIsFood}
              onPress={() => setNewLocationIsFood(true)}
            />
            <OptionButton
              label="No"
              selected={!newLocationIsFood}
              onPress={() => setNewLocationIsFood(false)}
            />
          </View>

          {locationMessage ? (
            <Text style={[styles.message, { color: colors.textSecondary }]}>{locationMessage}</Text>
          ) : null}

          <Pressable
            style={[
              styles.primaryButton,
              { opacity: newLocationName.trim() ? 1 : 0.5 },
            ]}
            onPress={handleAddLocation}
            disabled={!newLocationName.trim()}>
            <Text style={styles.primaryButtonText}>Save location</Text>
          </Pressable>

          <SectionHeading colors={colors} title="Your locations" />

          {sortedLocations.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No locations yet. Add one above.
            </Text>
          ) : (
            sortedLocations.map((location) => {
              const locationRooms = getRoomsForLocation(rooms, location.id);
              const itemCount = items.filter((item) => item.locationId === location.id).length;
              const isExpanded = expandedLocationId === location.id;
              const isDuplicate = hasDuplicateName(location, locations);

              return (
                <View
                  key={location.id}
                  style={[styles.locationCard, { backgroundColor: colors.backgroundElement }]}>
                  <View style={styles.locationHeader}>
                    <View style={styles.locationInfo}>
                      <Text style={[styles.locationName, { color: colors.text }]}>
                        {location.name}
                        {isDuplicate ? ` (…${location.id.slice(-4)})` : ''}
                      </Text>
                      <Text style={[styles.locationMeta, { color: colors.textSecondary }]}>
                        {itemCount} item{itemCount === 1 ? '' : 's'}
                        {' · '}
                        {location.hasRooms
                          ? `${locationRooms.length} room${locationRooms.length === 1 ? '' : 's'}`
                          : 'No rooms'}
                        {location.isFood ? ' · Food' : ''}
                        {isDuplicate ? ' · duplicate name' : ''}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.deleteAction}
                      onPress={() => confirmDeleteLocation(location)}
                      accessibilityLabel={`Delete ${location.name}`}
                      hitSlop={8}>
                      <Text style={styles.deleteActionText}>Delete location</Text>
                    </Pressable>
                  </View>

                  <Text style={[styles.label, { color: colors.textSecondary }]}>Food location?</Text>
                  <View style={styles.optionList}>
                    <OptionButton
                      label="Yes"
                      selected={location.isFood === true}
                      onPress={() => void updateLocation(location.id, { isFood: true })}
                    />
                    <OptionButton
                      label="No"
                      selected={location.isFood !== true}
                      onPress={() => void updateLocation(location.id, { isFood: false })}
                    />
                  </View>

                  {location.hasRooms ? (
                    <>
                      {locationRooms.length > 0 ? (
                        <View style={styles.roomList}>
                          {locationRooms.map((room) => (
                            <View key={room.id} style={styles.roomRow}>
                              <Text style={[styles.roomName, { color: colors.text }]}>
                                {room.name}
                              </Text>
                              <Pressable
                                onPress={() =>
                                  confirmDeleteRoom(room.id, room.name, location.name)
                                }>
                                <Text style={[styles.roomDelete, { color: colors.textSecondary }]}>
                                  Delete
                                </Text>
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      ) : null}

                      <Pressable
                        style={styles.addRoomToggle}
                        onPress={() => {
                          setExpandedLocationId(isExpanded ? null : location.id);
                          setNewRoomName('');
                          setRoomMessage(null);
                        }}>
                        <Text style={styles.addRoomToggleText}>
                          {isExpanded ? '− Cancel' : '+ Add room'}
                        </Text>
                      </Pressable>

                      {isExpanded ? (
                        <View style={styles.addRoomForm}>
                          <TextInput
                            style={[
                              styles.input,
                              { color: colors.text, backgroundColor: colors.background },
                            ]}
                            placeholder={`Room in ${location.name}`}
                            placeholderTextColor={colors.textSecondary}
                            value={newRoomName}
                            onChangeText={(text) => {
                              setNewRoomName(text);
                              setRoomMessage(null);
                            }}
                            returnKeyType="done"
                          />
                          {roomMessage ? (
                            <Text style={[styles.message, { color: colors.textSecondary }]}>
                              {roomMessage}
                            </Text>
                          ) : null}
                          <Pressable
                            style={[
                              styles.secondaryButton,
                              { opacity: newRoomName.trim() ? 1 : 0.5 },
                            ]}
                            onPress={() => handleAddRoom(location.id)}
                            disabled={!newRoomName.trim()}>
                            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                              Save room
                            </Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionHeading({
  title,
  colors,
}: {
  title: string;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
}) {
  return (
    <Text style={[styles.sectionHeading, { color: colors.text }]}>{title}</Text>
  );
}

function ChipRow({ children }: { children: ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

function Chip({
  label,
  selected,
  colors,
  onPress,
}: {
  label: string;
  selected: boolean;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.chip,
        {
          backgroundColor: selected ? AppStyles.primary : colors.backgroundElement,
        },
      ]}
      onPress={onPress}>
      <Text
        style={[
          styles.chipText,
          { color: selected ? AppStyles.primaryText : colors.text },
        ]}>
        {selected ? `✓ ${label}` : label}
      </Text>
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
  sectionHeading: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  foodHint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
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
  message: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  primaryButton: {
    minHeight: AppStyles.minTapTarget,
    borderRadius: AppStyles.buttonRadius,
    backgroundColor: AppStyles.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: AppStyles.primaryText,
    fontSize: 17,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  locationCard: {
    borderRadius: AppStyles.cardRadius,
    padding: 16,
    marginBottom: 10,
    gap: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  locationInfo: {
    flex: 1,
    gap: 2,
  },
  locationName: {
    fontSize: 17,
    fontWeight: '600',
  },
  locationMeta: {
    fontSize: 14,
  },
  deleteAction: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  deleteActionText: {
    color: AppStyles.danger,
    fontSize: 15,
    fontWeight: '500',
  },
  roomList: {
    gap: 6,
    paddingTop: 4,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  roomName: {
    fontSize: 16,
  },
  roomDelete: {
    fontSize: 14,
  },
  addRoomToggle: {
    minHeight: 40,
    justifyContent: 'center',
  },
  addRoomToggleText: {
    color: AppStyles.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  addRoomForm: {
    gap: 8,
    paddingTop: 4,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: AppStyles.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
