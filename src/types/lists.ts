/**
 * Data types for shopping lists — things to buy, separate from owned inventory.
 */

export type ShoppingList = {
  id: string;
  name: string;
  createdAt: number;
  reminderDate?: string;
};

export type ListItem = {
  id: string;
  listId: string;
  name: string;
  done: boolean;
  createdAt: number;
};

export type ListsData = {
  lists: ShoppingList[];
  listItems: ListItem[];
};
