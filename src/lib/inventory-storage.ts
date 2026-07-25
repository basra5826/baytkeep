/**
 * AsyncStorage load/save for locations, rooms, and items.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { InventoryData, Item, Location, Room } from '@/types/inventory';

const LOCATIONS_KEY = '@home-inventory/locations';
const ROOMS_KEY = '@home-inventory/rooms';
const ITEMS_KEY = '@home-inventory/items';

function parseJson<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function normalizeLocations(locations: Location[]): Location[] {
  return locations.map((location) => ({
    id: location.id,
    name: location.name,
    hasRooms: location.hasRooms,
    ...(location.isFood ? { isFood: true } : {}),
  }));
}

function normalizeItems(items: Item[]): Item[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: item.createdAt,
    status: item.status === 'broken' ? 'broken' : 'works',
    ...(item.locationId ? { locationId: item.locationId } : {}),
    ...(item.roomId ? { roomId: item.roomId } : {}),
    ...(item.condition ? { condition: item.condition } : {}),
    ...(item.purchaseDate ? { purchaseDate: item.purchaseDate } : {}),
    ...(item.photo ? { photo: item.photo } : {}),
    ...(item.warrantyPhoto ? { warrantyPhoto: item.warrantyPhoto } : {}),
    ...(item.expiryDate ? { expiryDate: item.expiryDate } : {}),
    ...(item.finishDate ? { finishDate: item.finishDate } : {}),
  }));
}

export async function loadInventory(): Promise<InventoryData> {
  const [locationsJson, roomsJson, itemsJson] = await Promise.all([
    AsyncStorage.getItem(LOCATIONS_KEY),
    AsyncStorage.getItem(ROOMS_KEY),
    AsyncStorage.getItem(ITEMS_KEY),
  ]);

  const locations = normalizeLocations(parseJson<Location[]>(locationsJson) ?? []);
  const rooms = parseJson<Room[]>(roomsJson) ?? [];
  const rawItems = parseJson<Item[]>(itemsJson) ?? [];

  return {
    locations,
    rooms,
    items: normalizeItems(rawItems),
  };
}

export async function saveInventory(data: InventoryData): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(LOCATIONS_KEY, JSON.stringify(data.locations)),
    AsyncStorage.setItem(ROOMS_KEY, JSON.stringify(data.rooms)),
    AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(data.items)),
  ]);
}
