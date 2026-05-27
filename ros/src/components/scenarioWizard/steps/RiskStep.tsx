import Box from '@mui/material/Box';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ProbabilityTable } from '../components/ProbabilityTable';
import { ConsequenceTable } from '../components/ConsequenceTable';
import Stack from '@mui/material/Stack';
import { UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import { Text } from '@backstage/ui';

interface RiskStepProps {
  riskType: keyof Pick<FormScenario, 'risk' | 'remainingRisk'>;
  formMethods: UseFormReturn<FormScenario>;
}

export function RiskStep({ formMethods, riskType }: RiskStepProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const translationKey =
    riskType === 'remainingRisk' ? 'restRiskStep' : 'initialRiskStep';

  return (
    <Stack spacing={2}>
      <Box>
        <Text style={{ fontSize: '1.75rem' }} as="h2" weight="bold">
          {t(`scenarioStepper.${translationKey}.title`)}
        </Text>
        <Text variant="body-large" as="p">
          {t(`scenarioStepper.${translationKey}.subtitle`)}
        </Text>
      </Box>
      <Box>
        <Text as="h3" variant="title-x-small" weight="bold">
          {t('dictionary.probability')}
        </Text>
        <Text variant="body-large" as="p">
          {t(`scenarioStepper.${translationKey}.probabilitySubtitle`)}
        </Text>
      </Box>
      <ProbabilityTable formMethods={formMethods} riskType={riskType} />
      <Box>
        <Text as="h3" variant="title-x-small" weight="bold">
          {t('dictionary.consequence')}
        </Text>
        <Text variant="body-large" as="p">
          {t(`scenarioStepper.${translationKey}.consequenceSubtitle`)}
        </Text>
      </Box>
      <ConsequenceTable formMethods={formMethods} riskType={riskType} />
    </Stack>
  );
}
