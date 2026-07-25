/**
 * Needed wishlist state — someday items kept separate from owned inventory.
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

import { createId } from '@/lib/inventory-utils';
import { loadNeededItems, saveNeededItems } from '@/lib/needed-storage';
import type { NeededItem } from '@/types/needed';

type NeededContextValue = {
  neededItems: NeededItem[];
  isLoaded: boolean;
  addNeededItem: (name: string) => void;
  deleteNeededItem: (id: string) => Promise<void>;
};

const NeededContext = createContext<NeededContextValue | null>(null);

export function NeededProvider({ children }: { children: ReactNode }) {
  const [neededItems, setNeededItems] = useState<NeededItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const neededRef = useRef<NeededItem[]>([]);
  const saveQueueRef = useRef(Promise.resolve());

  const applyNeeded = useCallback(async (next: NeededItem[]) => {
    neededRef.current = next;
    setNeededItems(next);

    const saveTask = saveQueueRef.current.then(() => saveNeededItems(next));
    saveQueueRef.current = saveTask.catch(() => undefined);
    await saveTask;
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadNeededItems().then((data) => {
      if (cancelled) return;
      neededRef.current = data;
      setNeededItems(data);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const addNeededItem = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const item: NeededItem = {
        id: createId(),
        name: trimmed,
        createdAt: Date.now(),
      };

      void applyNeeded([item, ...neededRef.current]);
    },
    [applyNeeded],
  );

  const deleteNeededItem = useCallback(
    async (id: string) => {
      await applyNeeded(neededRef.current.filter((item) => item.id !== id));
    },
    [applyNeeded],
  );

  const value = useMemo(
    () => ({
      neededItems,
      isLoaded,
      addNeededItem,
      deleteNeededItem,
    }),
    [neededItems, isLoaded, addNeededItem, deleteNeededItem],
  );

  return <NeededContext.Provider value={value}>{children}</NeededContext.Provider>;
}

export function useNeeded() {
  const context = useContext(NeededContext);
  if (!context) {
    throw new Error('useNeeded must be used within NeededProvider');
  }
  return context;
}
