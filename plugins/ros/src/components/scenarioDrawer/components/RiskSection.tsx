import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useScenario } from '../../../contexts/ScenarioContext';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { Risk } from '../../../utils/types';
import {
  formatNOK,
  getConsequenceLevel,
  getProbabilityLevel,
  getRiskMatrixColor,
} from '../../../utils/utilityfunctions';
import { section } from '../scenarioDrawerComponents';
import { Text } from '@backstage/ui';

interface RiskProps {
  risk: Risk;
  heading: string;
}

function RiskBox({ risk, heading }: RiskProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const cost = risk.probability * risk.consequence;

  return (
    <Paper sx={section}>
      <Text variant="title-x-small" weight="bold">
        {heading}
      </Text>

      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: '20px',
              height: '48px',
              borderRadius: 1,
              backgroundColor: getRiskMatrixColor(risk),
            }}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              gap: 0.5,
            }}
          >
            <Text variant="body-medium" weight="bold">
              {t('dictionary.probability')}: {getProbabilityLevel(risk)}
            </Text>
            <Text variant="body-medium" weight="bold">
              {t('dictionary.consequence')}: {getConsequenceLevel(risk)}
            </Text>
          </Box>
        </Box>
      </Box>
      <Box>
        <Text as="p" variant="body-medium" weight="bold">
          {t('dictionary.estimatedRisk')}
        </Text>
        <Text variant="body-large" weight="bold">
          {formatNOK(cost)} {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
        </Text>
      </Box>
    </Paper>
  );
}

export function RiskSection() {
  const { scenario } = useScenario();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <RiskBox risk={scenario.risk} heading={t('dictionary.initialRisk')} />
      <KeyboardDoubleArrowRightIcon sx={{ fontSize: '48px' }} />
      <RiskBox
        risk={scenario.remainingRisk}
        heading={t('dictionary.restRisk')}
      />
    </Box>
  );
}
