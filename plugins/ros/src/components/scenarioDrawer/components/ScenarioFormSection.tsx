import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Scenario } from '../../../utils/types';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Input } from '../../common/Input';
import {
  threatActorsOptions,
  vulnerabilitiesOptions,
} from '../../../utils/constants';
import { Select } from '../../common/Select';
import Typography from '@mui/material/Typography';
import { heading3 } from '../../common/typography';
import Paper from '@mui/material/Paper';
import { section } from '../scenarioDrawerComponents';

const ScenarioFormSection = ({
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

  return (
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
  );
};

export default ScenarioFormSection;
