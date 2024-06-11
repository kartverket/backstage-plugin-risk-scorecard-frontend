import { Box, Grid, Typography } from '@material-ui/core';
import { TextField } from '../../utils/Textfield';
import { Dropdown } from '../../utils/Dropdown';
import {
  threatActorsOptions,
  vulnerabilitiesOptions,
} from '../../utils/constants';
import React, { useContext } from 'react';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import { useFontStyles } from '../../utils/style';

export const ScenarioStep = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { labelSubtitle, label, h2, subtitle2 } = useFontStyles();
  const {
    scenario,
    scenarioErrors,
    setTitle,
    setDescription,
    setThreatActors,
    setVulnerabilities,
  } = useContext(ScenarioContext)!!;

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
          value={scenario.title}
          error={scenarioErrors.title ? t('scenarioDrawer.titleError') : ''}
          required
          minRows={1}
          handleChange={setTitle}
        />
      </Grid>

      <Grid
        item
        md={6}
        xs={12}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box>
          <Typography className={label}>
            {t('dictionary.threatActors')}
          </Typography>
          <Typography className={labelSubtitle}>
            {t('scenarioDrawer.threatActorSubtitle')}
          </Typography>
        </Box>
        <Dropdown<string[]>
          selectedValues={scenario.threatActors}
          options={threatActorsOptions}
          handleChange={setThreatActors}
        />
      </Grid>

      <Grid
        item
        md={6}
        xs={12}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box>
          <Typography className={label}>
            {t('dictionary.vulnerabilities')}
          </Typography>
          <Typography className={labelSubtitle}>
            {t('scenarioDrawer.vulnerabilitySubtitle')}
          </Typography>
        </Box>
        <Dropdown<string[]>
          selectedValues={scenario.vulnerabilities}
          options={vulnerabilitiesOptions}
          handleChange={setVulnerabilities}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={t('dictionary.description')}
          value={scenario.description}
          minRows={4}
          handleChange={setDescription}
        />
      </Grid>
    </Grid>
  );
};
