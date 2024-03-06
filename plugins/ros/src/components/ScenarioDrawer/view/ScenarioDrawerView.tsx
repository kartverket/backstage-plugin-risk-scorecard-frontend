import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, Typography } from '@material-ui/core';
import { useFontStyles, useScenarioDrawerContentStyles } from '../style';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import { ScenarioContext } from '../../ROSPlugin/ScenarioContext';
import { TiltakView } from './TiltakView';
import Divider from '@mui/material/Divider';
import {
  formatNOK,
  getKonsekvensLevel,
  getRestKonsekvensLevel,
  getRestSannsynlighetLevel,
  getRiskMatrixColor,
  getSannsynlighetLevel,
} from '../../utils/utilityfunctions';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

export const ScenarioDrawerView = () => {
  const { header, buttons, risikoBadge } = useScenarioDrawerContentStyles();

  const { h1, h2, subtitle1, body1, body2, label, button, risikoLevel } =
    useFontStyles();

  const { scenario, closeScenarioDrawer, openScenarioDrawerEdit } =
    useContext(ScenarioContext)!!;

  return (
    <>
      <Box className={header}>
        <Typography variant="h1" className={h1}>
          Risikoscenario
        </Typography>
        <Box className={buttons}>
          <Button
            className={button}
            variant="contained"
            color="primary"
            onClick={openScenarioDrawerEdit}
            startIcon={<BorderColorOutlinedIcon />}
          >
            Rediger
          </Button>

          <Button
            className={button}
            variant="outlined"
            color="primary"
            onClick={closeScenarioDrawer}
            endIcon={<KeyboardTabIcon />}
          >
            Lukk
          </Button>
        </Box>
      </Box>

      <Grid container>
        <Grid item xs={12}>
          <Typography className={h2}>{scenario.tittel}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography className={label}>Beskrivelse</Typography>
          <Typography className={body2}>{scenario.beskrivelse}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider variant="fullWidth" />
        </Grid>

        <Grid item xs={6}>
          <Typography className={label}>Trusselaktører</Typography>
          {scenario.trusselaktører.map(trusselaktør => (
            <Typography className={body2}>{trusselaktør}</Typography>
          ))}
        </Grid>

        <Grid item xs={6}>
          <Typography className={label}>Sårbarheter</Typography>
          {scenario.sårbarheter.map(sårbarhet => (
            <Typography className={body2}>{sårbarhet}</Typography>
          ))}
        </Grid>

        <Grid item xs={12}>
          <Divider variant="fullWidth" />
        </Grid>

        <Grid item xs={12}>
          <Typography className={subtitle1}>Risiko</Typography>
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
                  backgroundColor: getRiskMatrixColor(scenario.risiko),
                }}
              />
              <Typography className={body2}>I dag</Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingBottom: 0 }}>
              <Typography className={label}>Konsekvens</Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingBottom: 0 }}>
              <Typography className={label}>Sannsynlighet</Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: 0 }}>
              <Typography className={risikoLevel}>
                {getKonsekvensLevel(scenario)}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: 0 }}>
              <Typography className={risikoLevel}>
                {getSannsynlighetLevel(scenario)}
              </Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: 0 }}>
              <Typography className={label}>Forventet kostnad</Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              <Typography className={body1}>
                {formatNOK(
                  scenario.risiko.konsekvens * scenario.risiko.sannsynlighet,
                )}{' '}
                kr / år
              </Typography>
            </Grid>
          </Grid>
        </Grid>

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
              <Typography className={body2}>Etter planlagte tiltak</Typography>
            </Grid>

            <Grid item xs={6} style={{ paddingBottom: 0 }}>
              <Typography className={label}>Konsekvens</Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingBottom: 0 }}>
              <Typography className={label}>Sannsynlighet</Typography>
            </Grid>

            <Grid item xs={6} style={{ paddingTop: 0 }}>
              <Typography className={risikoLevel}>
                {getRestKonsekvensLevel(scenario)}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: 0 }}>
              <Typography className={risikoLevel}>
                {getRestSannsynlighetLevel(scenario)}
              </Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: 0 }}>
              <Typography className={label}>Forventet kostnad</Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              <Typography className={body1}>
                {formatNOK(
                  scenario.restrisiko.konsekvens *
                    scenario.restrisiko.sannsynlighet,
                )}{' '}
                kr / år
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={2} />

        <Grid item xs={12}>
          <Divider variant="fullWidth" />
        </Grid>

        <Grid item xs={12}>
          <Typography className={body2} gutterBottom>
            Tiltak
          </Typography>
          {scenario.tiltak.map((tiltak, index) => (
            <TiltakView tiltak={tiltak} index={index + 1} />
          ))}
        </Grid>
      </Grid>
    </>
  );
};
