import React, { Fragment } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Scenario } from '../../../utils/types';
import Paper from '@mui/material/Paper';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Input } from '../../common/Input';
import {
  actionStatusOptions,
  consequenceOptions,
  probabilityOptions,
  threatActorsOptions,
  vulnerabilitiesOptions,
} from '../../../utils/constants';
import { Select } from '../../common/Select';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { heading3 } from '../../common/typography';
import { AddCircle } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { emptyAction } from '../../../ScenarioContext';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

const section: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  width: '100%',
  padding: '1rem',
};

const ScenarioForm = ({
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

  const translatedThreatActors = threatActorsOptions.map(threatActor => ({
    value: threatActor,
    /* @ts-ignore Because ts can't typecheck strings against our keys */
    renderedValue: t(`threatActors.${threatActor}`),
  }));

  const translatedVulnerabilities = vulnerabilitiesOptions.map(
    vulnerability => ({
      value: vulnerability,
      /* @ts-ignore Because ts can't typecheck strings against our keys */
      renderedValue: t(`vulnerabilities.${vulnerability}`),
    }),
  );

  const probabilityValues = probabilityOptions.map((value, index) => ({
    value,
    /* @ts-ignore Because ts can't typecheck strings against our keys */
    renderedValue: `${index + 1}: ${t(`probabilityTable.rows.${index + 1}`)}`,
  }));

  const consequenceValues = consequenceOptions.map((value, index) => ({
    value,
    /* @ts-ignore Because ts can't typecheck strings against our keys */
    renderedValue: `${index + 1}: ${t(`consequenceTable.rows.${index + 1}`)}`,
  }));

  return (
    <>
      <Paper sx={section}>
        <Typography sx={heading3}>{t('scenarioDrawer.title')}</Typography>
        <Input {...register('title')} label={t('dictionary.title')} />
        <Select<Scenario>
          multiple
          control={control}
          name="threatActors"
          label={t('dictionary.threatActors')}
          labelTranslationKey="threatActors"
          options={translatedThreatActors}
        />
        <Select<Scenario>
          multiple
          control={control}
          name="vulnerabilities"
          label={t('dictionary.vulnerabilities')}
          labelTranslationKey="vulnerabilities"
          options={translatedVulnerabilities}
        />
        <Input
          {...register('description')}
          label={t('dictionary.description')}
          minRows={4}
        />
      </Paper>

      <Box
        sx={{
          display: 'flex',
          gap: '24px',
        }}
      >
        <Paper sx={section}>
          <Typography sx={heading3}>{t('dictionary.initialRisk')}</Typography>
          <Select<Scenario>
            control={control}
            name="risk.probability"
            label={t('dictionary.probability')}
            options={probabilityValues}
          />
          <Select<Scenario>
            control={control}
            name="risk.consequence"
            label={t('dictionary.consequence')}
            options={consequenceValues}
          />
        </Paper>
        <Paper sx={section}>
          <Typography sx={heading3}>{t('dictionary.restRisk')}</Typography>
          <Select<Scenario>
            control={control}
            name="remainingRisk.probability"
            label={t('dictionary.probability')}
            options={probabilityValues}
          />
          <Select<Scenario>
            control={control}
            name="remainingRisk.consequence"
            label={t('dictionary.consequence')}
            options={consequenceValues}
          />
        </Paper>
      </Box>
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
            <Box sx={{ ...section, padding: 0 }}>
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
      </Paper>
    </>
  );
};

export default ScenarioForm;
