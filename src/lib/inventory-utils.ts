/**
 * Helpers for IDs, location paths, and item display labels.
 */

import type { Item, Location, Room } from '@/types/inventory';

export const LOCATION_SUGGESTIONS = ['House', 'Shed', 'Storage'] as const;
export const FOOD_LOCATION_SUGGESTIONS = ['Fridge', 'Pantry'] as const;

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getItemLocationPath(
  item: Item,
  locations: Location[],
  rooms: Room[],
): string {
  if (!item.locationId) {
    return 'Unassigned';
  }

  const location = locations.find((entry) => entry.id === item.locationId);
  if (!location) {
    return 'Unknown location';
  }

  if (item.roomId) {
    const room = rooms.find((entry) => entry.id === item.roomId);
    if (room) {
      return `${location.name} / ${room.name}`;
    }
  }

  return location.name;
}

export function formatItemLabel(
  item: Item,
  locations: Location[],
  rooms: Room[],
): string {
  return `${item.name} — ${getItemLocationPath(item, locations, rooms)}`;
}

export function getRoomsForLocation(rooms: Room[], locationId: string): Room[] {
  return rooms.filter((room) => room.locationId === locationId);
}

export function sortLocationsFoodFirst(locations: Location[]): Location[] {
  return [...locations].sort((a, b) => {
    const aFood = a.isFood ? 1 : 0;
    const bFood = b.isFood ? 1 : 0;
    if (aFood !== bFood) return bFood - aFood;
    return a.name.localeCompare(b.name);
  });
}

function isSectionFood(key: string, locations: Location[]): boolean {
  const locationId = key.split(':')[0];
  if (locationId === 'unassigned') return false;
  return locations.find((location) => location.id === locationId)?.isFood === true;
}

export function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDisplayDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format an ISO date as DD/MM/YYYY for food labels and notifications. */
export function formatFoodDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

export function isFoodLocation(location: Location | null | undefined): boolean {
  return location?.isFood === true;
}

export function getFoodDateSubtitle(item: Item, locations: Location[]): string | null {
  const location = locations.find((entry) => entry.id === item.locationId);
  if (!isFoodLocation(location)) return null;

  const parts: string[] = [];
  if (item.expiryDate) parts.push(`expires ${formatFoodDate(item.expiryDate)}`);
  if (item.finishDate) parts.push(`runs out ${formatFoodDate(item.finishDate)}`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function getItemStatus(item: Item): Item['status'] {
  return item.status === 'broken' ? 'broken' : 'works';
}

export function hasLocationName(locations: Location[], name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return locations.some((location) => location.name.toLowerCase() === normalized);
}

export function hasRoomName(rooms: Room[], locationId: string, name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return rooms.some(
    (room) => room.locationId === locationId && room.name.toLowerCase() === normalized,
  );
}

export type ItemSection = {
  key: string;
  title: string;
  data: Item[];
};

export function groupItemsByLocation(
  items: Item[],
  locations: Location[],
  rooms: Room[],
): ItemSection[] {
  const sectionMap = new Map<string, ItemSection>();
  const sortedItems = [...items].sort((a, b) => b.createdAt - a.createdAt);

  for (const item of sortedItems) {
    const path = getItemLocationPath(item, locations, rooms);
    const key = `${item.locationId ?? 'unassigned'}:${item.roomId ?? 'none'}`;

    const existing = sectionMap.get(key);
    if (existing) {
      existing.data.push(item);
    } else {
      sectionMap.set(key, {
        key,
        title: path.toUpperCase(),
        data: [item],
      });
    }
  }

  return Array.from(sectionMap.values()).sort((a, b) => {
    const aFood = isSectionFood(a.key, locations);
    const bFood = isSectionFood(b.key, locations);
    if (aFood && !bFood) return -1;
    if (!aFood && bFood) return 1;
    return a.title.localeCompare(b.title);
  });
}
