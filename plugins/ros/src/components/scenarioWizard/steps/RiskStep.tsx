import React, { Fragment, useContext, useEffect } from 'react';
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
  } = useContext(ScenarioContext)!!;

  const resourceKey =
    riskType === 'initial' ? 'initialRiskStep' : 'restRiskStep';
  const risk = riskType === 'initial' ? scenario.risk : scenario.remainingRisk;

  useEffect(() => {
    if (restEqualsInitial)
      setRemainingConsequence(getConsequenceLevel(scenario.risk));
  }, [restEqualsInitial, scenario.risk, scenario.risk.consequence, setRemainingConsequence]);

  useEffect(() => {
    if (restEqualsInitial)
      setRemainingProbability(getProbabilityLevel(scenario.risk));
  }, [restEqualsInitial, scenario.risk, scenario.risk.probability, setRemainingProbability]);

  const setC =
    riskType === 'initial' ? setConsequence : setRemainingConsequence;
  const setP =
    riskType === 'initial' ? setProbability : setRemainingProbability;

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
          handleChange={setP}
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
          handleChange={setC}
        />
      </Box>
    </Fragment>
  );
};
