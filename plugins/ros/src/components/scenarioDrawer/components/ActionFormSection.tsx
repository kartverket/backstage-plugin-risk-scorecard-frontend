import React, { Fragment } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Scenario } from '../../../utils/types';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Input } from '../../common/Input';
import { actionStatusOptions } from '../../../utils/constants';
import { Select } from '../../common/Select';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { heading3 } from '../../common/typography';
import { AddCircle } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { emptyAction } from '../../../ScenarioContext';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { section } from '../scenarioDrawerComponents';
import Paper from '@mui/material/Paper';

const ActionFormSection = ({
  formMethods,
}: {
  formMethods: UseFormReturn<Scenario>;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { control, register, formState } = formMethods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });

  const translatedActionStatuses = actionStatusOptions.map(actionStatus => ({
    value: actionStatus,
    /* @ts-ignore Because ts can't typecheck strings against our keys */
    renderedValue: t(`actionStatus.${actionStatus}`),
  }));

  return (
    <Paper sx={section}>
      <Typography sx={heading3}>{t('dictionary.measure')}</Typography>
      <Input
        {...register('existingActions')}
        label={t('scenarioDrawer.measureTab.existingMeasure')}
        minRows={3}
      />
      {fields.map((field, index) => (
        <Fragment key={field.ID}>
          <Divider variant="fullWidth" />
          <Box
            sx={{
              display: 'grid',
              gap: '24px',
              padding: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography sx={heading3}>
                {t('dictionary.measure')} {index + 1}
              </Typography>
              <IconButton onClick={() => remove(index)} color="primary">
                <DeleteIcon aria-label="Edit" />
              </IconButton>
            </Box>
            <Input
              {...register(`actions.${index}.title`)}
              label={t('dictionary.title')}
            />
            <Input
              required
              {...register(`actions.${index}.description`, { required: true })}
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
                    value:
                      /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                    message: t('scenarioDrawer.action.urlError'),
                  },
                })}
                label={t('dictionary.url')}
                helperText={formState.errors.actions?.[index]?.url?.message}
                error={!!formState.errors.actions?.[index]?.url?.message}
              />
              <Select<Scenario>
                required
                control={control}
                name={`actions.${index}.status`}
                label={t('dictionary.status')}
                options={translatedActionStatuses}
              />
            </Box>
          </Box>
        </Fragment>
      ))}
      <Button
        startIcon={<AddCircle />}
        color="primary"
        onClick={() => append(emptyAction())}
      >
        {t('scenarioDrawer.measureTab.addMeasureButton')}
      </Button>
    </Paper>
  );
};

export default ActionFormSection;
