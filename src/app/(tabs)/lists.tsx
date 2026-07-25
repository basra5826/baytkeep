/**
 * Lists screen — view and create shopping lists (things to buy).
 */

import { router } from 'expo-router';
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

import { AppStyles } from '@/constants/app-styles';
import { BottomTabInset, Colors, getCardShadow, resolveColorScheme } from '@/constants/theme';
import { useLists } from '@/context/lists-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { confirmAction } from '@/lib/confirm';
import { getListProgress, sortListsByRecent } from '@/lib/lists-utils';
import { formatFoodDate } from '@/lib/inventory-utils';
import type { ShoppingList } from '@/types/lists';

const TAB_BAR_CLEARANCE = BottomTabInset + 8;

export default function ListsScreen() {
  const colorScheme = useColorScheme();
  const scheme = resolveColorScheme(colorScheme);
  const colors = Colors[scheme];
  const cardShadow = getCardShadow(scheme);
  const { lists, listItems, isLoaded, addList, deleteList } = useLists();
  const [newListName, setNewListName] = useState('');

  const sortedLists = useMemo(() => sortListsByRecent(lists), [lists]);

  const handleAddList = () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;
    addList(trimmed);
    setNewListName('');
  };

  const confirmDeleteList = (list: ShoppingList) => {
    void (async () => {
      const confirmed = await confirmAction({
        title: 'Delete list',
        message: `Delete "${list.name}" and all its items?`,
        confirmLabel: 'Delete',
      });
      if (!confirmed) return;
      await deleteList(list.id);
    })();
  };

  const openList = (list: ShoppingList) => {
    router.push(`/list/${list.id}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Lists</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Things you need to buy — separate from what you already own.
          </Text>

          <View style={styles.createRow}>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, backgroundColor: colors.backgroundElement },
              ]}
              placeholder="New list name (e.g. Grocery list)"
              placeholderTextColor={colors.textSecondary}
              value={newListName}
              onChangeText={setNewListName}
              returnKeyType="done"
              onSubmitEditing={handleAddList}
            />
            <Pressable
              style={[styles.addButton, { opacity: newListName.trim() ? 1 : 0.5 }]}
              onPress={handleAddList}
              disabled={!newListName.trim()}>
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>

          {!isLoaded ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading…</Text>
          ) : (
            <FlatList
              style={styles.flex}
              data={sortedLists}
              keyExtractor={(list) => list.id}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: TAB_BAR_CLEARANCE + 16 },
              ]}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No lists yet. Create one above.
                </Text>
              }
              renderItem={({ item: list }) => (
                <View
                  style={[
                    styles.listCard,
                    { backgroundColor: colors.backgroundElement },
                    cardShadow,
                  ]}>
                  <Pressable style={styles.listCardMain} onPress={() => openList(list)}>
                    <Text style={[styles.listName, { color: colors.text }]}>{list.name}</Text>
                    <Text style={[styles.listMeta, { color: colors.textSecondary }]}>
                      {getListProgress(listItems, list.id)}
                      {list.reminderDate
                        ? ` · Reminder ${formatFoodDate(list.reminderDate)}`
                        : ''}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.deleteAction}
                    onPress={() => confirmDeleteList(list)}
                    hitSlop={8}>
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </Pressable>
                </View>
              )}
            />
          )}
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
    paddingTop: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  createRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
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
    flexGrow: 1,
    gap: AppStyles.itemGap,
  },
  listCard: {
    borderRadius: AppStyles.cardRadius,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  listCardMain: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 2,
  },
  listName: {
    fontSize: 17,
    fontWeight: '600',
  },
  listMeta: {
    fontSize: 14,
  },
  deleteAction: {
    minHeight: AppStyles.minTapTarget,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  deleteActionText: {
    color: AppStyles.danger,
    fontSize: 15,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 24,
    marginTop: 48,
  },
});
