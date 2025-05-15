import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useScenario } from '../../../contexts/ScenarioContext';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { Risk } from '../../../utils/types';
import {
  formatNOK,
  getConsequenceLevel,
  getProbabilityLevel,
  getRiskMatrixColor,
} from '../../../utils/utilityfunctions';
import { body1, heading3, label, label2 } from '../../common/typography';
import { section } from '../scenarioDrawerComponents';

interface RiskProps {
  risk: Risk;
  heading: string;
}

function RiskBox({ risk, heading }: RiskProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const cost = risk.probability * risk.consequence;

  return (
    <Paper sx={section}>
      <Typography sx={heading3}>{heading}</Typography>

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
