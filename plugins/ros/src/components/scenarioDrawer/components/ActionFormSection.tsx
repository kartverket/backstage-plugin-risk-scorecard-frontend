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
import FormSection from './FormSection';

const ActionFormSection = ({
  formMethods,
}: {
  formMethods: UseFormReturn<Scenario>;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { control, register } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'actions', // unique name for your Field Array
  });

  return (
    <FormSection>
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
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              width: '100%',
              padding: 0,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={heading3}>
                {t('scenarioDrawer.measureTab.title')} {index}
              </Typography>
              <IconButton onClick={() => remove(index)} color="primary">
                <DeleteIcon aria-label="Edit" />
              </IconButton>
            </Box>
            <Input
              {...register(`actions.${index}.description`)}
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
                {...register(`actions.${index}.url`)}
                label={t('dictionary.url')}
              />
              <Select<Scenario>
                control={control}
                name={`actions.${index}.status`}
                label={t('dictionary.status')}
                options={actionStatusOptions.map(value => ({
                  value,
                  renderedValue: value,
                }))}
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
    </FormSection>
  );
};

export default ActionFormSection;
