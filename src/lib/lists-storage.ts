/**
 * AsyncStorage load/save for shopping lists and list items.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ListItem, ListsData, ShoppingList } from '@/types/lists';

const LISTS_KEY = '@home-inventory/lists';
const LIST_ITEMS_KEY = '@home-inventory/list-items';

function parseJson<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function normalizeLists(lists: ShoppingList[]): ShoppingList[] {
  return lists.map((list) => ({
    id: list.id,
    name: list.name,
    createdAt: list.createdAt,
    ...(list.reminderDate ? { reminderDate: list.reminderDate } : {}),
  }));
}

function normalizeListItems(listItems: ListItem[]): ListItem[] {
  return listItems.map((item) => ({
    id: item.id,
    listId: item.listId,
    name: item.name,
    done: item.done === true,
    createdAt: item.createdAt,
  }));
}

export async function loadLists(): Promise<ListsData> {
  const [listsJson, listItemsJson] = await Promise.all([
    AsyncStorage.getItem(LISTS_KEY),
    AsyncStorage.getItem(LIST_ITEMS_KEY),
  ]);

  return {
    lists: normalizeLists(parseJson<ShoppingList[]>(listsJson) ?? []),
    listItems: normalizeListItems(parseJson<ListItem[]>(listItemsJson) ?? []),
  };
}

export async function saveLists(data: ListsData): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(LISTS_KEY, JSON.stringify(data.lists)),
    AsyncStorage.setItem(LIST_ITEMS_KEY, JSON.stringify(data.listItems)),
  ]);
}
