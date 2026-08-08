/**
 * Shared shopping list state — loads/saves AsyncStorage and exposes CRUD.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { initializeNotifications } from '@/lib/food-notifications';
import {
  cancelListReminderNotification,
  resyncAllListReminders,
  syncListReminderNotification,
} from '@/lib/list-notifications';
import { loadLists, saveLists } from '@/lib/lists-storage';
import { createId } from '@/lib/inventory-utils';
import type { ListItem, ListsData, ShoppingList } from '@/types/lists';

type ListsContextValue = {
  lists: ShoppingList[];
  listItems: ListItem[];
  isLoaded: boolean;
  addList: (name: string) => void;
  updateList: (id: string, updates: Partial<ShoppingList>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addListItem: (listId: string, name: string) => void;
  toggleListItem: (id: string) => Promise<void>;
  deleteListItem: (id: string) => Promise<void>;
};

const ListsContext = createContext<ListsContextValue | null>(null);

export function ListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const listsRef = useRef<ListsData>({ lists: [], listItems: [] });
  const saveQueueRef = useRef(Promise.resolve());

  const applyLists = useCallback(async (next: ListsData) => {
    listsRef.current = next;
    setLists(next.lists);
    setListItems(next.listItems);

    const saveTask = saveQueueRef.current.then(() => saveLists(next));
    saveQueueRef.current = saveTask.catch(() => undefined);
    await saveTask;
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadLists().then(async (data) => {
      if (cancelled) return;
      listsRef.current = data;
      setLists(data.lists);
      setListItems(data.listItems);
      setIsLoaded(true);

      try {
        await initializeNotifications();
        await resyncAllListReminders(data.lists);
      } catch {
        // Notifications are optional — never block or crash app startup.
      }
    }).catch(() => {
      if (!cancelled) setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const addList = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const list: ShoppingList = {
        id: createId(),
        name: trimmed,
        createdAt: Date.now(),
      };

      void applyLists({
        ...listsRef.current,
        lists: [list, ...listsRef.current.lists],
      });
    },
    [applyLists],
  );

  const updateList = useCallback(
    async (id: string, updates: Partial<ShoppingList>) => {
      const existing = listsRef.current.lists.find((list) => list.id === id);
      if (!existing) return;

      const updated: ShoppingList = { ...existing, ...updates };
      if ('reminderDate' in updates && updates.reminderDate === undefined) {
        delete updated.reminderDate;
      }

      await applyLists({
        ...listsRef.current,
        lists: listsRef.current.lists.map((list) => (list.id === id ? updated : list)),
      });

      await syncListReminderNotification(updated);
    },
    [applyLists],
  );

  const deleteList = useCallback(
    async (id: string) => {
      await cancelListReminderNotification(id);
      await applyLists({
        lists: listsRef.current.lists.filter((list) => list.id !== id),
        listItems: listsRef.current.listItems.filter((item) => item.listId !== id),
      });
    },
    [applyLists],
  );

  const addListItem = useCallback(
    (listId: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const item: ListItem = {
        id: createId(),
        listId,
        name: trimmed,
        done: false,
        createdAt: Date.now(),
      };

      void applyLists({
        ...listsRef.current,
        listItems: [item, ...listsRef.current.listItems],
      });
    },
    [applyLists],
  );

  const toggleListItem = useCallback(
    async (id: string) => {
      await applyLists({
        ...listsRef.current,
        listItems: listsRef.current.listItems.map((item) =>
          item.id === id ? { ...item, done: !item.done } : item,
        ),
      });
    },
    [applyLists],
  );

  const deleteListItem = useCallback(
    async (id: string) => {
      await applyLists({
        ...listsRef.current,
        listItems: listsRef.current.listItems.filter((item) => item.id !== id),
      });
    },
    [applyLists],
  );

  const value = useMemo(
    () => ({
      lists,
      listItems,
      isLoaded,
      addList,
      updateList,
      deleteList,
      addListItem,
      toggleListItem,
      deleteListItem,
    }),
    [
      lists,
      listItems,
      isLoaded,
      addList,
      updateList,
      deleteList,
      addListItem,
      toggleListItem,
      deleteListItem,
    ],
  );

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useLists() {
  const context = useContext(ListsContext);
  if (!context) {
    throw new Error('useLists must be used within ListsProvider');
  }
  return context;
}
