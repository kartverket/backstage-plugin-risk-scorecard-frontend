import { Action, RiScStatus } from '../../utils/types.ts';
import { ActionRow } from './ActionRow.tsx';
import { Fragment } from 'react';
import { isToday } from '../../utils/date.ts';
import { ActionStatusOptions } from '../../utils/constants.ts';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { Flex, Text } from '@backstage/ui';
import Divider from '@mui/material/Divider';
import { useBackstageContext } from '../../contexts/BackstageContext.tsx';
import { UpdatedStatusEnumType } from '../../utils/utilityfunctions.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { getScenarioOfIdFromRiSc } from '../../utils/scenario.ts';
import styles from './ActionRowList.module.css';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { getUpdatedStatus } from '../../utils/actions.ts';

type ActionRowListProps = {
  scenarioId: string;
  displayedActions?: Action[];
  allowDeletion?: boolean;
  allowEdit?: boolean;
};

export function ActionRowList(props: ActionRowListProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc, showBlockedUpdateError } = useRiScs();
  const {
    submitEditedScenarioToRiSc,
    pendingActionStatusUpdates,
    pendingActionUpdatesHistory,
    onNewActionStatus,
    onRefreshActionStatus,
  } = useScenario();
  const { profileInfo } = useBackstageContext();

  const isRiScMarkedForDeletion =
    selectedRiSc?.status === RiScStatus.DeletionDraft ||
    selectedRiSc?.status === RiScStatus.DeletionSentForApproval;

  const handleRefreshActionStatus = (action: Action) => {
    if (isToday(action.lastUpdated ?? null)) return;
    onRefreshActionStatus(props.scenarioId, action);
  };

  const handleNewActionStatus = (
    actionId: string,
    newStatus: ActionStatusOptions,
  ) => {
    if (isRiScMarkedForDeletion) {
      showBlockedUpdateError();
      return;
    }
    onNewActionStatus(props.scenarioId, actionId, newStatus);
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

  const onSaveAction = (
    newAction: Action,
    setIsEditing?: (isEditing: boolean) => void,
  ) => {
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
        profileInfo,
        onSuccess: () => {
          if (setIsEditing) {
            setIsEditing(false);
          }
        },
      },
    );
  };

  const actions =
    props.displayedActions ??
    getScenarioOfIdFromRiSc(props.scenarioId, selectedRiSc)?.actions ??
    [];

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
      {actions.map((action, index) => {
        const updatedStatus = getUpdatedStatusOfAction(
          props.scenarioId,
          action,
          pendingActionStatusUpdates,
          pendingActionUpdatesHistory,
        );
        return (
          <Fragment key={`Action-${action.ID}-${index}`}>
            <ActionRow
              action={action}
              index={index}
              onRefreshActionStatus={handleRefreshActionStatus}
              onNewActionStatus={handleNewActionStatus}
              onDeleteAction={onDeleteAction}
              onSaveAction={onSaveAction}
              updatedStatus={updatedStatus}
              optimisticStatus={
                pendingActionStatusUpdates[props.scenarioId]?.[action.ID]
              }
              allowDeletion={props.allowDeletion}
              allowEdit={props.allowEdit}
            />
            <Divider />
          </Fragment>
        );
      })}
    </Flex>
  );
}

function getUpdatedStatusOfAction(
  scenarioId: string,
  action: Action,
  pendingActionStatusUpdates: Record<
    string,
    Record<string, ActionStatusOptions>
  >,
  pendingActionUpdatesHistory: string[],
) {
  const isActionUpdating =
    !!pendingActionStatusUpdates[scenarioId]?.[action.ID];

  let updatedStatus: UpdatedStatusEnumType | 'UPDATING' | 'NONE';
  if (isActionUpdating) {
    updatedStatus = 'UPDATING';
  } else {
    if (pendingActionUpdatesHistory.includes(action.ID)) {
      updatedStatus = 'UPDATED';
    } else {
      const baseStatus = getUpdatedStatus(action);
      updatedStatus = baseStatus === 'UPDATED' ? 'NONE' : baseStatus;
    }
  }
  return updatedStatus;
}
