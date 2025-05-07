import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
  ThreatActorsOptions,
  VulnerabilitiesOptions,
} from '../../../utils/constants';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { FormScenario } from '../../../utils/types';
import {
  translatedThreatActorOptions,
  translatedVulnerabilitiesOptions,
} from '../../../utils/utilityfunctions';
import { Input } from '../../common/Input';
import { MarkdownInput } from '../../common/MarkdownInput';
import { Select } from '../../common/Select';
import { heading3 } from '../../common/typography';
import { section } from '../scenarioDrawerComponents';

function ScopeFormSection({
  formMethods,
}: {
  formMethods: UseFormReturn<FormScenario>;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const {
    control,
    register,
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

  return (
    <Paper sx={section}>
      <Typography sx={heading3}>{t('scenarioDrawer.title')}</Typography>
      <Input
        required
        {...register('title', { required: true })}
        error={errors.title !== undefined}
        label={t('dictionary.title')}
      />
      <Select<FormScenario>
        multiple
        control={control}
        name="threatActors"
        label={t('dictionary.threatActors')}
        labelTranslationKey="threatActors"
        options={threatActorOptions}
      />
      <Select<FormScenario>
        multiple
        control={control}
        name="vulnerabilities"
        label={t('dictionary.vulnerabilities')}
        labelTranslationKey="vulnerabilities"
        options={vulnerabilitiesOptions}
      />
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <MarkdownInput
            value={value}
            onMarkdownChange={onChange}
            label={t('dictionary.description')}
            minRows={8}
            error={!!error}
          />
        )}
      />
    </Paper>
  );
}

export default ScopeFormSection;
