/**
 * Row wrapper — swipe left to reveal a delete action (iOS-style).
 */

import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { AppStyles } from '@/constants/app-styles';
import { BrandColors } from '@/constants/theme';

const DELETE_ACTION_WIDTH = 80;

type SwipeToDeleteRowProps = {
  children: ReactNode;
  onDelete: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SwipeToDeleteRow({ children, onDelete, style }: SwipeToDeleteRowProps) {
  const renderRightActions = () => (
    <Pressable
      style={styles.deleteAction}
      onPress={onDelete}
      accessibilityRole="button"
      accessibilityLabel="Delete">
      <Text style={styles.deleteLabel}>Delete</Text>
    </Pressable>
  );

  return (
    <View style={style}>
      <Swipeable
        containerStyle={styles.swipeContainer}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        rightThreshold={40}>
        {children}
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    borderRadius: AppStyles.cardRadius,
    overflow: 'hidden',
  },
  deleteAction: {
    width: DELETE_ACTION_WIDTH,
    backgroundColor: AppStyles.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteLabel: {
    color: BrandColors.primaryText,
    fontSize: 15,
    fontWeight: '600',
  },
});
