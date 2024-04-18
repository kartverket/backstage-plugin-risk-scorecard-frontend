import { Grid, Typography } from '@material-ui/core';
import { TextField } from '../../utils/Textfield';
import { Dropdown } from '../../utils/Dropdown';
import {
  sårbarheterOptions,
  trusselaktørerOptions,
} from '../../utils/constants';
import React, { useContext } from 'react';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ScenarioContext } from '../../rosPlugin/ScenarioContext';
import { useFontStyles } from '../../scenarioDrawer/style';

export const ScenarioStep = () => {
  const {
    scenario,
    scenarioErrors,
    setTittel,
    setBeskrivelse,
    setTrusselaktører,
    setSårbarheter,
  } = useContext(ScenarioContext)!!;

  const { labelSubtitle, label, h2, subtitle2 } = useFontStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography className={h2}>{t('scenarioDrawer.title')}</Typography>
        <Typography className={subtitle2}>
          {t('scenarioDrawer.subtitle')}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          label={t('dictionary.title')}
          value={scenario.tittel}
          error={scenarioErrors.tittel}
          required
          minRows={1}
          handleChange={setTittel}
        />
      </Grid>

      <Grid item xs={6}>
        <Typography className={label}>
          {t('dictionary.threatActors')}
        </Typography>
        <Typography className={labelSubtitle}>
          {t('scenarioDrawer.threatActorSubtitle')}
        </Typography>
        <Dropdown<string[]>
          selectedValues={scenario.trusselaktører}
          options={trusselaktørerOptions}
          handleChange={setTrusselaktører}
        />
      </Grid>

      <Grid item xs={6}>
        <Typography className={label}>
          {t('dictionary.vulnerabilities')}
        </Typography>
        <Typography className={labelSubtitle}>
          {t('scenarioDrawer.vulnerabilitySubtitle')}
        </Typography>

        <Dropdown<string[]>
          selectedValues={scenario.sårbarheter}
          options={sårbarheterOptions}
          handleChange={setSårbarheter}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={t('dictionary.description')}
          value={scenario.beskrivelse}
          minRows={4}
          handleChange={setBeskrivelse}
        />
      </Grid>
    </Grid>
  );
};
