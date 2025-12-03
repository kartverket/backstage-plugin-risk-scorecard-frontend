import { Flex, Text } from '@backstage/ui';
import IconButton from '@mui/material/IconButton';
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
import Box from '@mui/material/Box';
import { Edit } from '@mui/icons-material';
import { Markdown } from '../common/Markdown.tsx';
import { ActionURL } from './ActionURL.tsx';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { Action } from '../../utils/types.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { getUpdatedStatus } from '../../utils/actions.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

type ActionViewProps = {
  action: Action;
  onRefreshActionStatus: (action: Action) => void;
  onNewActionStatus: (actionId: string, newStatus: ActionStatusOptions) => void;
  toggleEditMode: () => void;
  openDeleteDialog: () => void;
  allowDeletion?: boolean;
  allowEdit?: boolean;
  optimisticStatus?: ActionStatusOptions;
  optimisticUpdatedStatus?: UpdatedStatusEnumType;
  index?: number;
};

const getActionStatusButtonClass = (status: string): string => {
  switch (status) {
    case ActionStatusOptions.OK:
      return 'ros-button-green';
    case ActionStatusOptions.NotOK:
      return 'ros-button-red';
    default:
      return 'ros-button-gray';
  }
};

export function ActionView(props: ActionViewProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { isActionExpanded, toggleActionExpanded } = useScenario();
  const isExpanded = isActionExpanded(props.action.ID);

  const { selectedRiSc } = useRiScs();
  const updatedStatus = getUpdatedStatus(
    props.action,
    selectedRiSc?.lastPublished?.numberOfCommits ?? null,
  );

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={e => {
          e.stopPropagation();

          const target = e.target as HTMLElement | null;
          if (target && target.closest('[data-no-row-toggle]')) return;

          toggleActionExpanded(props.action.ID);
        }}
        onKeyDown={e => {
          // Prevent keyboard event from bubbling up to parent(s)
          e.stopPropagation();

          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleActionExpanded(props.action.ID);
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <Flex align="center" gap="1" justify="between">
          <Flex align="center" justify="start" style={{ width: '40%' }}>
            <IconButton
              onClick={e => {
                e.stopPropagation();
                toggleActionExpanded(props.action.ID);
              }}
            >
              <i
                className={`ri-arrow-${isExpanded ? 'down' : 'right'}-s-line`}
              />
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
                onClick={e => {
                  e.stopPropagation();
                  props.openDeleteDialog();
                }}
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
        <Box ml="56px" mt="4" mb="2">
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
                onClick={e => {
                  e.stopPropagation();
                  props.toggleEditMode();
                }}
              >
                <Edit />
              </IconButton>
            )}
          </Flex>
          <Markdown description={props.action.description} />
          <ActionURL url={props.action.url} />
        </Box>
      </Collapse>
    </>
  );
}
