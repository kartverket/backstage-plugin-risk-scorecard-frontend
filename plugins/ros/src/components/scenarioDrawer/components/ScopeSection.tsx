import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { Grid, Paper, Typography } from '@material-ui/core';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Divider from '@mui/material/Divider';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useFontStyles } from '../../utils/style';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import EditButton from '../../utils/EditButton';

export const ScopeSection = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h1, h3, body2, label } = useFontStyles();
  const { header, titleAndButton, section } = useScenarioDrawerStyles();
  const { scenario, editScenario } = useContext(ScenarioContext)!!;

  return (
    <Paper className={section} style={{ padding: '1rem' }}>
      <Box className={header}>
        <Grid container>
          <Grid item xs={12} className={titleAndButton}>
            <Typography variant="h3" className={h3} style={{ marginBottom: 0 }}>
              {t('scenarioDrawer.title')}
            </Typography>
            <EditButton onClick={() => editScenario('scenario')} />
          </Grid>

          <Grid item xs={12}>
            <Typography className={h1}>{scenario.title}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography className={label}>
              {t('dictionary.description')}
            </Typography>
            <Typography className={body2}>{scenario.description}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider variant="fullWidth" />
          </Grid>

          <Grid item xs={6}>
            <Typography className={label}>
              {t('dictionary.threatActors')}
            </Typography>
            {scenario.threatActors.map(threatActor => (
              <Typography key={threatActor} className={body2}>
                {threatActor}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={6}>
            <Typography className={label}>
              {t('dictionary.vulnerabilities')}
            </Typography>
            {scenario.vulnerabilities.map(vulnerability => (
              <Typography key={vulnerability} className={body2}>
                {vulnerability}
              </Typography>
            ))}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
