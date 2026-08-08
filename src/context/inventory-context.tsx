/**
 * Shared inventory state — loads/saves AsyncStorage and exposes CRUD to all screens.
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

import {
  cancelFoodNotificationsForItem,
  initializeNotifications,
  resyncAllFoodNotifications,
  syncFoodNotificationsForItem,
} from '@/lib/food-notifications';
import { isFirstLocationsLaunch, loadInventory, saveInventory } from '@/lib/inventory-storage';
import { createId, hasLocationName, hasRoomName } from '@/lib/inventory-utils';
import type { InventoryData, Item, ItemDetailsInput, Location, Room } from '@/types/inventory';

type InventoryContextValue = {
  locations: Location[];
  rooms: Room[];
  items: Item[];
  isLoaded: boolean;
  addLocation: (name: string, hasRooms: boolean, isFood?: boolean) => string | null;
  updateLocation: (id: string, updates: Partial<Pick<Location, 'isFood' | 'hasRooms'>>) => Promise<void>;
  addRoom: (locationId: string, name: string) => string | null;
  addItem: (
    name: string,
    locationId: string,
    roomId?: string,
    details?: ItemDetailsInput,
  ) => void;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

const CLEARABLE_ITEM_KEYS = [
  'roomId',
  'condition',
  'purchaseDate',
  'photo',
  'warrantyPhoto',
  'expiryDate',
  'finishDate',
] as const;

function mergeItemUpdates(item: Item, updates: Partial<Item>): Item {
  const merged = { ...item, ...updates };
  for (const key of CLEARABLE_ITEM_KEYS) {
    if (key in updates && updates[key] === undefined) {
      delete merged[key];
    }
  }
  return merged;
}

function createDefaultLocations(): Location[] {
  return [
    { id: createId(), name: 'Fridge', hasRooms: false, isFood: true },
    { id: createId(), name: 'Pantry', hasRooms: false, isFood: true },
    { id: createId(), name: 'House', hasRooms: false },
    { id: createId(), name: 'Shed', hasRooms: false },
    { id: createId(), name: 'Storage', hasRooms: false },
  ];
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const inventoryRef = useRef<InventoryData>({ locations: [], rooms: [], items: [] });
  const saveQueueRef = useRef(Promise.resolve());

  const applyInventory = useCallback(async (next: InventoryData) => {
    inventoryRef.current = next;
    setLocations(next.locations);
    setRooms(next.rooms);
    setItems(next.items);

    const saveTask = saveQueueRef.current.then(() => saveInventory(next));
    saveQueueRef.current = saveTask.catch(() => undefined);
    await saveTask;
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadInventory().then(async (data) => {
      if (cancelled) return;

      const isFirstLaunch = await isFirstLocationsLaunch();
      if (isFirstLaunch && data.locations.length === 0) {
        await applyInventory({ ...data, locations: createDefaultLocations() });
      } else {
        inventoryRef.current = data;
        setLocations(data.locations);
        setRooms(data.rooms);
        setItems(data.items);
      }

      setIsLoaded(true);

      await initializeNotifications();
      await resyncAllFoodNotifications(
        inventoryRef.current.items,
        inventoryRef.current.locations,
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const addLocation = useCallback(
    (name: string, hasRooms: boolean, isFood = false): string | null => {
      const trimmed = name.trim();
      if (!trimmed) return 'Enter a location name.';

      if (hasLocationName(inventoryRef.current.locations, trimmed)) {
        return `"${trimmed}" already exists.`;
      }

      const location: Location = {
        id: createId(),
        name: trimmed,
        hasRooms,
        ...(isFood ? { isFood: true } : {}),
      };

      void applyInventory({
        ...inventoryRef.current,
        locations: [...inventoryRef.current.locations, location],
      });
      return null;
    },
    [applyInventory],
  );

  const updateLocation = useCallback(
    async (id: string, updates: Partial<Pick<Location, 'isFood' | 'hasRooms'>>) => {
      const location = inventoryRef.current.locations.find((entry) => entry.id === id);
      if (!location) return;

      const updated: Location = { ...location, ...updates };
      if ('isFood' in updates && !updates.isFood) {
        const itemsInLocation = inventoryRef.current.items.filter((item) => item.locationId === id);
        await Promise.all(itemsInLocation.map((item) => cancelFoodNotificationsForItem(item.id)));
      }

      await applyInventory({
        ...inventoryRef.current,
        locations: inventoryRef.current.locations.map((entry) =>
          entry.id === id ? updated : entry,
        ),
      });

      if ('isFood' in updates && updates.isFood) {
        const itemsInLocation = inventoryRef.current.items.filter((item) => item.locationId === id);
        for (const item of itemsInLocation) {
          await syncFoodNotificationsForItem(item, updated);
        }
      }
    },
    [applyInventory],
  );

  const addRoom = useCallback((locationId: string, name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return 'Enter a room name.';

    if (hasRoomName(inventoryRef.current.rooms, locationId, trimmed)) {
      return `"${trimmed}" already exists in this location.`;
    }

    const room: Room = {
      id: createId(),
      name: trimmed,
      locationId,
    };

    void applyInventory({
      ...inventoryRef.current,
      rooms: [...inventoryRef.current.rooms, room],
    });
    return null;
  }, [applyInventory]);

  const addItem = useCallback(
    async (name: string, locationId: string, roomId?: string, details?: ItemDetailsInput) => {
      const trimmed = name.trim();
      if (!trimmed || !locationId) return;

      const newItem: Item = {
        id: createId(),
        name: trimmed,
        createdAt: Date.now(),
        locationId,
        status: details?.status ?? 'works',
        ...(roomId ? { roomId } : {}),
        ...(details?.condition ? { condition: details.condition } : {}),
        ...(details?.purchaseDate ? { purchaseDate: details.purchaseDate } : {}),
        ...(details?.photo ? { photo: details.photo } : {}),
        ...(details?.warrantyPhoto ? { warrantyPhoto: details.warrantyPhoto } : {}),
        ...(details?.expiryDate ? { expiryDate: details.expiryDate } : {}),
        ...(details?.finishDate ? { finishDate: details.finishDate } : {}),
      };

      await applyInventory({
        ...inventoryRef.current,
        items: [newItem, ...inventoryRef.current.items],
      });

      const location = inventoryRef.current.locations.find((entry) => entry.id === locationId);
      await syncFoodNotificationsForItem(newItem, location);
    },
    [applyInventory],
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<Item>) => {
      const existing = inventoryRef.current.items.find((item) => item.id === id);
      if (!existing) return;

      const updated = mergeItemUpdates(existing, updates);
      await applyInventory({
        ...inventoryRef.current,
        items: inventoryRef.current.items.map((item) => (item.id === id ? updated : item)),
      });

      const location = inventoryRef.current.locations.find(
        (entry) => entry.id === updated.locationId,
      );
      await syncFoodNotificationsForItem(updated, location);
    },
    [applyInventory],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      await cancelFoodNotificationsForItem(id);
      const nextItems = inventoryRef.current.items.filter((item) => item.id !== id);
      await applyInventory({ ...inventoryRef.current, items: nextItems });
    },
    [applyInventory],
  );

  const deleteLocation = useCallback(
    async (id: string) => {
      const itemsInLocation = inventoryRef.current.items.filter((item) => item.locationId === id);
      await Promise.all(itemsInLocation.map((item) => cancelFoodNotificationsForItem(item.id)));

      await applyInventory({
        locations: inventoryRef.current.locations.filter((location) => location.id !== id),
        rooms: inventoryRef.current.rooms.filter((room) => room.locationId !== id),
        items: inventoryRef.current.items.map((item) =>
          item.locationId === id
            ? { ...item, locationId: undefined, roomId: undefined }
            : item,
        ),
      });
    },
    [applyInventory],
  );

  const deleteRoom = useCallback(
    async (id: string) => {
      await applyInventory({
        ...inventoryRef.current,
        rooms: inventoryRef.current.rooms.filter((room) => room.id !== id),
        items: inventoryRef.current.items.map((item) =>
          item.roomId === id ? { ...item, roomId: undefined } : item,
        ),
      });
    },
    [applyInventory],
  );

  const value = useMemo(
    () => ({
      locations,
      rooms,
      items,
      isLoaded,
      addLocation,
      updateLocation,
      addRoom,
      addItem,
      updateItem,
      deleteItem,
      deleteLocation,
      deleteRoom,
    }),
    [
      locations,
      rooms,
      items,
      isLoaded,
      addLocation,
      updateLocation,
      addRoom,
      addItem,
      updateItem,
      deleteItem,
      deleteLocation,
      deleteRoom,
    ],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
}
