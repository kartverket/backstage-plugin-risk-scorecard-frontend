import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Edit, ExpandLess, ExpandMore } from '@mui/icons-material';
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
import Link from '@mui/material/Link';
import { body2 } from '../common/typography.ts';
import { DeleteActionConfirmation } from '../scenarioDrawer/components/DeleteConfirmation.tsx';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { Action } from '../../utils/types.ts';
import { useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { ActionEdit } from './ActionEdit.tsx';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { getUpdatedStatus } from '../../utils/actions.ts';

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
  console.log(updatedStatus);
  console.log(selectedRiSc?.lastPublished?.numberOfCommits ?? null);

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
      <Flex align="center" gap="1">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            cursor: 'pointer',
            width: '100%',
          }}
          onClick={() => toggleActionExpanded(props.action.ID)}
        >
          <IconButton>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <Flex direction="column" align="start" gap="1">
            <UpdatedStatusBadge
              status={props.optimisticUpdatedStatus ?? updatedStatus}
              isPending={!!props.optimisticUpdatedStatus}
            />
            <Text variant="body-large">
              {props.action.title ??
                `${t('dictionary.measure')} ${props.index ?? ''}`}
            </Text>
          </Flex>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center',
          }}
        >
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
        </Box>
        {props.allowDeletion && (
          <IconButton onClick={() => setDeleteActionConfirmationIsOpen(true)}>
            <DeleteIcon />
          </IconButton>
        )}
      </Flex>
      <Collapse in={isExpanded} sx={{ marginTop: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text
            variant="body-medium"
            weight="bold"
            style={{ paddingBottom: '0.4rem', marginTop: '4px' }}
          >
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
        </Box>
        <Markdown description={props.action.description} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
            marginTop: '16px',
          }}
        >
          <Box>
            <Text
              variant="body-medium"
              weight="bold"
              style={{ paddingBottom: '0.4rem', marginTop: '4px' }}
            >
              {' '}
              {t('dictionary.url')}
            </Text>
            {props.action.url ? (
              <Link
                sx={{
                  ...body2,
                  wordBreak: 'break-all',
                }}
                target="_blank"
                rel="noreferrer"
                href={
                  props.action.url.startsWith('http')
                    ? props.action.url
                    : `//${props.action.url}`
                }
              >
                {props.action.url}
              </Link>
            ) : (
              <Text as="p" variant="body-large" style={{ fontStyle: 'italic' }}>
                {t('dictionary.emptyField', {
                  field: t('dictionary.url').toLowerCase(),
                })}
              </Text>
            )}
          </Box>
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
