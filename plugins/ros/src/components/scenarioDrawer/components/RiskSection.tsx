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

interface RiskProps {
  risk: Risk;
  riskType: 'initialRisk' | 'restRisk';
}

const RiskBox = ({ risk, riskType }: RiskProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

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
          {formatNOK(risk.consequence * risk.probability)}{' '}
          {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
        </Typography>
      </Box>
    </Paper>
  );
};

export const RiskSection = () => {
  const { scenario } = useScenario();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <RiskBox risk={scenario.risk} riskType="initialRisk" />
      <KeyboardDoubleArrowRightIcon sx={{ fontSize: '48px' }} />
      <RiskBox risk={scenario.remainingRisk} riskType="restRisk" />
    </Box>
  );
};
