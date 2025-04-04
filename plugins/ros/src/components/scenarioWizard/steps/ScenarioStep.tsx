import {
  threatActorsOptions,
  vulnerabilitiesOptions,
} from '../../../utils/constants';

import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { heading2, subtitle2 } from '../../common/typography';
import { UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import { Select } from '../../common/Select';
import { Input } from '../../common/Input';
import { MarkdownInput } from '../../common/MarkdownInput';

export const ScenarioStep = ({
  formMethods,
}: {
  formMethods: UseFormReturn<FormScenario>;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const {
    control,
    register,
    setValue,
    watch,
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
          options={translatedThreatActors}
        />

        <Select<FormScenario>
          multiple
          control={control}
          name="vulnerabilities"
          label={t('dictionary.vulnerabilities')}
          sublabel={t('scenarioDrawer.vulnerabilitySubtitle')}
          labelTranslationKey="vulnerabilities"
          options={translatedVulnerabilities}
        />
      </Stack>

      <MarkdownInput
        {...register('description')}
        label={t('dictionary.description')}
        value={currentDescription}
        onMarkdownChange={value => setValue('description', value)}
        minRows={4}
      />
    </Stack>
  );
};
