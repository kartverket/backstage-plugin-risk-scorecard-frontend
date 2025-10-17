import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Box, Flex, Text } from '@backstage/ui';
import { Cached } from '@mui/icons-material';
import { Divider } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { useCallback, useEffect, useState } from 'react';
import DualButtonWithMenu from '../../components/common/DualButtonWithMenu';
import { useRiScs } from '../../contexts/RiScContext';
import { useScenario } from '../../contexts/ScenarioContext';
import { ActionStatusOptions } from '../../utils/constants';
import { useDebounce } from '../../utils/hooks';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { Action, RiScWithMetadata, Scenario } from '../../utils/types';
import {
  actionStatusOptionsToTranslationKeys,
  formatDate,
  getActionStatusColor,
  getActionStatusStyle,
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions';
import { Markdown } from '../common/Markdown';
import { body2 } from '../common/typography';

type ActionsCardProps = {
  filteredData: (Action & { updatedStatus: UpdatedStatusEnumType })[];
  scenario: Scenario;
  updateRiSc: (
    riSc: RiScWithMetadata,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;
};

export function ActionsCard(props: ActionsCardProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { filteredData, scenario, updateRiSc } = props;

  const [pendingUpdatedIDs, setPendingUpdatedIDs] = useState<string[]>([]);
  const [pendingStatusById, setPendingStatusById] = useState<
    Record<string, ActionStatusOptions>
  >({});
  const [pendingLastUpdatedById, setPendingLastUpdatedById] = useState<
    Record<string, Date>
  >({});

  const { selectedRiSc } = useRiScs();
  const { isActionExpanded, toggleActionExpanded } = useScenario();

  const debounceCallback = useCallback(
    (updatedIDs: string[]) => {
      if (!selectedRiSc) return;
      if (updatedIDs.length === 0) return;

      const updatedScenarios = selectedRiSc.content.scenarios.map(s => {
        if (s.ID !== scenario.ID) return s;

        const newActions = s.actions.map(a =>
          updatedIDs.includes(a.ID)
            ? {
                ...a,
                status: pendingStatusById[a.ID] ?? a.status,
                lastUpdated: pendingLastUpdatedById[a.ID] ?? new Date(),
              }
            : a,
        );

        return { ...s, actions: newActions };
      });

      const updatedRiSc: RiScWithMetadata = {
        ...selectedRiSc,
        content: {
          ...selectedRiSc.content,
          scenarios: updatedScenarios,
        },
      };

      updateRiSc(updatedRiSc);

      setPendingUpdatedIDs([]);
    },
    [
      selectedRiSc,
      scenario.ID,
      updateRiSc,
      pendingStatusById,
      pendingLastUpdatedById,
    ],
  );

  const { flush } = useDebounce(pendingUpdatedIDs, 6000, debounceCallback);

  useEffect(() => {
    return () => flush();
  }, [flush]);

  function handleStatusChange(
    actionID: string,
    newStatus: ActionStatusOptions,
  ) {
    setPendingStatusById(prev => ({ ...prev, [actionID]: newStatus }));
    setPendingLastUpdatedById(prev => ({ ...prev, [actionID]: new Date() }));
    setPendingUpdatedIDs(prev =>
      prev.includes(actionID) ? prev : [...prev, actionID],
    );
  }

  function getUpdatedStatusStyle(
    status: UpdatedStatusEnumType | null | undefined,
  ) {
    const base: React.CSSProperties = {
      padding: '4px 0',
      borderRadius: '24px',
    };

    if (status === UpdatedStatusEnum.VERY_OUTDATED) {
      return {
        ...base,
        backgroundColor: '#FFE2D4',
        border: '1px solid #F23131',
      };
    }

    if (status === UpdatedStatusEnum.OUTDATED) {
      return {
        ...base,
        backgroundColor: '#FCEBCD',
        border: '1px solid #FF8B38',
      };
    }

    return base;
  }

  return (
    <>
      <Divider sx={{ marginBottom: '16px' }} />
      {filteredData.map((action, idx) => {
        const isPending =
          pendingUpdatedIDs.includes(action.ID) ||
          !!pendingLastUpdatedById[action.ID];
        const isExpanded = isActionExpanded(action.ID);
        const isLast = idx === filteredData.length - 1;

        return (
          <div key={action.ID}>
            <Flex align="center" justify="between" gap="1">
              <Flex align="center">
                <IconButton
                  onClick={e => {
                    e.stopPropagation();
                    toggleActionExpanded(action.ID);
                  }}
                >
                  {isExpanded ? (
                    <i className="ri-arrow-up-s-line" />
                  ) : (
                    <i className="ri-arrow-down-s-line" />
                  )}
                </IconButton>
                <Flex direction="column" align="start" gap="1">
                  {!isPending && (
                    <span
                      style={{
                        ...getUpdatedStatusStyle(action.updatedStatus),
                      }}
                    >
                      <Text
                        as="p"
                        style={{
                          padding: '0 8px',
                          color: 'var(--bui-black)',
                        }}
                      >
                        {action.updatedStatus ===
                        UpdatedStatusEnum.VERY_OUTDATED
                          ? t('rosStatus.veryOutdated')
                          : t('rosStatus.outdated')}
                      </Text>
                    </span>
                  )}
                  <Text as="p" variant="body-large">
                    {action.title}
                  </Text>
                </Flex>
              </Flex>
              <Flex>
                <DualButtonWithMenu
                  propsCommon={{
                    color: getActionStatusColor(
                      (pendingStatusById[action.ID] ?? action.status) as any,
                    ),
                    style: getActionStatusStyle(
                      (pendingStatusById[action.ID] ?? action.status) as any,
                    ),
                  }}
                  propsLeft={{
                    // @ts-ignore: mapping dynamic keys for translations
                    children: t(
                      actionStatusOptionsToTranslationKeys[
                        (pendingStatusById[action.ID] ??
                          action.status) as ActionStatusOptions
                      ],
                    ),
                  }}
                  propsRight={{
                    startIcon: <Cached />,
                    sx: { padding: '0 0 0 10px', minWidth: '30px' },
                    onClick: () => {
                      setPendingLastUpdatedById(prev => ({
                        ...prev,
                        [action.ID]: new Date(),
                      }));
                      setPendingUpdatedIDs(prev =>
                        prev.includes(action.ID) ? prev : [...prev, action.ID],
                      );
                    },
                  }}
                  menuItems={Object.values(ActionStatusOptions).map(value => ({
                    key: value,
                    // @ts-ignore: mapping dynamic keys for translations
                    label: t(
                      actionStatusOptionsToTranslationKeys[
                        value as ActionStatusOptions
                      ],
                    ),
                    onClick: () =>
                      handleStatusChange(
                        action.ID,
                        value as ActionStatusOptions,
                      ),
                    selected:
                      value === (pendingStatusById[action.ID] ?? action.status),
                  }))}
                />
                {t('scenarioDrawer.action.lastUpdated')}
                <br />
                {(() => {
                  const last =
                    pendingLastUpdatedById[action.ID] ?? action.lastUpdated;
                  return last
                    ? formatDate(last)
                    : t('scenarioDrawer.action.notUpdated');
                })()}
              </Flex>
            </Flex>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box ml="48px" mt="4" mb="2">
                <Text
                  as="p"
                  variant="body-large"
                  style={{ marginTop: 1, fontWeight: 700 }}
                >
                  {t('dictionary.description')}
                </Text>
                <Markdown description={action.description} />

                <Box mt="16px">
                  <Text
                    style={{
                      fontWeight: 700,
                      fontSize: '14px',
                      lineHeight: '20px',
                    }}
                  >
                    {t('dictionary.url')}
                  </Text>
                  {action.url ? (
                    <Link
                      sx={{ ...body2, marginTop: 0 }}
                      target="_blank"
                      rel="noreferrer"
                      href={
                        action.url.startsWith('http')
                          ? action.url
                          : `//${action.url}`
                      }
                    >
                      {action.url}
                    </Link>
                  ) : (
                    <Text
                      as="p"
                      variant="body-large"
                      style={{ fontStyle: 'italic' }}
                    >
                      {t('dictionary.emptyField', {
                        field: t('dictionary.url').toLowerCase(),
                      })}
                    </Text>
                  )}
                </Box>
              </Box>
            </Collapse>
            {!isLast && <Divider sx={{ my: 2 }} />}
          </div>
        );
      })}
    </>
  );
}

export default ActionsCard;
