import { UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { MarkdownInput } from '../../common/MarkdownInput';
import {
  threatActorsOptions,
  vulnerabilitiesOptions,
} from '../../../utils/constants';
import { Select } from '../../common/Select';
import Typography from '@mui/material/Typography';
import { heading3 } from '../../common/typography';
import Paper from '@mui/material/Paper';
import { section } from '../scenarioDrawerComponents';
import { Input } from '../../common/Input';

function ScopeFormSection({
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
        options={translatedThreatActors}
      />
      <Select<FormScenario>
        multiple
        control={control}
        name="vulnerabilities"
        label={t('dictionary.vulnerabilities')}
        labelTranslationKey="vulnerabilities"
        options={translatedVulnerabilities}
      />
      <MarkdownInput
        {...register('description')}
        value={currentDescription}
        onMarkdownChange={value => setValue('description', value)}
        label={t('dictionary.description')}
        minRows={4}
      />
    </Paper>
  );
}

export default ScopeFormSection;
