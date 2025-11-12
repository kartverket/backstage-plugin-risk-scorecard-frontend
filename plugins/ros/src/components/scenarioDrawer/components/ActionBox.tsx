import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Edit, ExpandLess, ExpandMore } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import { DualButtonWithMenu } from '../../common/DualButtonWithMenu';
import { useState } from 'react';
import { UseFieldArrayRemove, UseFormReturn } from 'react-hook-form';
import { useRiScs } from '../../../contexts/RiScContext';
import { useScenario } from '../../../contexts/ScenarioContext';
import { ActionStatusOptions } from '../../../utils/constants';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { Action, FormScenario } from '../../../utils/types';
import {
  actionStatusOptionsToTranslationKeys,
  calculateDaysSince,
  calculateUpdatedStatus,
  deleteAction,
  formatDate,
  getTranslatedActionStatus,
  getActionStatusButtonClass,
} from '../../../utils/utilityfunctions';
import { Markdown } from '../../common/Markdown';
import { body2 } from '../../common/typography';
import UpdatedStatusBadge from '../../common/UpdatedStatusBadge';
import { ActionFormItem } from './ActionFormItem';
import { DeleteActionConfirmation } from './DeleteConfirmation';
import { Text, Flex } from '@backstage/ui';

interface ActionBoxProps {
  action: Action;
  index: number;
  formMethods: UseFormReturn<FormScenario>;
  remove: UseFieldArrayRemove;
  onSubmit: () => void;
  setCurrentUpdatedActionIDs: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ActionBox({
  action,
  index,
  formMethods,
  remove,
  onSubmit,
  setCurrentUpdatedActionIDs,
}: ActionBoxProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { isActionExpanded, toggleActionExpanded } = useScenario();
  const isExpanded = isActionExpanded(action.ID);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [deleteActionConfirmationIsOpen, setDeleteActionConfirmationIsOpen] =
    useState(false);
  const [isActionUpdated, setIsActionUpdated] = useState(false);

  const { updateStatus, selectedRiSc } = useRiScs();

  const { submitEditedScenarioToRiSc, mapFormScenarioToScenario, scenario } =
    useScenario();

  const isActionTitlePresent = action.title !== null && action.title !== '';

  /* @ts-ignore Because ts can't typecheck strings against our keys */
  const translatedActionStatus = getTranslatedActionStatus(action.status, t);

  function handleDeleteAction(): void {
    setDeleteActionConfirmationIsOpen(true);
  }

  function confirmDeleteAction(): void {
    deleteAction(remove, index, onSubmit);
    setDeleteActionConfirmationIsOpen(false);
  }

  function getParsedDateTime(): string {
    if (isActionUpdated) return formatDate(new Date());
    if (action.lastUpdated) return formatDate(action.lastUpdated);
    return t('scenarioDrawer.action.notUpdated');
  }
  const parsedDateTime = getParsedDateTime();

  let daysSinceLastUpdate: number | null = null;
  if (isActionUpdated) {
    daysSinceLastUpdate = calculateDaysSince(new Date());
  } else if (action.lastUpdated) {
    daysSinceLastUpdate = calculateDaysSince(new Date(action.lastUpdated));
  }

  const computedUpdatedStatus = calculateUpdatedStatus(
    daysSinceLastUpdate,
    selectedRiSc?.lastPublished?.numberOfCommits || null,
  );

  function updateActionInScenario(updates: ActionStatusOptions) {
    const actionIndex = scenario.actions.findIndex(a => a.ID === action.ID);
    const currentStatus =
      formMethods.getValues()?.actions?.[actionIndex]?.status;

    if (updates === currentStatus) {
      return;
    }

    formMethods.setValue(`actions.${index}.status`, updates);
    setCurrentUpdatedActionIDs(prev =>
      prev.includes(action.ID) ? prev : [...prev, action.ID],
    );
    setIsActionUpdated(true);
  }

  function handleStatusChange(newStatus: ActionStatusOptions) {
    updateActionInScenario(newStatus);
  }

  function isToday(lastUpdated: Date | null): boolean {
    const today = new Date();

    if (!lastUpdated) return false;
    const lastUpdatedParsed =
      typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;

    return (
      lastUpdatedParsed.getDate() === today.getDate() &&
      lastUpdatedParsed.getMonth() === today.getMonth() &&
      lastUpdatedParsed.getFullYear() === today.getFullYear()
    );
  }

  if (isEditing) {
    return (
      <>
        <ActionFormItem
          formMethods={formMethods}
          index={index}
          handleDelete={handleDeleteAction}
          showTitleNumber={false}
          remove={remove}
        />
        <Box display="flex" gap={1}>
          <Button
            color="primary"
            variant="contained"
            onClick={formMethods.handleSubmit((data: FormScenario) => {
              submitEditedScenarioToRiSc(mapFormScenarioToScenario(data));
              setIsEditing(false);
            })}
            disabled={!formMethods.formState.isDirty || updateStatus.isLoading}
          >
            {t('dictionary.save')}
            {updateStatus.isLoading && (
              <CircularProgress
                size={16}
                sx={{ marginLeft: 8, color: 'inherit' }}
              />
            )}
          </Button>

          <Button onClick={() => setIsEditing(false)}>
            {t('dictionary.cancel')}
          </Button>
        </Box>
      </>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            cursor: 'pointer',
            width: '100%',
          }}
          onClick={() => toggleActionExpanded(action.ID)}
        >
          <IconButton>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <Flex direction="column" align="start" gap="1">
            <UpdatedStatusBadge
              status={computedUpdatedStatus}
              isPending={isActionUpdated}
            />
            <Text variant="body-large">
              {isActionTitlePresent
                ? action.title
                : `${t('dictionary.measure')} ${index + 1}`}
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
              className: getActionStatusButtonClass(action.status),
            }}
            propsLeft={{
              children: translatedActionStatus,
            }}
            propsRight={{
              iconEnd: <i className="ri-loop-left-line" />,
              onClick: () => {
                if (isToday(action.lastUpdated ?? null)) return;
                setIsActionUpdated(true);
                setCurrentUpdatedActionIDs(prev =>
                  prev.includes(action.ID) ? prev : [...prev, action.ID],
                );
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
              onClick: () => handleStatusChange(value as ActionStatusOptions),
              selected: value === action.status,
            }))}
          />
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Text as="p" variant="body-large">
              {t('scenarioDrawer.action.lastUpdated')}
            </Text>
            <Text variant="body-large">{parsedDateTime}</Text>
          </Box>
        </Box>
        <IconButton onClick={handleDeleteAction}>
          <DeleteIcon />
        </IconButton>
      </Box>

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
          <IconButton
            sx={{
              marginLeft: 'auto',
              transition: 'opacity 300ms ease-in',
            }}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit />
          </IconButton>
        </Box>
        <Markdown description={action.description} />

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
            {action.url ? (
              <Link
                sx={{
                  ...body2,
                  wordBreak: 'break-all',
                }}
                target="_blank"
                rel="noreferrer"
                href={
                  action.url.startsWith('http') ? action.url : `//${action.url}`
                }
              >
                {action.url}
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
        onConfirm={confirmDeleteAction}
      />
    </Box>
  );
}
