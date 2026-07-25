/**
 * Helpers for shopping list display and sorting.
 */

import type { ListItem, ShoppingList } from '@/types/lists';

export function getItemsForList(listItems: ListItem[], listId: string): ListItem[] {
  return listItems
    .filter((item) => item.listId === listId)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
}

export function getListProgress(listItems: ListItem[], listId: string): string {
  const items = listItems.filter((item) => item.listId === listId);
  if (items.length === 0) return '0 items';
  const doneCount = items.filter((item) => item.done).length;
  return `${doneCount}/${items.length} done`;
}

export function sortListsByRecent(lists: ShoppingList[]): ShoppingList[] {
  return [...lists].sort((a, b) => b.createdAt - a.createdAt);
}
