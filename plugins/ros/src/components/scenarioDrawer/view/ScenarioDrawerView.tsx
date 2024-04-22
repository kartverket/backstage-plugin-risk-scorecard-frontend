import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import { useFontStyles, useInputFieldStyles, useScenarioDrawerContentStyles } from '../style';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import { ScenarioContext } from '../../rosPlugin/ScenarioContext';
import { TiltakView } from './TiltakView';
import Divider from '@mui/material/Divider';
import {
  formatNOK,
  getKonsekvensLevel,
  getRiskMatrixColor,
  getSannsynlighetLevel,
} from '../../utils/utilityfunctions';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';

export const ScenarioDrawerView = () => {
  const { header, buttons, risikoBadge } = useScenarioDrawerContentStyles();
  const { paper } = useInputFieldStyles();

  const { h1, h3, subtitle1, body1, body2, label, button, risikoLevel } =
    useFontStyles();

  const { scenario, closeScenario, editScenario } =
    useContext(ScenarioContext)!!;

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <>
      <Box className={buttons}>
        {/* 
        <Grid item xs={2}>
       
        <Button
            className={button}
            variant="contained"
            color="primary"
            onClick={() => editScenario('scenario')}
            startIcon={<BorderColorOutlinedIcon />}
        >
          {t('dictionary.edit')}
        </Button>
         </Grid>
        */}

        <Button
            className={button}
            variant="outlined"
            color="primary"
            onClick={closeScenario}
            endIcon={<KeyboardTabIcon />}
        >
          {t('dictionary.close')}
        </Button>
      </Box>

      <Paper className={paper} style={{ padding: '1rem' }}>
      <Box className={header}>
        <Grid container>
          <Grid item xs={9}>
            <Typography variant="h3" className={h3}>
              {t('scenarioDrawer.title')}
            </Typography>
          </Grid>
          
      <Grid item xs={2}>
       <Button
           className={button}
           variant="contained"
           color="primary"
           onClick={() => editScenario('scenario')}
           startIcon={<BorderColorOutlinedIcon />}
       >
         {t('dictionary.edit')}
       </Button>
      </Grid>

          <Grid item xs={12}>
            <Typography className={h1}>{scenario.tittel}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography className={label}>
              {t('dictionary.description')}
            </Typography>
            <Typography className={body2}>{scenario.beskrivelse}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider variant="fullWidth" />
          </Grid>

          <Grid item xs={6}>
            <Typography className={label}>
              {t('dictionary.threatActors')}
            </Typography>
            {scenario.trusselaktører.map(trusselaktør => (
                <Typography className={body2}>{trusselaktør}</Typography>
            ))}
          </Grid>

          <Grid item xs={6}>
            <Typography className={label}>
              {t('dictionary.vulnerabilities')}
            </Typography>
            {scenario.sårbarheter.map(sårbarhet => (
                <Typography className={body2}>{sårbarhet}</Typography>
            ))}
          </Grid>
        </Grid>

      </Box>
      </Paper>
  

    <Paper className={paper} style={{ padding: '1rem' }}>
      {/* Startrisiko */}
      <Grid item xs={2}>
       <Button
           className={button}
           variant="contained"
           color="primary"
           onClick={() => editScenario('scenario')}
           startIcon={<BorderColorOutlinedIcon />}
       >
         {t('dictionary.edit')}
       </Button>
      </Grid>
      <Grid item xs={4}>
      {/* TODO: endre retning til column og flytte på hvordan komponentene er satt opp for risiko og sannsynlighet */}
          <Grid container>
            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <Box
                className={risikoBadge}
                style={{
                  backgroundColor: getRiskMatrixColor(scenario.risiko),
                }}
              />
              <Typography className={body2}>
                {t('dictionary.initialRisk')}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingBottom: 0 }}>
              <Typography className={label}>
                {t('dictionary.consequence')}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingBottom: 0 }}>
              <Typography className={label}>
                {t('dictionary.probability')}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: 0 }}>
              <Typography className={risikoLevel}>
                {getKonsekvensLevel(scenario.risiko)}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: 0 }}>
              <Typography className={risikoLevel}>
                {getSannsynlighetLevel(scenario.risiko)}
              </Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: 0 }}>
              <Typography className={label}>
                {t('dictionary.estimatedRisk')}
              </Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              <Typography className={body1}>
                {formatNOK(
                  scenario.risiko.konsekvens * scenario.risiko.sannsynlighet,
                )}{' '}
                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        </Paper>

     {/* Pil ikon */}
        <Grid
          item
          xs={2}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <KeyboardDoubleArrowRightIcon fontSize="large" />
        </Grid>
        
    <Paper className={paper} style={{ padding: '1rem' }}>
     {/* Restrisiko */}
     <Grid item xs={2}>
       <Button
           className={button}
           variant="contained"
           color="primary"
           onClick={() => editScenario('scenario')}
           startIcon={<BorderColorOutlinedIcon />}
       >
         {t('dictionary.edit')}
       </Button>
      </Grid>
        <Grid item xs={4}>
          <Grid container>
            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <Box
                className={risikoBadge}
                style={{
                  backgroundColor: getRiskMatrixColor(scenario.restrisiko),
                }}
              />
              <Typography className={body2}>
                {t('dictionary.restRisk')}
              </Typography>
            </Grid>

            <Grid item xs={6} style={{ paddingBottom: 0 }}>
              <Typography className={label}>
                {t('dictionary.consequence')}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingBottom: 0 }}>
              <Typography className={label}>
                {t('dictionary.probability')}
              </Typography>
            </Grid>

            <Grid item xs={6} style={{ paddingTop: 0 }}>
              <Typography className={risikoLevel}>
                {getKonsekvensLevel(scenario.restrisiko)}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: 0 }}>
              <Typography className={risikoLevel}>
                {getSannsynlighetLevel(scenario.restrisiko)}
              </Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: 0 }}>
              <Typography className={label}>
                {t('dictionary.estimatedRisk')}
              </Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              <Typography className={body1}>
                {formatNOK(
                  scenario.restrisiko.konsekvens *
                    scenario.restrisiko.sannsynlighet,
                )}{' '}
                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
    </Paper>

    <Box>
    <Grid item xs={2} />

    <Grid item xs={12}>
      <Divider variant="fullWidth" />
    </Grid>

    <Paper className={paper} style={{ padding: '1rem' }}>

    <Grid item xs={12}>
      <Typography className={h3} gutterBottom>
        {'Tiltak for å oppnå restrisiko'} {/*TODO: oppdater disse til å være dynamiske!*/} 
      </Typography>
      <Button
           className={button}
           variant="contained"
           color="primary"
           onClick={() => editScenario('scenario')}
           startIcon={<BorderColorOutlinedIcon />}
       >
         {t('dictionary.edit')}
       </Button>
      {scenario.tiltak.map((tiltak, index) => (
        <TiltakView tiltak={tiltak} index={index + 1} />
      ))}
    </Grid>
    </Paper>

    </Box>
    <Box className={buttons}>
        {/* 
        TODO: implementer sletting
        */}

        <Button
            className={button}
            variant="outlined"
            color="primary"
            onClick={closeScenario}
            endIcon={<KeyboardTabIcon />}
        >
          {'Slett'}
        </Button>
      </Box>

    </>
  );
};
