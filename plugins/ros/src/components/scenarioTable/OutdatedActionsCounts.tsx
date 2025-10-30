import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useState } from 'react';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { Flex, Text, Box, Button } from '@backstage/ui';
import {
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions.ts';
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();
  const [isHover, setIsHover] = useState(false);
  function getButtonBackgroundColor(
    isSelected: boolean,
    type: UpdatedStatusEnumType,
  ) {
    if (isSelected) {
      if (type === UpdatedStatusEnum.VERY_OUTDATED) {
        return isHover ? '#E58869' : '#EBB095';
      }
      if (type === UpdatedStatusEnum.OUTDATED) {
        return isHover ? '#EBBE76' : '#FFDD9D';
      }
    }
    if (type === UpdatedStatusEnum.OUTDATED) {
      return theme.palette.mode === 'dark' ? 'transparent' : '#FFF7ED';
    }
    return theme.palette.mode === 'dark' ? 'transparent' : '#FCF1E8';
  }

  const actionsButtonStyle = {
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
        ? '1px solid #A32F00'
        : '1px solid #CF914A',
    color: 'white',
    backgroundColor: isHover
      ? getButtonBackgroundColor(true, props.type)
      : getButtonBackgroundColor(props.isSelected, props.type),
  };
  const actionsCountBoxStyle = {
    width: '26px',
    height: '26px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      props.type === UpdatedStatusEnum.VERY_OUTDATED ? '#F23131' : '#FF8B38',
  };
  return (
    <Button
      style={actionsButtonStyle}
      onClick={() => props.onToggle(props.type)}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <Box style={actionsCountBoxStyle}>
        <Text style={{ color: 'var(--bui-white)' }} weight="bold">
          {props.count}
        </Text>
      </Box>
      <Text
        weight="bold"
        style={{
          color:
            theme.palette.mode === 'dark' && !props.isSelected && !isHover
              ? 'var(--bui-white)'
              : 'var(--bui-black)',
        }}
      >
        {props.type === UpdatedStatusEnum.VERY_OUTDATED
          ? t('filterButton.veryOutdated')
          : t('filterButton.outdated')}
      </Text>
    </Button>
  );
}
