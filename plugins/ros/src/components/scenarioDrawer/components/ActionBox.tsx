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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { UseFieldArrayRemove, UseFormReturn } from 'react-hook-form';
import { useRiScs } from '../../../contexts/RiScContext';
import { useScenario } from '../../../contexts/ScenarioContext';
import { ActionStatusOptions } from '../../../utils/constants';
import { useIsMounted } from '../../../utils/hooks';
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
} from '../../../utils/utilityfunctions';
import { Markdown } from '../../common/Markdown';
import { body2, emptyState, label } from '../../common/typography';
import { ActionFormItem } from './ActionFormItem';
import { DeleteActionConfirmation } from './DeleteConfirmation';
import { DualButton } from '../../common/DualButton';
import { Tooltip } from '@material-ui/core';

interface ActionBoxProps {
  action: Action;
  index: number;
  formMethods: UseFormReturn<FormScenario>;
  remove: UseFieldArrayRemove;
  onSubmit: () => void;
}

export function ActionBox({
  action,
  index,
  formMethods,
  remove,
  onSubmit,
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

  const isMounted = useIsMounted();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function handleDeleteAction(): void {
    setDeleteActionConfirmationIsOpen(true);
  }

  function confirmDeleteAction(): void {
    deleteAction(remove, index, onSubmit);
    setDeleteActionConfirmationIsOpen(false);
  }

  function handleChipClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  const parsedDateTime = action.lastUpdated
    ? formatDate(action.lastUpdated)
    : t('scenarioDrawer.action.notUpdated');

  function updateActionInScenario(updates: Partial<Action>) {
    const updatedScenario = {
      ...scenario,
      actions: scenario.actions.map(a =>
        a.ID === action.ID ? { ...a, ...updates, lastUpdated: new Date() } : a,
      ),
    };

    submitEditedScenarioToRiSc(updatedScenario);
    if (isMounted()) handleMenuClose();
  }

  function handleStatusChange(newStatus: string) {
    updateActionInScenario({ status: newStatus });
  }

  function refreshStatus() {
    if (isSameDay()) return;
    updateActionInScenario({});
  }

  function isSameDay(): boolean {
    const currentAction = scenario.actions.find(a => a.ID === action.ID);
    const lastUpdated = currentAction?.lastUpdated;
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

  useEffect(() => () => setAnchorEl(null), []);

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
            <DualButton
                propsCommon={{
                    color: (() => {
                        switch (action.status) {
                            case ActionStatusOptions.OK: return 'success';
                            case ActionStatusOptions.NotOK: return 'error';
                            default: return 'inherit';
                        }
                    })(),
                }}
            propsLeft={{
              children: translatedActionStatus,
              onClick: handleChipClick,
            }}
            propsRight={{
              startIcon: <Cached />,
              sx: { padding: '0 0 0 10px', minWidth: '30px' },
              onClick: () => refreshStatus(),
            }}
          />
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
          >
            {Object.values(ActionStatusOptions).map(value => (
              <MenuItem key={value} onClick={() => handleStatusChange(value)}>
                {
                  /* @ts-ignore Because ts can't typecheck strings against our keys */
                  t(
                    actionStatusOptionsToTranslationKeys[
                      value as ActionStatusOptions
                    ],
                  )
                }
              </MenuItem>
            ))}
          </Menu>
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
    case (UpdatedStatusEnum.UPDATED, UpdatedStatusEnum.LITTLE_OUTDATED):
      return <Box sx={{ minWidth: '24px' }} />;
    default:
      return null;
  }
}
