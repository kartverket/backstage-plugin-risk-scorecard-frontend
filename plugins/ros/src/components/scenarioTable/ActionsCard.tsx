import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Box, Flex, Text } from '@backstage/ui';
import { Divider } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import {
  useCallback,
  useEffect,
  useState,
  KeyboardEvent,
  MouseEvent,
} from 'react';
import { DualButtonWithMenu } from '../../components/common/DualButtonWithMenu';
import { useScenario } from '../../contexts/ScenarioContext';
import { ActionStatusOptions } from '../../utils/constants';
import { useDebounce } from '../../utils/hooks';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { Action, Scenario } from '../../utils/types';
import {
  actionStatusOptionsToTranslationKeys,
  UpdatedStatusEnum,
  getActionStatusButtonClass,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions';
import { Markdown } from '../common/Markdown';
import { body2 } from '../common/typography';
import { useBackstageContext } from '../../contexts/BackstageContext.tsx';
import { ScenarioLastUpdatedLabel } from '../scenario/ScenarioLastUpdatedLabel.tsx';

type ActionsCardProps = {
  filteredData: (Action & { updatedStatus: UpdatedStatusEnumType })[];
  scenario: Scenario;
  showUpdatedBadge?: boolean;
};

export function ActionsCard(props: ActionsCardProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { profileInfo } = useBackstageContext();

  const { filteredData, scenario, showUpdatedBadge } = props;

  const [pendingUpdatedIDs, setPendingUpdatedIDs] = useState<string[]>([]);
  const [pendingStatusById, setPendingStatusById] = useState<
    Record<string, ActionStatusOptions>
  >({});

  const { isActionExpanded, toggleActionExpanded, submitEditedScenarioToRiSc } =
    useScenario();

  const debounceCallback = useCallback(
    (updatedIDs: string[]) => {
      if (updatedIDs.length === 0) return;

      const updatedScenario = {
        ...scenario,
        actions: scenario.actions.map(a =>
          updatedIDs.includes(a.ID)
            ? {
                ...a,
                status: pendingStatusById[a.ID] ?? a.status,
              }
            : a,
        ),
      };

      submitEditedScenarioToRiSc(updatedScenario, {
        idsOfActionsToForceUpdateLastUpdatedValue: updatedIDs,
        profileInfo: profileInfo,
      });
      setPendingUpdatedIDs([]);
    },
    [scenario, submitEditedScenarioToRiSc, pendingStatusById],
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
        backgroundColor: 'var(--red-200)',
        border: '1px solid var(--red-500)',
      };
    }

    if (status === UpdatedStatusEnum.OUTDATED) {
      return {
        ...base,
        backgroundColor: 'var(--orange-100)',
        border: '1px solid var(--orange-300)',
      };
    }
    return base;
  }

  const statusBadgeStyle = {
    padding: '0 8px',
    fontSize: '12px',
    color: 'var(--bui-black)',
  };

  return (
    <>
      <Divider sx={{ marginBottom: '16px' }} />
      {filteredData.map((action, idx) => {
        const isPending = pendingStatusById[action.ID] !== undefined;
        const isExpanded = isActionExpanded(action.ID);
        const isLast = idx === filteredData.length - 1;

        return (
          <div key={action.ID}>
            <div
              role="button"
              tabIndex={0}
              onClick={(e: MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();

                const target = e.target as HTMLElement | null;
                if (target && target.closest('[data-no-row-toggle]')) return;

                toggleActionExpanded(action.ID);
              }}
              onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                // Prevent keyboard event from bubbling up to parent(s)
                e.stopPropagation();

                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleActionExpanded(action.ID);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
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
                        <Text as="p" style={statusBadgeStyle}>
                          {(action.updatedStatus ===
                            UpdatedStatusEnum.VERY_OUTDATED &&
                            t('rosStatus.veryOutdated')) ||
                            (action.updatedStatus ===
                              UpdatedStatusEnum.OUTDATED &&
                              t('rosStatus.outdated')) ||
                            null}
                        </Text>
                      </span>
                    )}
                    {showUpdatedBadge && isPending && (
                      <span
                        style={{
                          padding: '4px 0',
                          backgroundColor: '#D0ECD6',
                          border: '1px solid #156630',
                          borderRadius: '24px',
                        }}
                      >
                        <Text style={statusBadgeStyle}>
                          {t('rosStatus.updated')}
                        </Text>
                      </span>
                    )}
                    <Text as="p" variant="body-large">
                      {action.title}
                    </Text>
                  </Flex>
                </Flex>
                <Flex>
                  <span
                    data-no-row-toggle
                    role="button"
                    tabIndex={0}
                    style={{ display: 'inline-block' }}
                    onClick={(e: MouseEvent<HTMLSpanElement>) =>
                      e.stopPropagation()
                    }
                    onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) => {
                      e.stopPropagation();
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                      }
                    }}
                  >
                    <DualButtonWithMenu
                      propsCommon={{
                        className: getActionStatusButtonClass(
                          (pendingStatusById[action.ID] ??
                            action.status) as any,
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
                        iconEnd: <i className="ri-loop-left-line" />,
                        onClick: () => {
                          handleStatusChange(
                            action.ID,
                            action.status as ActionStatusOptions,
                          );
                        },
                      }}
                      menuItems={Object.values(ActionStatusOptions).map(
                        value => ({
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
                            value ===
                            (pendingStatusById[action.ID] ?? action.status),
                        }),
                      )}
                    />
                  </span>
                  <ScenarioLastUpdatedLabel
                    lastUpdated={
                      action.ID in pendingStatusById ? new Date() : undefined
                    }
                    lastUpdatedBy={action.lastUpdatedBy}
                  />
                </Flex>
              </Flex>
            </div>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <div
                data-action-collapse
                role="presentation"
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                  }
                }}
              >
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
              </div>
            </Collapse>
            {!isLast && <Divider sx={{ my: 2 }} />}
          </div>
        );
      })}
    </>
  );
}
