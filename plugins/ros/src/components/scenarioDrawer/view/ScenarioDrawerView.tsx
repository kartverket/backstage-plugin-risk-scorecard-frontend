import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, Typography } from '@material-ui/core';
import { useFontStyles, useScenarioDrawerContentStyles } from '../style';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
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

  const { h1, h2, subtitle1, body1, body2, label, button, risikoLevel } =
    useFontStyles();

  const { scenario, closeScenario, editScenario } =
    useContext(ScenarioContext)!!;

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <>
      <Box className={header}>
        <Typography variant="h1" className={h1}>
          {t('scenarioDrawer.title')}
        </Typography>
        <Box className={buttons}>
          <Button
            className={button}
            variant="contained"
            color="primary"
            onClick={() => editScenario('scenario')}
            startIcon={<BorderColorOutlinedIcon />}
          >
            {t('dictionary.edit')}
          </Button>

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
      </Box>

      <Grid container>
        <Grid item xs={12}>
          <Typography className={h2}>{scenario.title}</Typography>
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
          {scenario.threatActors.map(trusselaktør => (
            <Typography className={body2}>{trusselaktør}</Typography>
          ))}
        </Grid>

        <Grid item xs={6}>
          <Typography className={label}>
            {t('dictionary.vulnerabilities')}
          </Typography>
          {scenario.vulnerabilities.map(sårbarhet => (
            <Typography className={body2}>{sårbarhet}</Typography>
          ))}
        </Grid>

        <Grid item xs={12}>
          <Divider variant="fullWidth" />
        </Grid>

        <Grid item xs={12}>
          <Typography className={subtitle1}>{t('dictionary.risk')}</Typography>
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
                  backgroundColor: getRiskMatrixColor(scenario.risk),
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
                {getKonsekvensLevel(scenario.risk)}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: 0 }}>
              <Typography className={risikoLevel}>
                {getSannsynlighetLevel(scenario.risk)}
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
                  scenario.risk.consequence * scenario.risk.probability,
                )}{' '}
                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
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
                  backgroundColor: getRiskMatrixColor(scenario.remainingRisk),
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
                {getKonsekvensLevel(scenario.remainingRisk)}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: 0 }}>
              <Typography className={risikoLevel}>
                {getSannsynlighetLevel(scenario.remainingRisk)}
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
                  scenario.remainingRisk.consequence *
                    scenario.remainingRisk.probability,
                )}{' '}
                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
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
            {t('dictionary.measure')}
          </Typography>
          {scenario.actions.map((tiltak, index) => (
            <TiltakView tiltak={tiltak} index={index + 1} />
          ))}
        </Grid>
      </Grid>
    </>
  );
};
