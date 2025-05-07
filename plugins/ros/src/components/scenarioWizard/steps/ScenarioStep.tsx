import {
  ThreatActorsOptions,
  VulnerabilitiesOptions,
} from '../../../utils/constants';

import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { UseFormReturn } from 'react-hook-form';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { FormScenario } from '../../../utils/types';
import { translatedThreatActorOptions } from '../../../utils/utilityfunctions';
import { Input } from '../../common/Input';
import { MarkdownInput } from '../../common/MarkdownInput';
import { Select } from '../../common/Select';
import { heading2, subtitle2 } from '../../common/typography';

export function ScenarioStep({
  formMethods,
}: {
  formMethods: UseFormReturn<FormScenario>;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;

  const threatActorOptions = Object.values(ThreatActorsOptions).map(
    threatActor => ({
      value: threatActor,
      /* @ts-ignore Because ts can't typecheck strings against our keys */
      renderedValue: t(translatedThreatActorOptions[threatActor]),
    }),
  );

  const vulnerabilitiesOptions = Object.values(VulnerabilitiesOptions).map(
    vulnerability => ({
      value: vulnerability,
      /* @ts-ignore Because ts can't typecheck strings against our keys */
      renderedValue: t(translatedVulnerabilitiesOptions[vulnerability]),
    }),
  );

  const currentDescription = watch('description');

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
        <Select<FormScenario>
          multiple
          control={control}
          name="threatActors"
          label={t('dictionary.threatActors')}
          sublabel={t('scenarioDrawer.threatActorSubtitle')}
          labelTranslationKey="threatActors"
          options={threatActorOptions}
        />

        <Select<FormScenario>
          multiple
          control={control}
          name="vulnerabilities"
          label={t('dictionary.vulnerabilities')}
          sublabel={t('scenarioDrawer.vulnerabilitySubtitle')}
          labelTranslationKey="vulnerabilities"
          options={vulnerabilitiesOptions}
        />
      </Stack>

      <MarkdownInput
        {...register('description')}
        label={t('dictionary.description')}
        value={currentDescription}
        onMarkdownChange={value => setValue('description', value)}
        minRows={8}
      />
    </Stack>
  );
}
