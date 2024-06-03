import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Divider from '@mui/material/Divider';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import EditIcon from '@mui/icons-material/Edit';
import { useFontStyles } from '../../utils/style';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';

export const ScopeSection = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h1, h3, body2, label, button } = useFontStyles();
  const { header, titleAndButton, section, editIcon } =
    useScenarioDrawerStyles();
  const { scenario, editScenario } = useContext(ScenarioContext)!!;

  return (
    <Paper className={section} style={{ padding: '1rem' }}>
      <Box className={header}>
        <Grid container>
          <Grid item xs={12} className={titleAndButton}>
            <Typography variant="h3" className={h3}>
              {t('scenarioDrawer.title')}
            </Typography>
            <Button
              className={button}
              variant="text"
              color="primary"
              onClick={() => editScenario('scenario')}
              startIcon={<EditIcon className={editIcon} aria-label="Edit" />}
            />
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
              <Typography key={threatActor} className={body2}>{threatActor}</Typography>
            ))}
          </Grid>

          <Grid item xs={6}>
            <Typography className={label}>
              {t('dictionary.vulnerabilities')}
            </Typography>
            {scenario.vulnerabilities.map(vulnerability => (
              <Typography key={vulnerability} className={body2}>{vulnerability}</Typography>
            ))}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
