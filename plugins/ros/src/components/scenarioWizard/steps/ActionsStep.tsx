import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import AddCircle from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { emptyAction } from '../../../contexts/ScenarioContext';
import {
  ActionStatusOptions,
  urlRegExpPattern,
} from '../../../utils/constants';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { FormScenario } from '../../../utils/types';
import { actionStatusOptionsToTranslationKeys } from '../../../utils/utilityfunctions';
import { Input } from '../../common/Input';
import { MarkdownInput } from '../../common/MarkdownInput';
import { Select } from '../../common/Select';
import { heading2, heading3, label, subtitle2 } from '../../common/typography';
import { DeleteActionConfirmation } from '../../scenarioDrawer/components/DeleteConfirmation';
import { Tooltip } from '@material-ui/core';
import HelpIcon from '@mui/icons-material/Help';
import { urlLabel } from '../../scenarioDrawer/components/ActionFormItem';

export function ActionsStep({
  formMethods,
}: {
  formMethods: UseFormReturn<FormScenario>;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { control, register, setValue, watch, formState } = formMethods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });

  const [deleteActionConfirmationIsOpen, setDeleteActionConfirmationIsOpen] =
    useState(false);
  const [actionToDelete, setActionToDelete] = useState<number | null>(null);

  function handleDeleteAction(index: number): void {
    setActionToDelete(index);
    setDeleteActionConfirmationIsOpen(true);
  }

  function confirmDeleteAction(): void {
    if (actionToDelete !== null) {
      remove(actionToDelete);
      setActionToDelete(null);
    }
  }

  const actionStatusOptions = Object.values(ActionStatusOptions).map(
    actionStatus => ({
      value: actionStatus,
      /* @ts-ignore Because ts can't typecheck strings against our keys */
      renderedValue: t(actionStatusOptionsToTranslationKeys[actionStatus]),
    }),
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={heading2}>{t('dictionary.measure')}</Typography>
        <Typography sx={subtitle2}>
          {t('scenarioDrawer.measureTab.subtitle')}
        </Typography>
      </Box>

      <Stack spacing={1}>
        <Typography sx={heading3}>
          {t('scenarioDrawer.measureTab.plannedMeasures')}
        </Typography>

        {fields.map((field, index) => {
          const currentActionDescription = watch(
            `actions.${index}.description`,
          );

          return (
            <Paper
              key={field.ID}
              sx={{
                padding: 2,
                marginBottom: 2,
              }}
            >
              <Stack spacing={1}>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={label}>
                    {t('dictionary.measure')} {index + 1}
                  </Typography>

                  <IconButton
                    onClick={() => handleDeleteAction(index)}
                    color="primary"
                  >
                    <DeleteIcon
                      aria-label={t('scenarioDrawer.deleteActionButton')}
                    />
                  </IconButton>
                </Box>

                <Input
                  required
                  {...register(`actions.${index}.title`, { required: true })}
                  label={t('dictionary.title')}
                />
                <MarkdownInput
                  {...register(`actions.${index}.description`)}
                  error={
                    formState.errors?.actions?.[index]?.description !==
                    undefined
                  }
                  value={currentActionDescription}
                  onMarkdownChange={value =>
                    setValue(`actions.${index}.description`, value)
                  }
                  label={t('dictionary.description')}
                />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '24px',
                  }}
                >
                  <Input
                    {...register(`actions.${index}.url`, {
                      pattern: {
                        value: urlRegExpPattern,
                        message: t('scenarioDrawer.action.urlError'),
                      },
                    })}
                    label={urlLabel}
                    helperText={formState.errors.actions?.[index]?.url?.message}
                    error={!!formState.errors.actions?.[index]?.url?.message}
                  />
                  <Select<FormScenario>
                    required
                    control={control}
                    name={`actions.${index}.status`}
                    label={t('dictionary.status')}
                    options={actionStatusOptions}
                  />
                </Box>
              </Stack>
            </Paper>
          );
        })}

        <Button
          startIcon={<AddCircle />}
          onClick={() => append(emptyAction())}
          sx={{ width: 'fit-content' }}
        >
          {t('scenarioDrawer.measureTab.addMeasureButton')}
        </Button>
      </Stack>

      <DeleteActionConfirmation
        isOpen={deleteActionConfirmationIsOpen}
        setIsOpen={setDeleteActionConfirmationIsOpen}
        onConfirm={confirmDeleteAction}
      />
    </Stack>
  );
}
