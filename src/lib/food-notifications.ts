/**
 * Food item local notifications — schedule, cancel, and permission handling.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { formatFoodDate } from '@/lib/inventory-utils';
import type { Item, Location } from '@/types/inventory';

const ANDROID_CHANNEL_ID = 'food-reminders';

export function isNotificationsSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function expiryNotificationId(itemId: string): string {
  return `food-${itemId}-expiry`;
}

function finishNotificationId(itemId: string): string {
  return `food-${itemId}-finish`;
}

/** Compute notifyAt = targetDate minus 15% of (targetDate - addedDate). */
export function computeNotifyAt(addedAtMs: number, targetDateIso: string): Date | null {
  const added = new Date(addedAtMs);
  added.setHours(12, 0, 0, 0);

  const target = new Date(`${targetDateIso}T12:00:00`);
  const totalMs = target.getTime() - added.getTime();
  if (totalMs <= 0) return null;

  const totalDays = totalMs / (1000 * 60 * 60 * 24);
  const leadDays = totalDays * 0.15;
  const notifyAt = new Date(target.getTime() - leadDays * 24 * 60 * 60 * 1000);

  if (notifyAt.getTime() <= Date.now()) return null;
  return notifyAt;
}

export async function initializeNotifications(): Promise<boolean> {
  if (!isNotificationsSupported()) return false;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'Food reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === 'granted') return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === 'granted';
  } catch {
    return false;
  }
}

export async function cancelFoodNotificationsForItem(itemId: string): Promise<void> {
  if (!isNotificationsSupported()) return;

  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(expiryNotificationId(itemId)),
    Notifications.cancelScheduledNotificationAsync(finishNotificationId(itemId)),
  ]);
}

async function scheduleFoodDateNotification(
  item: Item,
  type: 'expiry' | 'finish',
  targetDateIso: string,
): Promise<void> {
  const notifyAt = computeNotifyAt(item.createdAt, targetDateIso);
  if (!notifyAt) return;

  const formatted = formatFoodDate(targetDateIso);
  const body =
    type === 'expiry'
      ? `${item.name} expires on ${formatted}`
      : `${item.name} will run out on ${formatted}`;

  await Notifications.scheduleNotificationAsync({
    identifier: type === 'expiry' ? expiryNotificationId(item.id) : finishNotificationId(item.id),
    content: {
      title: 'Baytkeep',
      body,
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notifyAt,
    },
  });
}

export async function syncFoodNotificationsForItem(
  item: Item,
  location: Location | undefined,
): Promise<void> {
  if (!isNotificationsSupported()) return;

  await cancelFoodNotificationsForItem(item.id);

  if (!location?.isFood) return;

  if (item.expiryDate) {
    await scheduleFoodDateNotification(item, 'expiry', item.expiryDate);
  }
  if (item.finishDate) {
    await scheduleFoodDateNotification(item, 'finish', item.finishDate);
  }
}

export async function resyncAllFoodNotifications(
  items: Item[],
  locations: Location[],
): Promise<void> {
  if (!isNotificationsSupported()) return;

  for (const item of items) {
    const location = locations.find((entry) => entry.id === item.locationId);
    await syncFoodNotificationsForItem(item, location);
  }
}
