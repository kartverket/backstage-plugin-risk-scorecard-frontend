import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddCircle from '@mui/icons-material/AddCircle';
import { emptyAction } from '../../../contexts/ScenarioContext';
import { heading2, heading3, label, subtitle2 } from '../../common/typography';
import Box from '@mui/material/Box';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  actionStatusOptions,
  urlRegExpPattern,
} from '../../../utils/constants';
import IconButton from '@mui/material/IconButton';
import { Select } from '../../common/Select';
import { Input } from '../../common/Input';
import { MarkdownInput } from '../../common/MarkdownInput';
import { useState } from 'react';
import { DeleteActionConfirmation } from '../../scenarioDrawer/components/DeleteConfirmation';

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

  const translatedActionStatuses = actionStatusOptions.map(actionStatus => ({
    value: actionStatus,
    /* @ts-ignore Because ts can't typecheck strings against our keys */
    renderedValue: t(`actionStatus.${actionStatus}`),
  }));

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
                    label={t('dictionary.url')}
                    helperText={formState.errors.actions?.[index]?.url?.message}
                    error={!!formState.errors.actions?.[index]?.url?.message}
                  />
                  <Select<FormScenario>
                    required
                    control={control}
                    name={`actions.${index}.status`}
                    label={t('dictionary.status')}
                    options={translatedActionStatuses}
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
