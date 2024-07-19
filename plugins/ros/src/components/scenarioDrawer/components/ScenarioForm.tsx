import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Scenario } from '../../../utils/types';
import Paper from '@mui/material/Paper';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Input } from '../../common/Input';
import {
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
        <Input {...register('title')} label={t('scenarioDrawer.title')} />
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
    </>
  );
};

export default ScenarioForm;
