/**
 * AsyncStorage load/save for the needed wishlist.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NeededItem } from '@/types/needed';

const NEEDED_KEY = '@home-inventory/needed-items';

function parseJson<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function normalizeNeededItems(items: NeededItem[]): NeededItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: item.createdAt,
  }));
}

export async function loadNeededItems(): Promise<NeededItem[]> {
  const json = await AsyncStorage.getItem(NEEDED_KEY);
  return normalizeNeededItems(parseJson<NeededItem[]>(json) ?? []);
}

export async function saveNeededItems(items: NeededItem[]): Promise<void> {
  await AsyncStorage.setItem(NEEDED_KEY, JSON.stringify(items));
}
