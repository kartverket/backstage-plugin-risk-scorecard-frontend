import { Box, Grid, Typography } from '@material-ui/core';
import { TextField } from '../../common/Textfield';
import { Dropdown } from '../../common/Dropdown';
import {
  threatActorsOptions,
  vulnerabilitiesOptions,
} from '../../../utils/constants';
import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useFontStyles } from '../../../utils/style';
import { useScenario } from '../../../ScenarioContext';

export const ScenarioStep = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { labelSubtitle, label, h2, subtitle2 } = useFontStyles();
  const { scenario, setScenarioValue } = useScenario();

  const translatedThreatActors = threatActorsOptions.map(threatActor => {
    return {
      value: threatActor,
      /* @ts-ignore Because ts can't typecheck strings agains our keys */
      renderedValue: t(`threatActors.${threatActor}`),
    };
  });
  const translatedVulnerabilities = vulnerabilitiesOptions.map(
    vulnerability => {
      return {
        value: vulnerability,
        /* @ts-ignore Because ts can't typecheck strings agains our keys */
        renderedValue: t(`vulnerabilities.${vulnerability}`),
      };
    },
  );

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
          errorMessage={t('scenarioDrawer.titleError')}
          errorKey="scenario-title"
          required
          minRows={1}
          handleChange={value => setScenarioValue('title', value)}
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
          options={translatedThreatActors}
          handleChange={value => setScenarioValue('threatActors', value)}
          renderSelectedValue={value => {
            /* @ts-ignore */
            return t(`threatActors.${value}`);
          }}
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
          options={translatedVulnerabilities}
          handleChange={value => setScenarioValue('vulnerabilities', value)}
          renderSelectedValue={value => {
            /* @ts-ignore */
            return t(`vulnerabilities.${value}`);
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={t('dictionary.description')}
          value={scenario.description}
          minRows={4}
          handleChange={value => setScenarioValue('description', value)}
        />
      </Grid>
    </Grid>
  );
};
