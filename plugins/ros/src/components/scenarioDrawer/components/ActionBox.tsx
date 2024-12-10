import React, { useState } from 'react';
import { Action, FormScenario } from '../../../utils/types';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { body2, emptyState, label } from '../../common/typography';
import Collapse from '@mui/material/Collapse';
import { ExpandLess, ExpandMore, Edit } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { UseFormReturn } from 'react-hook-form';
import { ActionFormItem } from './ActionFormItem';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useScenario } from '../../../contexts/ScenarioContext';
import { useRiScs } from '../../../contexts/RiScContext';
import CircularProgress from '@mui/material/CircularProgress';
import { DeleteActionConfirmation } from './DeleteActionConfirmation';

interface ActionBoxProps {
  action: Action;
  index: number;
  formMethods: UseFormReturn<FormScenario>;
  remove: () => void;
  onSubmit: () => void;
}

export const ActionBox = ({
  action,
  index,
  formMethods,
  remove,
  onSubmit,
}: ActionBoxProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { isActionExpanded, toggleActionExpanded } = useScenario();

  const isExpanded = isActionExpanded(action.ID);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { updateStatus } = useRiScs();

  const { submitEditedScenarioToRiSc, mapFormScenarioToScenario } =
    useScenario();

  const isActionTitlePresent = action.title !== null && action.title !== '';

  /* @ts-ignore Because ts can't typecheck strings against our keys */
  const translatedActionStatus = t(`actionStatus.${action.status}`);

  const [deleteActionConfirmationIsOpen, setDeleteActionConfirmationIsOpen] =
    useState(false);

  if (isEditing) {
    return (
      <>
        <ActionFormItem
          formMethods={formMethods}
          index={index}
          handleDelete={() => setDeleteActionConfirmationIsOpen(true)}
          showTitleNumber={false}
          remove={remove}
        />
        <ButtonGroup fullWidth>
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
                sx={{ marginLeft: 1, color: 'inherit' }}
              />
            )}
          </Button>

          <Button onClick={() => setIsEditing(false)}>Avbryt</Button>
        </ButtonGroup>
        <DeleteActionConfirmation
          deleteActionConfirmationIsOpen={deleteActionConfirmationIsOpen}
          setDeleteActionConfirmationIsOpen={setDeleteActionConfirmationIsOpen}
          formMethods={formMethods}
          index={index}
          remove={remove}
          onSubmit={onSubmit}
        />
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
              action.status === 'Completed'
                ? { backgroundColor: '#6BC6A4' }
                : undefined,
          }}
        />
      </Box>
      <Collapse in={isExpanded}>
        <Typography sx={{ ...label, marginTop: 1 }}>
          {t('dictionary.description')}
        </Typography>
        <Typography
          sx={{
            ...body2,
            wordBreak: 'break-all',
          }}
        >
          {action.description}
        </Typography>

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
    </Box>
  );
};
