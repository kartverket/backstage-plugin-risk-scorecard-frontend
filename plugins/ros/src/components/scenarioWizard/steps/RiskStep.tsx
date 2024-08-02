import React from 'react';
import {
  getConsequenceLevel,
  getProbabilityLevel,
} from '../../../utils/utilityfunctions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ProbabilityTable } from '../components/ProbabilityTable';
import { ConsequenceTable } from '../components/ConsequenceTable';
import { useScenario } from '../../../contexts/ScenarioContext';
import { heading2, heading3, subtitle2 } from '../../common/typography';
import Stack from '@mui/material/Stack';

interface RiskStepProps {
  riskType: 'initial' | 'rest';
  restEqualsInitial?: boolean;
}

export const RiskStep = ({ riskType, restEqualsInitial }: RiskStepProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const {
    scenario,
    setConsequence,
    setProbability,
    setRemainingConsequence,
    setRemainingProbability,
    setProbabilityAndRemainingProbability,
    setConsequenceAndRemainingConsequence,
  } = useScenario();

  const resourceKey =
    riskType === 'initial' ? 'initialRiskStep' : 'restRiskStep';
  const risk = riskType === 'initial' ? scenario.risk : scenario.remainingRisk;

  const handleProbabilityChange = (probabilityLevel: number) => {
    if (riskType === 'initial') {
      if (restEqualsInitial) {
        setProbabilityAndRemainingProbability(probabilityLevel);
      } else {
        setProbability(probabilityLevel);
      }
    } else {
      setRemainingProbability(probabilityLevel);
    }
  };

  const handleConsequenceChange = (consequenceLevel: number) => {
    if (riskType === 'initial') {
      if (restEqualsInitial) {
        setConsequenceAndRemainingConsequence(consequenceLevel);
      } else {
        setConsequence(consequenceLevel);
      }
    } else {
      setRemainingConsequence(consequenceLevel);
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography sx={heading2}>
          {t(`scenarioStepper.${resourceKey}.title`)}
        </Typography>
        <Typography sx={subtitle2}>
          {t(`scenarioStepper.${resourceKey}.subtitle`)}
        </Typography>
      </Box>
      <Box>
        <Typography sx={heading3}>{t('dictionary.probability')}</Typography>
        <Typography sx={subtitle2}>
          {t(`scenarioStepper.${resourceKey}.probabilitySubtitle`)}
        </Typography>
      </Box>
      <ProbabilityTable
        selectedValue={getProbabilityLevel(risk)}
        handleChange={handleProbabilityChange}
      />
      <Box>
        <Typography sx={heading3}>{t('dictionary.consequence')}</Typography>
        <Typography sx={subtitle2}>
          {t(`scenarioStepper.${resourceKey}.consequenceSubtitle`)}
        </Typography>
      </Box>
      <ConsequenceTable
        selectedValue={getConsequenceLevel(risk)}
        handleChange={handleConsequenceChange}
      />
    </Stack>
  );
};
