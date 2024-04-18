import React, { useContext } from 'react';
import { PickerTable } from '../../scenarioDrawer/edit/tabs/konsekvens/KonsekvensTable';
import {
  getKonsekvensLevel,
  getSannsynlighetLevel,
} from '../../utils/utilityfunctions';
import { ScenarioContext } from '../../rosPlugin/ScenarioContext';
import { SannsynlighetTable } from '../../scenarioDrawer/edit/tabs/sannsynlighet/SannsynlighetTable';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useFontStyles } from '../../scenarioDrawer/style';

export const StartRiskStep = () => {
  const { scenario, setKonsekvens, setSannsynlighet } =
    useContext(ScenarioContext)!!;

  const { h2, h3, subtitle2 } = useFontStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Box>
      <Typography className={h2}>
        {t('scenarioStepper.initialRiskStep.title')}
      </Typography>
      <Typography className={subtitle2}>
        {t('scenarioStepper.initialRiskStep.subtitle')}
      </Typography>
      <Typography className={h3}>{t('dictionary.consequence')}</Typography>
      <Typography className={subtitle2}>
        {t('scenarioDrawer.consequenceTab.subtitle')}
      </Typography>
      <PickerTable
        selectedValue={getKonsekvensLevel(scenario.risiko)}
        handleChange={setKonsekvens}
      />
      <Typography className={h3}>{t('dictionary.probability')}</Typography>
      <Typography className={subtitle2}>
        {t('scenarioDrawer.probabilityTab.subtitle')}
      </Typography>
      <SannsynlighetTable
        selectedValue={getSannsynlighetLevel(scenario.risiko)}
        handleChange={setSannsynlighet}
      />
    </Box>
  );
};
