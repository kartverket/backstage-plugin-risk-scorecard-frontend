import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ProbabilityTable } from '../components/ProbabilityTable';
import { ConsequenceTable } from '../components/ConsequenceTable';
import { heading2, heading3, subtitle2 } from '../../common/typography';
import Stack from '@mui/material/Stack';
import { UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';

interface RiskStepProps {
  riskType: keyof Pick<FormScenario, 'risk' | 'remainingRisk'>;
  formMethods: UseFormReturn<FormScenario>;
}

export const RiskStep = ({ formMethods, riskType }: RiskStepProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const translationKey =
    riskType === 'remainingRisk' ? 'restRiskStep' : 'initialRiskStep';

  return (
    <Stack spacing={2}>
      <Box>
        <Typography sx={heading2}>
          {t(`scenarioStepper.${translationKey}.title`)}
        </Typography>
        <Typography sx={subtitle2}>
          {t(`scenarioStepper.${translationKey}.subtitle`)}
        </Typography>
      </Box>
      <Box>
        <Typography sx={heading3}>{t('dictionary.probability')}</Typography>
        <Typography sx={subtitle2}>
          {t(`scenarioStepper.${translationKey}.probabilitySubtitle`)}
        </Typography>
      </Box>
      <ProbabilityTable formMethods={formMethods} riskType={riskType} />
      <Box>
        <Typography sx={heading3}>{t('dictionary.consequence')}</Typography>
        <Typography sx={subtitle2}>
          {t(`scenarioStepper.${translationKey}.consequenceSubtitle`)}
        </Typography>
      </Box>
      <ConsequenceTable formMethods={formMethods} riskType={riskType} />
    </Stack>
  );
};
