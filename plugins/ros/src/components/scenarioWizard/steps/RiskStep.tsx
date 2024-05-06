import React, { Fragment, useContext, useEffect } from 'react';
import {
  getKonsekvensLevel,
  getSannsynlighetLevel,
} from '../../utils/utilityfunctions';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import Box from '@material-ui/core/Box';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useFontStyles } from '../../scenarioDrawer/style';
import { ConsequenceTable } from '../../scenarioDrawer/edit/tabs/konsekvens/KonsekvensTable';
import { ProbabilityTable } from '../../scenarioDrawer/edit/tabs/sannsynlighet/ProbabilityTable';

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    paddingBottom: theme.spacing(2),
  },
}));

interface RiskStepProps {
  riskType: 'initial' | 'rest';
  restEqualsInitial?: boolean;
}

export const RiskStep = ({ riskType, restEqualsInitial }: RiskStepProps) => {
  const {
    scenario,
    setKonsekvens,
    setSannsynlighet,
    setRestKonsekvens,
    setRestSannsynlighet,
  } = useContext(ScenarioContext)!!;

  const { h2, h3, subtitle2 } = useFontStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const resourceKey =
    riskType === 'initial' ? 'initialRiskStep' : 'restRiskStep';
  const risk = riskType === 'initial' ? scenario.risk : scenario.remainingRisk;

  const { box } = useStyles();

  useEffect(() => {
    if (restEqualsInitial) setRestKonsekvens(getKonsekvensLevel(scenario.risk));
  }, [scenario.risk.consequence]);

  useEffect(() => {
    if (restEqualsInitial)
      setRestSannsynlighet(getSannsynlighetLevel(scenario.risk));
  }, [scenario.risk.probability]);

  const setC = riskType === 'initial' ? setKonsekvens : setRestKonsekvens;
  const setP = riskType === 'initial' ? setSannsynlighet : setRestSannsynlighet;

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
        <Typography className={h3}>{t('dictionary.consequence')}</Typography>
        <Typography className={subtitle2}>
          {t(`scenarioStepper.${resourceKey}.consequenceSubtitle`)}
        </Typography>
      </Box>
      <Box className={box}>
        <ConsequenceTable
          selectedValue={getKonsekvensLevel(risk)}
          handleChange={setC}
        />
      </Box>
      <Box className={box}>
        <Typography className={h3}>{t('dictionary.probability')}</Typography>
        <Typography className={subtitle2}>
          {t(`scenarioStepper.${resourceKey}.probabilitySubtitle`)}
        </Typography>
      </Box>
      <Box className={box}>
        <ProbabilityTable
          selectedValue={getSannsynlighetLevel(risk)}
          handleChange={setP}
        />
      </Box>
    </Fragment>
  );
};
