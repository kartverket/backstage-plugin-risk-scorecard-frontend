import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Edit } from '@mui/icons-material';
import { Flex, Text } from '@backstage/ui';
import UpdatedStatusBadge from '../common/UpdatedStatusBadge.tsx';
import { DualButtonWithMenu } from '../common/DualButtonWithMenu.tsx';
import {
  actionStatusOptionsToTranslationKeys,
  getTranslatedActionStatus,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions.ts';
import { ActionStatusOptions } from '../../utils/constants.ts';
import { ScenarioLastUpdatedLabel } from '../scenario/ScenarioLastUpdatedLabel.tsx';
import DeleteIcon from '@mui/icons-material/Delete';
import Collapse from '@mui/material/Collapse';
import { Markdown } from '../common/Markdown.tsx';
import { DeleteActionConfirmation } from '../scenarioDrawer/components/DeleteConfirmation.tsx';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { Action } from '../../utils/types.ts';
import { MouseEvent, useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { ActionEdit } from './ActionEdit.tsx';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { getUpdatedStatus } from '../../utils/actions.ts';
import { ActionURL } from './ActionURL.tsx';

export const getActionStatusButtonClass = (status: string): string => {
  switch (status) {
    case ActionStatusOptions.OK:
      return 'ros-button-green';
    case ActionStatusOptions.NotOK:
      return 'ros-button-red';
    default:
      return 'ros-button-gray';
  }
};

type ActionRowProps = {
  action: Action;
  onRefreshActionStatus: (action: Action) => void;
  onNewActionStatus: (actionId: string, newStatus: ActionStatusOptions) => void;
  onDeleteAction: (actionId: string) => void;
  onSaveAction: (newAction: Action) => void;
  allowDeletion?: boolean;
  allowEdit?: boolean;
  optimisticStatus?: ActionStatusOptions;
  optimisticUpdatedStatus?: UpdatedStatusEnumType;
  index?: number;
};

export function ActionRow(props: ActionRowProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc } = useRiScs();
  const updatedStatus = getUpdatedStatus(
    props.action,
    selectedRiSc?.lastPublished?.numberOfCommits ?? null,
  );

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { isActionExpanded, toggleActionExpanded } = useScenario();
  const isExpanded = isActionExpanded(props.action.ID);

  const [deleteActionConfirmationIsOpen, setDeleteActionConfirmationIsOpen] =
    useState(false);

  if (isEditing)
    return (
      <ActionEdit
        onSaveAction={(a: Action) => {
          props.onSaveAction(a);
          setIsEditing(false);
        }}
        onDeleteAction={props.onDeleteAction}
        onCancelEdit={() => setIsEditing(false)}
        action={props.action}
      />
    );

  return (
    <div key={props.action.ID}>
      <div
        onClick={(e: MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          toggleActionExpanded(props.action.ID);
        }}
        style={{ cursor: 'pointer' }}
      >
        <Flex align="center" gap="1" justify="between">
          <Flex align="center" justify="start">
            <IconButton
              onClick={e => {
                e.stopPropagation();
                toggleActionExpanded(props.action.ID);
              }}
            >
              {isExpanded ? (
                <i className="ri-arrow-up-s-line" />
              ) : (
                <i className="ri-arrow-down-s-line" />
              )}
            </IconButton>
            <Flex direction="column" gap="1">
              <UpdatedStatusBadge
                status={props.optimisticUpdatedStatus ?? updatedStatus}
                isPending={!!props.optimisticUpdatedStatus}
              />
              <Text variant="body-large">
                {props.action.title ??
                  `${t('dictionary.measure')} ${props.index ?? ''}`}
              </Text>
            </Flex>
          </Flex>
          <Flex align="center" justify="end">
            <DualButtonWithMenu
              propsCommon={{
                className: getActionStatusButtonClass(
                  props.optimisticStatus ?? props.action.status,
                ),
              }}
              propsLeft={{
                children: getTranslatedActionStatus(
                  props.optimisticStatus ?? props.action.status,
                  t,
                ),
              }}
              propsRight={{
                iconEnd: <i className="ri-loop-left-line" />,
                onClick: () => {
                  props.onRefreshActionStatus(props.action);
                },
              }}
              menuItems={Object.values(ActionStatusOptions).map(value => ({
                key: value,
                // @ts-ignore
                label: t(
                  actionStatusOptionsToTranslationKeys[
                    value as ActionStatusOptions
                  ],
                ),
                onClick: () => props.onNewActionStatus(props.action.ID, value),
                //selected: value === action.status, TODO: sjekk ut
                selected: props.optimisticStatus
                  ? value === props.optimisticStatus
                  : value === props.action.status,
              }))}
            />
            <ScenarioLastUpdatedLabel
              lastUpdated={
                !!props.optimisticStatus ? new Date() : props.action.lastUpdated
              }
              lastUpdatedBy={props.action.lastUpdatedBy}
            />
            {props.allowDeletion && (
              <IconButton
                onClick={() => setDeleteActionConfirmationIsOpen(true)}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Flex>
        </Flex>
      </div>
      <Collapse
        in={isExpanded}
        sx={{ marginTop: 1 }}
        timeout="auto"
        unmountOnExit
      >
        <Box ml="48px" mt="4" mb="2">
          <Flex justify="between" mt="8px" align="end">
            <Text as="p" variant="body-large" weight="bold">
              {t('dictionary.description')}
            </Text>
            {props.allowEdit && (
              <IconButton
                sx={{
                  marginLeft: 'auto',
                  transition: 'opacity 300ms ease-in',
                }}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit />
              </IconButton>
            )}
          </Flex>
          <Markdown description={props.action.description} />
          <ActionURL url={props.action.url} />
        </Box>
      </Collapse>
      <DeleteActionConfirmation
        isOpen={deleteActionConfirmationIsOpen}
        setIsOpen={setDeleteActionConfirmationIsOpen}
        onConfirm={() => props.onDeleteAction(props.action.ID)}
      />
    </div>
  );
}
