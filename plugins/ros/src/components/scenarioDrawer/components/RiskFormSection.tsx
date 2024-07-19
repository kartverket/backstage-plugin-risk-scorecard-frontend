import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Scenario } from '../../../utils/types';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  consequenceOptions,
  probabilityOptions,
} from '../../../utils/constants';
import { Select } from '../../common/Select';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { heading3 } from '../../common/typography';
import FormSection from './FormSection';

const ScenarioForm = ({
  formMethods,
}: {
  formMethods: UseFormReturn<Scenario>;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { control } = formMethods;

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
    <Box
      sx={{
        display: 'flex',
        gap: '24px',
      }}
    >
      <FormSection>
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
      </FormSection>
      <FormSection>
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
      </FormSection>
    </Box>
  );
};

export default ScenarioForm;
