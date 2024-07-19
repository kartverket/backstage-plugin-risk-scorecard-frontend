import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Scenario } from '../../../utils/types';
import { Paper } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Input } from '../../common/Input';
import { threatActorsOptions } from '../../../utils/constants';
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

  return (
    <>
      <Paper
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '1rem',
        }}
      >
        <Input {...register('title')} label={t('scenarioDrawer.title')} />
        <Select
          multiple
          control={control}
          name="threatActors"
          label={t('dictionary.threatActors')}
          labelTranslationKey="threatActors"
          options={translatedThreatActors}
        />
      </Paper>
    </>
  );
};

export default ScenarioForm;
