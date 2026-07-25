/**
 * Shopping list reminder notifications — one optional reminder per list.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { isNotificationsSupported } from '@/lib/food-notifications';
import type { ShoppingList } from '@/types/lists';

const ANDROID_CHANNEL_ID = 'list-reminders';

function listReminderNotificationId(listId: string): string {
  return `list-reminder-${listId}`;
}

async function ensureListNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'List reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function cancelListReminderNotification(listId: string): Promise<void> {
  if (!isNotificationsSupported()) return;
  await Notifications.cancelScheduledNotificationAsync(listReminderNotificationId(listId));
}

export async function syncListReminderNotification(list: ShoppingList): Promise<void> {
  if (!isNotificationsSupported()) return;

  await cancelListReminderNotification(list.id);

  if (!list.reminderDate) return;

  const notifyAt = new Date(`${list.reminderDate}T09:00:00`);
  if (notifyAt.getTime() <= Date.now()) return;

  await ensureListNotificationChannel();

  await Notifications.scheduleNotificationAsync({
    identifier: listReminderNotificationId(list.id),
    content: {
      title: 'Baytkeep',
      body: `${list.name} — don't forget to shop!`,
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notifyAt,
    },
  });
}

export async function resyncAllListReminders(lists: ShoppingList[]): Promise<void> {
  if (!isNotificationsSupported()) return;

  for (const list of lists) {
    await syncListReminderNotification(list);
  }
}
