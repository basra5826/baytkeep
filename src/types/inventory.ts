/**
 * Data types for locations, rooms, and inventory items.
 */

export type ItemStatus = 'works' | 'broken';
export type ItemCondition = 'new' | 'used';

export type Location = {
  id: string;
  name: string;
  hasRooms: boolean;
  isFood?: boolean;
};

export type Room = {
  id: string;
  name: string;
  locationId: string;
};

export type Item = {
  id: string;
  name: string;
  createdAt: number;
  locationId?: string;
  roomId?: string;
  status: ItemStatus;
  condition?: ItemCondition;
  purchaseDate?: string;
  photo?: string;
  warrantyPhoto?: string;
  expiryDate?: string;
  finishDate?: string;
};

export type ItemDetailsInput = {
  status?: ItemStatus;
  condition?: ItemCondition;
  purchaseDate?: string;
  photo?: string;
  warrantyPhoto?: string;
  expiryDate?: string;
  finishDate?: string;
};

export type InventoryData = {
  locations: Location[];
  rooms: Room[];
  items: Item[];
};
