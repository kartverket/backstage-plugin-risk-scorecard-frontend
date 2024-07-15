import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Scenario } from '../../../utils/types';
import { Paper } from '@material-ui/core';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { threatActorsOptions } from '../../../utils/constants';

const ScenarioForm = ({
  formMethods,
}: {
  formMethods: UseFormReturn<Scenario>;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { section } = useScenarioDrawerStyles();
  const { control, register } = formMethods;

  const translatedThreatActors = threatActorsOptions.map(threatActor => ({
    value: threatActor,
    /* @ts-ignore Because ts can't typecheck strings against our keys */
    renderedValue: t(`threatActors.${threatActor}`),
  }));

  console.log('translatedThreatActors', JSON.stringify(translatedThreatActors));

  return (
    <>
      <Paper className={section} style={{ padding: '1rem' }}>
        <Input {...register('title')} label={t('scenarioDrawer.title')} />
        <Select
          multiple
          control={control}
          name="threatActors"
          label={t('dictionary.threatActors')}
          renderValue={value => {
            /* @ts-ignore */
            return t(`threatActors.${value}`);
          }}
        >
          {translatedThreatActors.map(threatActor => (
            <option key={threatActor.value} value={threatActor.value}>
              {threatActor.renderedValue}
            </option>
          ))}
        </Select>
      </Paper>
    </>
  );
};

export default ScenarioForm;
