import { Flex } from '@backstage/ui';
import {
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions.ts';
import { ActionsCountButton } from './ActionsCountButton.tsx';

type ActionCountButtonsProps = {
  totalCount: number;
  veryOutdatedCount: number;
  outdatedCount: number;
  updatedCount: number;
  onActionCountClick: (type: UpdatedStatusEnumType) => void;
  updatedStatusToDisplay: UpdatedStatusEnumType | null;
};
export function ActionCountButtons(props: ActionCountButtonsProps) {
  return (
    <Flex mb="24px" style={{ flexWrap: 'wrap' }}>
      {props.veryOutdatedCount > 0 && (
        <ActionsCountButton
          type={UpdatedStatusEnum.VERY_OUTDATED}
          count={props.veryOutdatedCount}
          totalCount={props.totalCount}
          onActionCountClick={props.onActionCountClick}
          isSelected={
            props.updatedStatusToDisplay === UpdatedStatusEnum.VERY_OUTDATED
          }
        />
      )}
      {props.outdatedCount > 0 && (
        <ActionsCountButton
          type={UpdatedStatusEnum.OUTDATED}
          count={props.outdatedCount}
          totalCount={props.totalCount}
          onActionCountClick={props.onActionCountClick}
          isSelected={
            props.updatedStatusToDisplay === UpdatedStatusEnum.OUTDATED
          }
        />
      )}
      {props.updatedCount > 0 && (
        <ActionsCountButton
          type={UpdatedStatusEnum.UPDATED}
          count={props.updatedCount}
          totalCount={props.totalCount}
          onActionCountClick={props.onActionCountClick}
          isSelected={
            props.updatedStatusToDisplay === UpdatedStatusEnum.UPDATED
          }
        />
      )}
    </Flex>
  );
}
