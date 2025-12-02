import { Action } from '../../utils/types.ts';
import { ActionRow } from './ActionRow.tsx';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { isToday } from '../../utils/date.ts';
import { ActionStatusOptions } from '../../utils/constants.ts';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { Flex, Text } from '@backstage/ui';
import Divider from '@mui/material/Divider';
import { useDebounce } from '../../utils/hooks.ts';
import { useBackstageContext } from '../../contexts/BackstageContext.tsx';
import { UpdatedStatusEnum } from '../../utils/utilityfunctions.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { getScenarioOfIdFromRiSc } from '../../utils/scenario.ts';
import styles from './ActionRowList.module.css';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

type ActionRowListProps = {
  scenarioId: string;
  displayedActions?: Action[]; // Specify if not every action of scenario is to be displayed
  allowDeletion?: boolean;
  allowEdit?: boolean;
};

export function ActionRowList(props: ActionRowListProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc } = useRiScs();
  const { submitEditedScenarioToRiSc } = useScenario();
  const { profileInfo } = useBackstageContext();
  const [pendingActionStatusUpdates, setPendingActionStatusUpdates] = useState<
    Record<string, Record<string, ActionStatusOptions>>
  >({});
  const [pendingActionUpdatesHistory, setPendingActionUpdatesHistory] =
    useState<string[]>([]);

  const onRefreshActionStatus = (action: Action) => {
    if (isToday(action.lastUpdated ?? null)) return;

    setPendingActionStatusUpdates(prev => ({
      ...prev,
      [props.scenarioId]: {
        ...prev[props.scenarioId],
        [action.ID]: action.status as ActionStatusOptions,
      },
    }));
    setPendingActionUpdatesHistory(prev => [...prev, action.ID]);
  };

  const onNewActionStatus = (
    actionId: string,
    newStatus: ActionStatusOptions,
  ) => {
    setPendingActionStatusUpdates(prev => ({
      ...prev,
      [props.scenarioId]: {
        ...prev[props.scenarioId],
        [actionId]: newStatus,
      },
    }));
    setPendingActionUpdatesHistory(prev => [...prev, actionId]);
  };

  const onDeleteAction = (actionId: string) => {
    const oldScenario = getScenarioOfIdFromRiSc(props.scenarioId, selectedRiSc);
    if (!oldScenario) return;
    const newScenario = {
      ...oldScenario,
      actions: oldScenario.actions.filter(a => a.ID !== actionId),
    };
    submitEditedScenarioToRiSc(newScenario);
  };

  const onSaveAction = (newAction: Action) => {
    const oldScenario = getScenarioOfIdFromRiSc(props.scenarioId, selectedRiSc);
    if (!oldScenario) return;
    submitEditedScenarioToRiSc(
      {
        ...oldScenario,
        actions: oldScenario.actions.map(a =>
          a.ID === newAction.ID ? newAction : a,
        ),
      },
      {
        profileInfo: profileInfo,
      },
    );
  };

  const debounceCallback = useCallback(
    (updates: Record<string, Record<string, ActionStatusOptions>>) => {
      if (Object.keys(updates).length === 0) return;

      Object.keys(updates).forEach(scenarioId => {
        const oldScenario = getScenarioOfIdFromRiSc(scenarioId, selectedRiSc);
        if (!oldScenario) return;
        const newActionArray = oldScenario.actions.map(a =>
          a.ID in updates[scenarioId]
            ? {
                ...a,
                status: updates[scenarioId][a.ID] ?? a.status,
              }
            : a,
        );

        const updatedScenario = {
          ...oldScenario,
          actions: newActionArray,
        };

        submitEditedScenarioToRiSc(updatedScenario, {
          idsOfActionsToForceUpdateLastUpdatedValue: Object.keys(
            updates[scenarioId],
          ),
          profileInfo: profileInfo,
          onSuccess: () => {
            setPendingActionStatusUpdates({});
          },
          onError: () => {
            // TODO: Should probably retry once before canceling updates
            setPendingActionStatusUpdates(prevStatusUpdates => {
              setPendingActionUpdatesHistory(prevHistory =>
                prevHistory.filter(actionId =>
                  Object.keys(prevStatusUpdates[scenarioId] ?? {}).includes(
                    actionId,
                  ),
                ),
              );
              return {};
            });
          },
        });
      });
    },
    [submitEditedScenarioToRiSc, profileInfo, selectedRiSc],
  );

  const { flush } = useDebounce<
    Record<string, Record<string, ActionStatusOptions>>
  >(pendingActionStatusUpdates, 6000, debounceCallback);

  const actions =
    props.displayedActions ??
    getScenarioOfIdFromRiSc(props.scenarioId, selectedRiSc)?.actions ??
    [];

  useEffect(() => {
    return () => {
      // flush on unmount. makes sure changes are saved
      flush();
    };
  }, [flush]);

  if (actions.length === 0) {
    return (
      <Flex align="center" direction="column">
        <Divider flexItem />
        <Text className={styles.noActionsText}>
          {t('scenarioTable.noActionsLong')}
        </Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column">
      <Divider />
      {actions.map((action, index) => (
        <Fragment key={`Action-${action.ID}-${index}`}>
          <ActionRow
            action={action}
            index={index}
            onRefreshActionStatus={onRefreshActionStatus}
            onNewActionStatus={onNewActionStatus}
            onDeleteAction={onDeleteAction}
            onSaveAction={onSaveAction}
            optimisticUpdatedStatus={
              pendingActionUpdatesHistory.includes(action.ID)
                ? UpdatedStatusEnum.UPDATED
                : undefined
            }
            optimisticStatus={
              pendingActionStatusUpdates[props.scenarioId]?.[action.ID]
            }
            allowDeletion={props.allowDeletion}
            allowEdit={props.allowEdit}
          />
          {index < actions.length - 1 && <Divider />}
        </Fragment>
      ))}
    </Flex>
  );
}
