import React, { Fragment, useContext } from 'react';
import {
  getKonsekvensLevel,
  getSannsynlighetLevel,
} from '../../utils/utilityfunctions';
import { ScenarioContext } from '../../rosPlugin/ScenarioContext';
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
}

export const RiskStep = ({ riskType }: RiskStepProps) => {
  const { scenario, setKonsekvens, setSannsynlighet } =
    useContext(ScenarioContext)!!;

  const { h2, h3, subtitle2 } = useFontStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const resourceKey =
    riskType === 'initial' ? 'initialRiskStep' : 'restRiskStep';
  const risk = riskType === 'initial' ? scenario.risiko : scenario.restrisiko;

  const { box } = useStyles();

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
          handleChange={setKonsekvens}
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
          handleChange={setSannsynlighet}
        />
      </Box>
    </Fragment>
  );
};
