import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Paper from '@mui/material/Paper';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
  ThreatActorsOptions,
  VulnerabilitiesOptions,
} from '../../../utils/constants';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { FormScenario } from '../../../utils/types';
import {
  threatActorOptionsToTranslationKeys,
  vulnerabiltiesOptionsToTranslationKeys,
} from '../../../utils/utilityfunctions';
import { Input } from '../../common/Input';
import { MarkdownInput } from '../../common/MarkdownInput';
import { Select } from '../../common/Select';
import { section } from '../scenarioDrawerComponents';
import { Text } from '@backstage/ui';

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
      renderedValue: t(threatActorOptionsToTranslationKeys[threatActor]),
    }),
  );

  const vulnerabilitiesOptions = Object.values(VulnerabilitiesOptions).map(
    vulnerability => ({
      value: vulnerability,
      /* @ts-ignore Because ts can't typecheck strings against our keys */
      renderedValue: t(vulnerabiltiesOptionsToTranslationKeys[vulnerability]),
    }),
  );

  return (
    <Paper sx={section}>
      <Text as="h6" variant="title-x-small" weight="bold">
        {t('scenarioDrawer.title')}
      </Text>
      <Input
        required
        {...register('title', { required: true })}
        error={errors.title !== undefined}
        label={t('dictionary.title')}
        helperText={errors.title && t('scenarioDrawer.titleError')}
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
