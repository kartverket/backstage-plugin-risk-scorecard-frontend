import {
  threatActorsOptions,
  vulnerabilitiesOptions,
} from '../../../utils/constants';
import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { heading2, subtitle2 } from '../../common/typography';
import { UseFormReturn } from 'react-hook-form';
import { Scenario } from '../../../utils/types';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';

export const ScenarioStep = ({
  formMethods,
}: {
  formMethods: UseFormReturn<Scenario>;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const {
    control,
    register,
    formState: { errors },
  } = formMethods;

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
    <Stack spacing={3}>
      <Box>
        <Typography sx={heading2}>{t('scenarioDrawer.title')}</Typography>
        <Typography sx={subtitle2}>{t('scenarioDrawer.subtitle')}</Typography>
      </Box>

      <Input
        required
        {...register('title', { required: true })}
        error={errors.title !== undefined}
        label={t('dictionary.title')}
      />

      <Stack direction="row" spacing={2}>
        <Select<Scenario>
          multiple
          control={control}
          name="threatActors"
          label={t('dictionary.threatActors')}
          sublabel={t('scenarioDrawer.threatActorSubtitle')}
          labelTranslationKey="threatActors"
          options={translatedThreatActors}
        />

        <Select<Scenario>
          multiple
          control={control}
          name="vulnerabilities"
          label={t('dictionary.vulnerabilities')}
          sublabel={t('scenarioDrawer.vulnerabilitySubtitle')}
          labelTranslationKey="vulnerabilities"
          options={translatedVulnerabilities}
        />
      </Stack>

      <Input
        {...register('description')}
        label={t('dictionary.description')}
        minRows={4}
      />
    </Stack>
  );
};
