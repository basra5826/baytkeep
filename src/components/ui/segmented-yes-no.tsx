/**
 * Compact horizontal Yes/No segmented control.
 */

import { SegmentedControl } from '@/components/ui/segmented-control';

type SegmentedYesNoProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function SegmentedYesNo({ value, onValueChange }: SegmentedYesNoProps) {
  return (
    <SegmentedControl
      options={['Yes', 'No']}
      selectedIndex={value ? 0 : 1}
      onSelectIndex={(index) => onValueChange(index === 0)}
    />
  );
}
