import { Action, Scenario } from '../../utils/types.ts';
import { ActionRow } from './ActionRow.tsx';
import { useCallback, useState } from 'react';
import { isToday } from '../../utils/date.ts';
import { ActionStatusOptions } from '../../utils/constants.ts';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { Flex } from '@backstage/ui';
import Divider from '@mui/material/Divider';
import { useDebounce } from '../../utils/hooks.ts';
import { useBackstageContext } from '../../contexts/BackstageContext.tsx';
import { UpdatedStatusEnum } from '../../utils/utilityfunctions.ts';

type ActionRowListProps = {
  scenario: Scenario;
  displayedActions?: Action[]; // Specify if not every action of scenario is to be displayed
  allowDeletion?: boolean;
  allowEdit?: boolean;
};

export function ActionRowList(props: ActionRowListProps) {
  const { submitEditedScenarioToRiSc } = useScenario();
  const { profileInfo } = useBackstageContext();
  const [pendingActionStatusUpdates, setPendingActionStatusUpdates] = useState<
    Record<string, ActionStatusOptions>
  >({});
  const [pendingActionUpdatesHistory, setPendingActionUpdatesHistory] =
    useState<string[]>([]);

  const onRefreshActionStatus = (action: Action) => {
    if (isToday(action.lastUpdated ?? null)) return;

    setPendingActionStatusUpdates(prev => ({
      ...prev,
      [action.ID]: action.status as ActionStatusOptions,
    }));
    setPendingActionUpdatesHistory(prev => [...prev, action.ID]);
  };

  const onNewActionStatus = (
    actionId: string,
    newStatus: ActionStatusOptions,
  ) => {
    setPendingActionStatusUpdates(prev => ({
      ...prev,
      [actionId]: newStatus,
    }));
    setPendingActionUpdatesHistory(prev => [...prev, actionId]);
  };

  const onDeleteAction = (actionId: string) => {
    const newScenario = {
      ...props.scenario,
      actions: props.scenario.actions.filter(a => a.ID !== actionId),
    };
    submitEditedScenarioToRiSc(newScenario);
  };

  const onSaveAction = (newAction: Action) => {
    submitEditedScenarioToRiSc(
      {
        ...props.scenario,
        actions: props.scenario.actions.map(a =>
          a.ID === newAction.ID ? newAction : a,
        ),
      },
      {
        profileInfo: profileInfo,
      },
    );
  };

  const debounceCallback = useCallback(
    (updates: Record<string, ActionStatusOptions>) => {
      if (Object.keys(updates).length === 0) return;

      const newActionArray = props.scenario.actions.map(a =>
        a.ID in updates
          ? {
              ...a,
              status: pendingActionStatusUpdates[a.ID] ?? a.status,
            }
          : a,
      );

      const updatedScenario = {
        ...props.scenario,
        actions: newActionArray,
      };

      submitEditedScenarioToRiSc(updatedScenario, {
        idsOfActionsToForceUpdateLastUpdatedValue: Object.keys(updates),
        profileInfo: profileInfo,
        onSuccess: () => {
          setPendingActionStatusUpdates({});
        },
        onError: () => {
          // TODO: Should probably retry once before canceling updates
          setPendingActionStatusUpdates(prevStatusUpdates => {
            setPendingActionUpdatesHistory(prevHistory =>
              prevHistory.filter(actionId =>
                Object.keys(prevStatusUpdates).includes(actionId),
              ),
            );
            return {};
          });
        },
      });
    },
    [
      props.scenario,
      submitEditedScenarioToRiSc,
      pendingActionStatusUpdates,
      profileInfo,
    ],
  );

  useDebounce<Record<string, ActionStatusOptions>>( // TODO: Flush?
    pendingActionStatusUpdates,
    6000,
    debounceCallback,
  );

  const actions = props.displayedActions ?? props.scenario.actions ?? [];

  return (
    <Flex direction="column">
      <Divider />
      {actions.map((action, index) => (
        <>
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
            optimisticStatus={pendingActionStatusUpdates[action.ID]}
            allowDeletion={props.allowDeletion}
            allowEdit={props.allowEdit}
          />
          <Divider />
        </>
      ))}
    </Flex>
  );
}
