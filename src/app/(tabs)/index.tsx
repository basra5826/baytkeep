/**
 * Home screen — browse inventory grouped by location/room with search and FAB.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLockup } from '@/components/ui/brand-lockup';
import { SwipeToDeleteRow } from '@/components/ui/swipe-to-delete-row';
import { AppStyles } from '@/constants/app-styles';
import { BottomTabInset, Colors, getCardShadow, resolveColorScheme } from '@/constants/theme';
import { useInventory } from '@/context/inventory-context';
import { useNeeded } from '@/context/needed-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { confirmAction } from '@/lib/confirm';
import {
  formatItemLabel,
  getFoodDateSubtitle,
  getItemStatus,
  groupItemsByLocation,
  isFoodLocation,
  type ItemSection,
} from '@/lib/inventory-utils';
import type { Item } from '@/types/inventory';
import type { NeededItem } from '@/types/needed';

type StatusFilter = 'all' | 'broken' | 'needed';

const TAB_BAR_CLEARANCE = BottomTabInset + 8;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const scheme = resolveColorScheme(colorScheme);
  const colors = Colors[scheme];
  const cardShadow = getCardShadow(scheme);
  const { items, locations, rooms } = useInventory();
  const { neededItems, isLoaded: neededLoaded, addNeededItem, deleteNeededItem } = useNeeded();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [newNeededName, setNewNeededName] = useState('');

  const isNeededView = statusFilter === 'needed';
  const isSearching = !isNeededView && searchQuery.trim().length > 0;

  const statusFilteredItems = useMemo(() => {
    if (statusFilter === 'broken') {
      return items.filter((item) => {
        const location = locations.find((entry) => entry.id === item.locationId);
        return !isFoodLocation(location) && getItemStatus(item) === 'broken';
      });
    }
    if (statusFilter === 'needed') return [];
    return items;
  }, [items, statusFilter, locations]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return statusFilteredItems;
    return statusFilteredItems.filter((item) => item.name.toLowerCase().includes(query));
  }, [statusFilteredItems, searchQuery]);

  const sections = useMemo(() => {
    if (isNeededView) return [];
    if (isSearching) {
      const searchSection: ItemSection = {
        key: 'search-results',
        title: 'RESULTS',
        data: [...filteredItems].sort((a, b) => b.createdAt - a.createdAt),
      };
      return searchSection.data.length > 0 ? [searchSection] : [];
    }
    return groupItemsByLocation(statusFilteredItems, locations, rooms);
  }, [isNeededView, isSearching, filteredItems, statusFilteredItems, locations, rooms]);

  const sortedNeededItems = useMemo(
    () => [...neededItems].sort((a, b) => b.createdAt - a.createdAt),
    [neededItems],
  );

  const openItem = (item: Item) => {
    router.push(`/item/${item.id}`);
  };

  const handleAddNeeded = () => {
    const trimmed = newNeededName.trim();
    if (!trimmed) return;
    addNeededItem(trimmed);
    setNewNeededName('');
  };

  const confirmDeleteNeeded = (item: NeededItem) => {
    void (async () => {
      const confirmed = await confirmAction({
        title: 'Remove needed item',
        message: `Remove "${item.name}" from your needed list?`,
        confirmLabel: 'Remove',
      });
      if (!confirmed) return;
      await deleteNeededItem(item.id);
    })();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <BrandLockup />
          <Pressable
            style={[styles.headerIconButton, { backgroundColor: colors.backgroundElement }]}
            onPress={() => router.push('/settings')}
            accessibilityLabel="Settings"
            hitSlop={4}>
            <MaterialCommunityIcons name="cog-outline" size={22} color={AppStyles.primary} />
          </Pressable>
        </View>

        {!isNeededView ? (
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElement,
              },
            ]}
            placeholder="Search items"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        ) : (
          <Text style={[styles.neededHint, { color: colors.textSecondary }]}>
            Things you want someday — not what you own yet.
          </Text>
        )}

        <View style={styles.filterRow}>
          <View style={styles.filterChips}>
            <FilterChip
              label="All"
              selected={statusFilter === 'all'}
              colors={colors}
              onPress={() => setStatusFilter('all')}
            />
            <FilterChip
              label="Broken"
              selected={statusFilter === 'broken'}
              colors={colors}
              iconName="alert-circle-outline"
              iconColor={AppStyles.danger}
              onPress={() => setStatusFilter('broken')}
            />
            <FilterChip
              label="Needed"
              selected={statusFilter === 'needed'}
              colors={colors}
              onPress={() => setStatusFilter('needed')}
            />
          </View>
        </View>

        {isNeededView ? (
          <>
            <View style={styles.neededAddRow}>
              <TextInput
                style={[
                  styles.neededInput,
                  { color: colors.text, backgroundColor: colors.backgroundElement },
                ]}
                placeholder="Add something you want"
                placeholderTextColor={colors.textSecondary}
                value={newNeededName}
                onChangeText={setNewNeededName}
                returnKeyType="done"
                onSubmitEditing={handleAddNeeded}
              />
              <Pressable
                style={[styles.neededAddButton, { opacity: newNeededName.trim() ? 1 : 0.5 }]}
                onPress={handleAddNeeded}
                disabled={!newNeededName.trim()}>
                <Text style={styles.neededAddButtonText}>Add</Text>
              </Pressable>
            </View>

            <FlatList
              data={sortedNeededItems}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={[
                styles.listContent,
                styles.neededListContent,
                { paddingBottom: TAB_BAR_CLEARANCE + 16 },
              ]}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                  {!neededLoaded
                    ? 'Loading…'
                    : 'Nothing on your needed list yet.\nAdd something above.'}
                </Text>
              }
              renderItem={({ item }) => (
                <SwipeToDeleteRow onDelete={() => confirmDeleteNeeded(item)}>
                  <View
                    style={[
                      styles.neededCard,
                      { backgroundColor: colors.backgroundElement },
                      cardShadow,
                    ]}>
                    <Text style={[styles.neededName, { color: colors.text }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>
                </SwipeToDeleteRow>
              )}
            />
          </>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={false}
            style={styles.list}
            contentContainerStyle={[styles.listContent, { paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
            keyboardShouldPersistTaps="handled"
            renderSectionHeader={({ section }) => (
              <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
                {section.title}
              </Text>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                {items.length === 0
                  ? 'No items yet.\nTap + to add your first one.'
                  : statusFilter === 'broken'
                    ? 'No broken items — everything works!'
                    : 'No items match your search.'}
              </Text>
            }
            renderItem={({ item }) => {
              const itemLocation = locations.find((entry) => entry.id === item.locationId);
              const isBroken =
                !isFoodLocation(itemLocation) && getItemStatus(item) === 'broken';
              const foodSubtitle = getFoodDateSubtitle(item, locations);

              return (
                <Pressable
                  style={[
                    styles.itemCard,
                    { backgroundColor: colors.backgroundElement },
                    cardShadow,
                    isBroken && styles.itemCardBroken,
                  ]}
                  onPress={() => openItem(item)}>
                  {isBroken ? (
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={20}
                      color={AppStyles.danger}
                    />
                  ) : null}
                  <View style={styles.itemTextBlock}>
                    <Text
                      style={[
                        styles.itemName,
                        { color: isBroken ? AppStyles.dangerText : colors.text },
                      ]}
                      numberOfLines={2}>
                      {isSearching
                        ? formatItemLabel(item, locations, rooms)
                        : item.name}
                    </Text>
                    {foodSubtitle ? (
                      <Text style={[styles.foodSubtitle, { color: colors.textSecondary }]}>
                        {foodSubtitle}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            }}
            SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  selected,
  colors,
  onPress,
  iconName,
  iconColor,
}: {
  label: string;
  selected: boolean;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
  onPress: () => void;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
}) {
  const textColor = selected ? AppStyles.primaryText : colors.text;
  const resolvedIconColor = selected
    ? AppStyles.primaryText
    : iconColor ?? colors.text;

  return (
    <Pressable
      style={[
        styles.filterChip,
        {
          backgroundColor: selected ? AppStyles.primary : colors.backgroundElement,
        },
      ]}
      onPress={onPress}>
      <View style={styles.filterChipContent}>
        {iconName ? (
          <MaterialCommunityIcons name={iconName} size={15} color={resolvedIconColor} />
        ) : null}
        <Text style={[styles.filterChipText, { color: textColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: AppStyles.screenPadding,
    paddingTop: 4,
  },
  topBar: {
    marginBottom: 16,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconButton: {
    width: AppStyles.minTapTarget,
    height: AppStyles.minTapTarget,
    borderRadius: AppStyles.minTapTarget / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  searchInput: {
    height: AppStyles.minTapTarget,
    borderRadius: AppStyles.inputRadius,
    paddingHorizontal: 14,
    fontSize: 17,
    marginBottom: 12,
  },
  neededHint: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  filterChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  neededAddRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  neededInput: {
    flex: 1,
    height: AppStyles.minTapTarget,
    borderRadius: AppStyles.inputRadius,
    paddingHorizontal: 14,
    fontSize: 17,
  },
  neededAddButton: {
    minWidth: 72,
    height: AppStyles.minTapTarget,
    borderRadius: AppStyles.buttonRadius,
    backgroundColor: AppStyles.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  neededAddButtonText: {
    color: AppStyles.primaryText,
    fontSize: 17,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionGap: {
    height: AppStyles.sectionGap,
  },
  itemCard: {
    borderRadius: AppStyles.cardRadius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: AppStyles.itemGap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemCardBroken: {
    borderLeftWidth: 4,
    borderLeftColor: AppStyles.danger,
  },
  itemTextBlock: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 17,
  },
  foodSubtitle: {
    fontSize: 13,
  },
  neededListContent: {
    gap: AppStyles.itemGap,
  },
  neededCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  neededName: {
    fontSize: 17,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 24,
    marginTop: 48,
    paddingHorizontal: 8,
  },
});
