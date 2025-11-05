import { Flex } from '@backstage/ui';
import {
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions.ts';
import { OutdatedActionsCountButton } from './components/OutdatedActionsCountButton';

type OutdatedActionsCountsProps = {
  veryOutdatedCount: number;
  outdatedCount: number;
  onToggle: (type: UpdatedStatusEnumType) => void;
  visibleType: UpdatedStatusEnumType | null;
};
export function OutdatedActionsCounts(props: OutdatedActionsCountsProps) {
  return (
    <Flex mb="24px">
      {props.veryOutdatedCount > 0 && (
        <OutdatedActionsCountButton
          type={UpdatedStatusEnum.VERY_OUTDATED}
          count={props.veryOutdatedCount}
          onToggle={props.onToggle}
          isSelected={props.visibleType === UpdatedStatusEnum.VERY_OUTDATED}
        />
      )}
      {props.outdatedCount > 0 && (
        <OutdatedActionsCountButton
          type={UpdatedStatusEnum.OUTDATED}
          count={props.outdatedCount}
          onToggle={props.onToggle}
          isSelected={props.visibleType === UpdatedStatusEnum.OUTDATED}
        />
      )}
    </Flex>
  );
}
