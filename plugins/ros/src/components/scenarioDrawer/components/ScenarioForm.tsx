import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Scenario } from '../../../utils/types';
import { Paper } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Input } from '../../common/Input';
import {
  threatActorsOptions,
  vulnerabilitiesOptions,
} from '../../../utils/constants';
import { Select } from '../../common/Select';

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

  return (
    <>
      <Paper
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '1rem',
        }}
      >
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
    </>
  );
};

export default ScenarioForm;
