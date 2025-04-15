import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  formatNOK,
  getConsequenceLevel,
  getRiskMatrixColor,
  getProbabilityLevel,
} from '../../../utils/utilityfunctions';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useScenario } from '../../../contexts/ScenarioContext';
import { Risk } from '../../../utils/types';
import { section } from '../scenarioDrawerComponents';
import { body1, heading3, label, label2 } from '../../common/typography';
import {
  probabilityOptions,
  consequenceOptions,
} from '../../../utils/constants';

interface RiskProps {
  risk: Risk;
  riskType: 'initialRisk' | 'restRisk';
}

function calculateCost(risk: Risk, initialRisk: boolean): number {
  const probability = initialRisk ? risk.probability : risk.probability;
  const consequence = initialRisk ? risk.consequence : risk.consequence;

  const probabilityIndex = probabilityOptions.indexOf(probability) + 1;
  const consequenceIndex = consequenceOptions.indexOf(consequence) + 1;

  return Math.pow(20, probabilityIndex + consequenceIndex - 1);
}

function RiskBox({ risk, riskType }: RiskProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const cost = calculateCost(risk, riskType === 'initialRisk');

  return (
    <Paper sx={section}>
      <Typography sx={heading3}>{t(`dictionary.${riskType}`)}</Typography>

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
            <Typography sx={label2}>
              {t('dictionary.probability')}: {getProbabilityLevel(risk)}
            </Typography>
            <Typography sx={label2}>
              {t('dictionary.consequence')}: {getConsequenceLevel(risk)}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box>
        <Typography sx={label}>{t('dictionary.estimatedRisk')}</Typography>
        <Typography sx={body1}>
          {formatNOK(cost)} {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
        </Typography>
      </Box>
    </Paper>
  );
}

export function RiskSection() {
  const { scenario } = useScenario();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <RiskBox risk={scenario.risk} riskType="initialRisk" />
      <KeyboardDoubleArrowRightIcon sx={{ fontSize: '48px' }} />
      <RiskBox risk={scenario.remainingRisk} riskType="restRisk" />
    </Box>
  );
}
