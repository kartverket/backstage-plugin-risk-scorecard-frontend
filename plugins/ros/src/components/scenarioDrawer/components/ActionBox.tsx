import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Edit, ExpandLess, ExpandMore } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
import { Action, FormScenario } from '../../../utils/types';
import {
  actionStatusOptionsToTranslationKeys,
  deleteAction,
} from '../../../utils/utilityfunctions';
import { Markdown } from '../../common/Markdown';
import { body2, emptyState, label } from '../../common/typography';
import { ActionFormItem } from './ActionFormItem';
import { DeleteActionConfirmation } from './DeleteConfirmation';

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

  const { updateStatus } = useRiScs();
  const { submitEditedScenarioToRiSc, mapFormScenarioToScenario, scenario } =
    useScenario();

  const isActionTitlePresent = action.title !== null && action.title !== '';

  /* @ts-ignore Because ts can't typecheck strings against our keys */
  const translatedActionStatus = t(
    actionStatusOptionsToTranslationKeys[action.status as ActionStatusOptions],
  );

  const isMounted = useIsMounted();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function handleDeleteAction(): void {
    setDeleteActionConfirmationIsOpen(true);
  }

  function confirmDeleteAction(): void {
    remove(index);
    deleteAction(remove, index, onSubmit);
    setDeleteActionConfirmationIsOpen(false);
  }

  function handleChipClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  async function handleStatusChange(newStatus: string) {
    const updatedScenario = {
      ...scenario,
      actions: scenario.actions.map(a =>
        a.ID === action.ID ? { ...a, status: newStatus } : a,
      ),
    };

    await submitEditedScenarioToRiSc(updatedScenario);

    if (isMounted()) {
      handleMenuClose();
    }
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
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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
        <IconButton
          disabled={isExpanded ? false : true}
          sx={{
            marginLeft: 'auto',
            opacity: isExpanded ? 1 : 0,
            transition: 'opacity 300ms ease-in',
          }}
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit />
        </IconButton>
        <Chip
          label={translatedActionStatus}
          sx={{
            margin: 0,
            backgroundColor:
              action.status === ActionStatusOptions.Completed
                ? { backgroundColor: '#6BC6A4' }
                : undefined,
          }}
          onClick={handleChipClick}
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
        <IconButton onClick={handleDeleteAction}>
          <DeleteIcon />
        </IconButton>
      </Box>
      <Collapse in={isExpanded}>
        <Typography sx={{ ...label, marginTop: 1 }}>
          {t('dictionary.description')}
        </Typography>
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
