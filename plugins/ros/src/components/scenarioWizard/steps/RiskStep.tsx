import React, { Fragment, useContext } from 'react';
import {
  getConsequenceLevel,
  getProbabilityLevel,
} from '../../utils/utilityfunctions';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ProbabilityTable } from '../components/ProbabilityTable';
import { ConsequenceTable } from '../components/ConsequenceTable';
import { useFontStyles } from '../../utils/style';
import { useRiskStepStyles } from './riskStepStyles';

interface RiskStepProps {
  riskType: 'initial' | 'rest';
  restEqualsInitial?: boolean;
}

export const RiskStep = ({ riskType, restEqualsInitial }: RiskStepProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h2, h3, subtitle2 } = useFontStyles();
  const { box } = useRiskStepStyles();
  const {
    scenario,
    setConsequence,
    setProbability,
    setRemainingConsequence,
    setRemainingProbability,
    setProbabilityAndRemainingProbability,
    setConsequenceAndRemainingConsequence,
  } = useContext(ScenarioContext)!!;

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
    <Fragment>
      <Box className={box}>
        <Typography className={h2}>
          {t(`scenarioStepper.${resourceKey}.title`)}
        </Typography>
        <Typography className={subtitle2}>
          {t(`scenarioStepper.${resourceKey}.subtitle`)}
        </Typography>
      </Box>
      <Box className={box}>
        <Typography className={h3}>{t('dictionary.probability')}</Typography>
        <Typography className={subtitle2}>
          {t(`scenarioStepper.${resourceKey}.probabilitySubtitle`)}
        </Typography>
      </Box>
      <Box className={box}>
        <ProbabilityTable
          selectedValue={getProbabilityLevel(risk)}
          handleChange={handleProbabilityChange}
        />
      </Box>
      <Box className={box}>
        <Typography className={h3}>{t('dictionary.consequence')}</Typography>
        <Typography className={subtitle2}>
          {t(`scenarioStepper.${resourceKey}.consequenceSubtitle`)}
        </Typography>
      </Box>
      <Box className={box}>
        <ConsequenceTable
          selectedValue={getConsequenceLevel(risk)}
          handleChange={handleConsequenceChange}
        />
      </Box>
    </Fragment>
  );
};
