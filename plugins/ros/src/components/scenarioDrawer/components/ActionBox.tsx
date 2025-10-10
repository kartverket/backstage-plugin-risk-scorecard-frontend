import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  Cached,
  Edit,
  ExpandLess,
  ExpandMore,
  PriorityHigh,
} from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import DualButtonWithMenu from '../../common/DualButtonWithMenu';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { UseFieldArrayRemove, UseFormReturn } from 'react-hook-form';
import { useRiScs } from '../../../contexts/RiScContext';
import { useScenario } from '../../../contexts/ScenarioContext';
import { ActionStatusOptions } from '../../../utils/constants';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { Action, FormScenario, LastPublished } from '../../../utils/types';
import {
  actionStatusOptionsToTranslationKeys,
  calculateDaysSince,
  calculateUpdatedStatus,
  deleteAction,
  formatDate,
  UpdatedStatusEnum,
  getTranslatedActionStatus,
  getActionStatusColor,
  getActionStatusStyle,
} from '../../../utils/utilityfunctions';
import { Markdown } from '../../common/Markdown';
import { body2, emptyState, label } from '../../common/typography';
import { ActionFormItem } from './ActionFormItem';
import { DeleteActionConfirmation } from './DeleteConfirmation';
import { Tooltip } from '@material-ui/core';

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

  const parsedDateTime = action.lastUpdated
    ? formatDate(action.lastUpdated)
    : t('scenarioDrawer.action.notUpdated');

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
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            {isActionTitlePresent
              ? action.title
              : `${t('dictionary.measure')} ${index + 1}`}
          </Typography>
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
              color: getActionStatusColor(action.status),
              style: getActionStatusStyle(action.status),
            }}
            propsLeft={{
              children: translatedActionStatus,
            }}
            propsRight={{
              startIcon: <Cached />,
              sx: { padding: '0 0 0 10px', minWidth: '30px' },
              onClick: () => {
                if (isToday(action.lastUpdated ?? null)) return;
                formMethods.setValue(
                  `actions.${index}.lastUpdated`,
                  new Date(),
                );
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
            <Typography>{t('scenarioDrawer.action.lastUpdated')}</Typography>
            <Typography>{parsedDateTime}</Typography>
          </Box>
          <Exclamations
            action={action}
            lastPublished={selectedRiSc?.lastPublished}
          />
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
          <Typography sx={{ ...label, marginTop: 1 }}>
            {t('dictionary.description')}
          </Typography>
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
            <Typography sx={label}>{t('dictionary.url')}</Typography>
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
              <Typography sx={emptyState}>
                {t('dictionary.emptyField', {
                  field: t('dictionary.url').toLowerCase(),
                })}
              </Typography>
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

function Exclamations({
  action,
  lastPublished,
}: {
  action: Action;
  lastPublished?: LastPublished;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const daysSinceLastUpdate = action.lastUpdated
    ? calculateDaysSince(new Date(action.lastUpdated))
    : null;
  const status = calculateUpdatedStatus(
    daysSinceLastUpdate,
    lastPublished?.numberOfCommits || null,
  );

  switch (status) {
    case UpdatedStatusEnum.VERY_OUTDATED:
      return (
        <Tooltip title={t('rosStatus.updatedStatus.tooltip.VERY_OUTDATED')}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              color: '#FF4444',
            }}
          >
            <PriorityHigh sx={{ marginRight: '-6px', marginLeft: '-6px' }} />
            <PriorityHigh sx={{ marginRight: '-6px', marginLeft: '-6px' }} />
          </Box>
        </Tooltip>
      );
    case UpdatedStatusEnum.OUTDATED:
      return (
        <Tooltip title={t('rosStatus.updatedStatus.tooltip.OUTDATED')}>
          <Box sx={{ color: '#FF8B38', minWidth: '24px', textAlign: 'right' }}>
            <PriorityHigh sx={{ marginRight: '-6px', marginLeft: '-6px' }} />
          </Box>
        </Tooltip>
      );
    case UpdatedStatusEnum.UPDATED:
    case UpdatedStatusEnum.LITTLE_OUTDATED:
      return <Box sx={{ minWidth: '24px' }} />;
    default:
      return null;
  }
}
