import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { Flex } from '@backstage/ui';

type OutdatedActionsCountsProps = {
  veryOutdatedCount: number;
  outdatedCount: number;
};
export function OutdatedActionsCounts(props: OutdatedActionsCountsProps) {
  return (
    <Flex>
      {props.veryOutdatedCount > 0 && (
        <OutdatedActionsBadge
          type="veryOutdated"
          count={props.veryOutdatedCount}
        />
      )}
      {props.outdatedCount > 0 && (
        <OutdatedActionsBadge type="outdated" count={props.outdatedCount} />
      )}
    </Flex>
  );
}

type OutdatedActionsBadgeProps = {
  type: 'outdated' | 'veryOutdated';
  count: number;
};

function OutdatedActionsBadge(props: OutdatedActionsBadgeProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const filterBoxStyle = {
    fontSize: '15px',
    fontWeight: 500,
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '8px',
    paddingLeft: '20px',
    paddingBottom: '8px',
    paddingRight: '20px',
    borderRadius: '24px',
    opacity: 1,
    transform: 'rotate(0deg)',
    width: 'auto',
    backgroundColor: props.type === 'veryOutdated' ? '#FFE2D4' : '#FCEBCD',
  };
  const filterSpanStyle = {
    fontSize: '15px',
    width: '26px',
    height: '26px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
    transform: 'rotate(0deg)',
    color: 'white',
    backgroundColor: props.type === 'veryOutdated' ? '#F23131' : '#FF8B38',
  };
  return (
    <div style={filterBoxStyle}>
      <span style={filterSpanStyle}>{props.count}</span>
      {props.type === 'veryOutdated'
        ? t('filterButton.veryOutdated')
        : t('filterButton.outdated')}
    </div>
  );
}
