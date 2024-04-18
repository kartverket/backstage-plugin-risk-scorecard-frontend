import React, { useContext } from 'react';
import { ScenarioContext } from '../../rosPlugin/ScenarioContext';
import { useFontStyles } from '../../scenarioDrawer/style';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import { PickerTable } from '../../scenarioDrawer/edit/tabs/konsekvens/KonsekvensTable';
import {
  getKonsekvensLevel,
  getSannsynlighetLevel,
} from '../../utils/utilityfunctions';
import { SannsynlighetTable } from '../../scenarioDrawer/edit/tabs/sannsynlighet/SannsynlighetTable';
import { konsekvensOptions, sannsynlighetOptions } from '../../utils/constants';

export const RestRiskStep = () => {
  const { scenario, updateRestrisiko } = useContext(ScenarioContext)!!;

  const { h2, h3, subtitle2 } = useFontStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const setRestKonsekvens = (restKonsekvensLevel: number) => {
    updateRestrisiko({
      ...scenario.restrisiko,
      konsekvens: konsekvensOptions[restKonsekvensLevel - 1],
    });
  };

  const setRestSannsynlighet = (restSannsynlighetLevel: number) => {
    updateRestrisiko({
      ...scenario.restrisiko,
      sannsynlighet: sannsynlighetOptions[restSannsynlighetLevel - 1],
    });
  };

  return (
    <Box>
      <Typography className={h2}>{t('dictionary.restRisk')}</Typography>
      <Typography className={subtitle2}>
        {t('scenarioStepper.restRiskStep.subtitle')}
      </Typography>
      <Typography className={h3}>{t('dictionary.consequence')}</Typography>
      <Typography className={subtitle2}>
        {t('scenarioStepper.restRiskStep.consequenceSubtitle')}
      </Typography>
      <PickerTable
        selectedValue={getKonsekvensLevel(scenario.restrisiko)}
        handleChange={setRestKonsekvens}
      />
      <Typography className={h3}>{t('dictionary.probability')}</Typography>
      <Typography className={subtitle2}>
        {t('scenarioStepper.restRiskStep.probabilitySubtitle')}
      </Typography>
      <SannsynlighetTable
        selectedValue={getSannsynlighetLevel(scenario.restrisiko)}
        handleChange={setRestSannsynlighet}
      />
    </Box>
  );
};
