import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { Flex, Text, Box, Button } from '@backstage/ui';
import {
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions.ts';

type OutdatedActionsCountsProps = {
  veryOutdatedCount: number;
  outdatedCount: number;
  onToggle: (type: UpdatedStatusEnumType) => void;
  visibleType: UpdatedStatusEnumType | null;
};
export function OutdatedActionsCounts(props: OutdatedActionsCountsProps) {
  return (
    <Flex>
      {props.veryOutdatedCount > 0 && (
        <OutdatedActionsBadge
          type={UpdatedStatusEnum.VERY_OUTDATED}
          count={props.veryOutdatedCount}
          onToggle={props.onToggle}
          isSelected={props.visibleType === UpdatedStatusEnum.VERY_OUTDATED}
        />
      )}
      {props.outdatedCount > 0 && (
        <OutdatedActionsBadge
          type={UpdatedStatusEnum.OUTDATED}
          count={props.outdatedCount}
          onToggle={props.onToggle}
          isSelected={props.visibleType === UpdatedStatusEnum.OUTDATED}
        />
      )}
    </Flex>
  );
}

type OutdatedActionsBadgeProps = {
  type: UpdatedStatusEnumType;
  count: number;
  onToggle: (type: UpdatedStatusEnumType) => void;
  isSelected: boolean;
};

function OutdatedActionsBadge(props: OutdatedActionsBadgeProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  function getBackgroundColor(
    isSelected: boolean,
    type: UpdatedStatusEnumType,
  ) {
    if (isSelected) {
      if (type === UpdatedStatusEnum.VERY_OUTDATED) {
        return '#EBB095';
      }
      if (type === UpdatedStatusEnum.OUTDATED) {
        return '#FFDD9D';
      }
    }
    if (type === UpdatedStatusEnum.OUTDATED) {
      return '#FFF7ED';
    }
    return '#FCF1E8';
  }

  const filterBoxStyle = {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '8px',
    paddingLeft: '20px',
    paddingBottom: '8px',
    paddingRight: '20px',
    borderRadius: '24px',
    border:
      props.type === UpdatedStatusEnum.VERY_OUTDATED
        ? '1px solid #F23131'
        : '1px solid #FF8B38',
    backgroundColor: getBackgroundColor(props.isSelected, props.type),
  };
  const filterSpanStyle = {
    width: '26px',
    height: '26px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    backgroundColor:
      props.type === UpdatedStatusEnum.VERY_OUTDATED ? '#F23131' : '#FF8B38',
  };
  return (
    <Button style={filterBoxStyle} onClick={() => props.onToggle(props.type)}>
      <Box style={filterSpanStyle}>
        <Text style={{ color: 'white' }} weight="bold">
          {props.count}
        </Text>
      </Box>
      <Text weight="bold">
        {props.type === UpdatedStatusEnum.VERY_OUTDATED
          ? t('filterButton.veryOutdated')
          : t('filterButton.outdated')}
      </Text>
    </Button>
  );
}
