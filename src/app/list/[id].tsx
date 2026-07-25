/**
 * List detail screen — checklist of items to buy, with optional list reminder.
 */

import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateField } from '@/components/date-field';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AppStyles } from '@/constants/app-styles';
import { Colors } from '@/constants/theme';
import { useLists } from '@/context/lists-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { confirmAction } from '@/lib/confirm';
import { getItemsForList } from '@/lib/lists-utils';
import type { ListItem } from '@/types/lists';

export default function ListDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { lists, listItems, isLoaded, updateList, addListItem, toggleListItem, deleteListItem } =
    useLists();
  const [newItemName, setNewItemName] = useState('');

  const list = useMemo(() => lists.find((entry) => entry.id === id), [lists, id]);

  const items = useMemo(
    () => (id ? getItemsForList(listItems, id) : []),
    [listItems, id],
  );

  const handleAddItem = () => {
    if (!id) return;
    const trimmed = newItemName.trim();
    if (!trimmed) return;
    addListItem(id, trimmed);
    setNewItemName('');
  };

  const confirmDeleteItem = (item: ListItem) => {
    void (async () => {
      const confirmed = await confirmAction({
        title: 'Delete item',
        message: `Remove "${item.name}" from this list?`,
        confirmLabel: 'Delete',
      });
      if (!confirmed) return;
      await deleteListItem(item.id);
    })();
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.missing}>
          <ScreenHeader title="List" />
          <Text style={[styles.missingText, { color: colors.textSecondary }]}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!list) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.missing}>
          <ScreenHeader title="List" />
          <Text style={[styles.missingText, { color: colors.textSecondary }]}>List not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <ScreenHeader title={list.name} />

          <View style={[styles.reminderCard, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>List reminder</Text>
            <DateField
              addLabel="Set reminder date"
              displayLabel="Reminder"
              value={list.reminderDate}
              minimumDate={new Date()}
              onChange={(reminderDate) => void updateList(list.id, { reminderDate })}
            />
          </View>

          <View style={styles.addRow}>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, backgroundColor: colors.backgroundElement },
              ]}
              placeholder="Add an item"
              placeholderTextColor={colors.textSecondary}
              value={newItemName}
              onChangeText={setNewItemName}
              returnKeyType="done"
              onSubmitEditing={handleAddItem}
            />
            <Pressable
              style={[styles.addButton, { opacity: newItemName.trim() ? 1 : 0.5 }]}
              onPress={handleAddItem}
              disabled={!newItemName.trim()}>
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>

          <FlatList
            style={styles.flex}
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Nothing on this list yet. Add items above.
              </Text>
            }
            renderItem={({ item }) => (
              <View
                style={[styles.itemRow, { backgroundColor: colors.backgroundElement }]}>
                <Pressable
                  style={styles.checkbox}
                  onPress={() => void toggleListItem(item.id)}
                  hitSlop={8}>
                  <View
                    style={[
                      styles.checkboxBox,
                      {
                        borderColor: item.done ? AppStyles.primary : colors.backgroundSelected,
                        backgroundColor: item.done ? AppStyles.primary : colors.background,
                      },
                    ]}>
                    {item.done ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                </Pressable>
                <Text
                  style={[
                    styles.itemName,
                    { color: item.done ? colors.textSecondary : colors.text },
                    item.done && styles.itemNameDone,
                  ]}
                  numberOfLines={2}>
                  {item.name}
                </Text>
                <Pressable
                  style={styles.deleteAction}
                  onPress={() => confirmDeleteItem(item)}
                  hitSlop={8}>
                  <Text style={[styles.deleteActionText, { color: colors.textSecondary }]}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: AppStyles.screenPadding,
    gap: 12,
  },
  missing: {
    paddingHorizontal: AppStyles.screenPadding,
  },
  missingText: {
    fontSize: 17,
    marginTop: 24,
    textAlign: 'center',
  },
  reminderCard: {
    borderRadius: AppStyles.cardRadius,
    padding: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: AppStyles.minTapTarget,
    borderRadius: AppStyles.inputRadius,
    paddingHorizontal: 14,
    fontSize: 17,
  },
  addButton: {
    minWidth: 72,
    height: AppStyles.minTapTarget,
    borderRadius: AppStyles.buttonRadius,
    backgroundColor: AppStyles.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: AppStyles.primaryText,
    fontSize: 17,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 32,
    gap: AppStyles.itemGap,
    flexGrow: 1,
  },
  itemRow: {
    borderRadius: AppStyles.cardRadius,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: AppStyles.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  itemName: {
    flex: 1,
    fontSize: 17,
  },
  itemNameDone: {
    textDecorationLine: 'line-through',
  },
  deleteAction: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  deleteActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 24,
    marginTop: 32,
  },
});
