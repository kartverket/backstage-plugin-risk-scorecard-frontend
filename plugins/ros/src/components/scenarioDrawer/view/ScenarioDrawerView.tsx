import React, { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import { useFontStyles, useInputFieldStyles, useScenarioDrawerContentStyles } from '../style';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import { CloseConfirmation } from '../edit/CloseConfirmation';
import DeleteIcon from '@mui/icons-material/Delete';
import { DeleteConfirmation } from '../edit/DeleteConfirmation';
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
  const { header, buttons, risikoBadge, titleAndButton } = useScenarioDrawerContentStyles();
  const { paper } = useInputFieldStyles();

  const { h1, h3, body1, body2, label, button } =
    useFontStyles();

  const { scenario, saveScenario, openDeleteConfirmation, closeScenario, editScenario } =
    useContext(ScenarioContext)!!;

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const close = () => {
    closeScenario();
    setShowCloseConfirmation(false);
  };

  const saveAndClose = () => {
    if (saveScenario()) {
      close();
    }
  };

  return (
    <>
      <Box className={buttons}
        style={{
          marginBottom: '36px',
          display: 'flex',
          flexDirection: 'row',
          gap: '0.5rem',
          justifyContent: 'flex-end'
        }}>
        <Button
          className={button}
          variant="outlined"
          color="primary"
          onClick={closeScenario}
        >
          {t('dictionary.close')}
        </Button>
      </Box>

      <Paper className={paper} style={{ padding: '1rem' }}>
        <Box className={header}>
          <Grid container>
            <Grid item xs={12} className={titleAndButton}
            >
              <Typography variant="h3" className={h3}>
                {t('scenarioDrawer.title')}
              </Typography>
              <Button
                className={button}
                variant="text"
                color="primary"
                onClick={() => editScenario('scenario')}
                startIcon={<BorderColorOutlinedIcon />}
              />
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

      {/* Initial risk -> Rest risk*/}
      <Grid
        item
        xs={12}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >

        <Paper className={paper} style={{ padding: '1rem' }}>
          <Grid item xs={12} className={titleAndButton}>
            <Typography className={h3}>
              {t('dictionary.initialRisk')}
            </Typography>
            <Button
              className={button}
              variant="text"
              color="primary"
              onClick={() => editScenario('initialRisk')}
              startIcon={<BorderColorOutlinedIcon />}
            />
          </Grid>


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
              <Grid
                item
                xs={12}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                }}
              >
                <Typography className={label}>
                  {t('dictionary.consequence')}: {getKonsekvensLevel(scenario.risiko)}
                </Typography>
                <Typography className={label}>
                  {t('dictionary.probability')}: {getSannsynlighetLevel(scenario.risiko)}
                </Typography>
              </Grid>
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
        </Paper>

        {/* Arrow */}
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
          <Grid item xs={12} className={titleAndButton}>
            <Typography className={h3}>
              {t('dictionary.restRisk')}
            </Typography>
            <Button
              className={button}
              variant="text"
              color="primary"
              onClick={() => editScenario('restRisk')}
              startIcon={<BorderColorOutlinedIcon />}
            />
          </Grid>

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

              <Grid
                item
                xs={12}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                }}
              >
                <Typography className={label}>
                  {t('dictionary.consequence')}: {getKonsekvensLevel(scenario.restrisiko)}
                </Typography>
                <Typography className={label}>
                  {t('dictionary.probability')}: {getSannsynlighetLevel(scenario.restrisiko)}
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: 0 }}>
              <Typography className={label}>
                {t('dictionary.estimatedRisk')}
              </Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              <Typography className={body1}>
                {formatNOK(
                  scenario.restrisiko.konsekvens * scenario.restrisiko.sannsynlighet,
                )}{' '}
                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Box>
        <Paper className={paper} style={{ padding: '1rem' }}>
          <Grid item xs={12} className={titleAndButton} style={{
            marginBottom: '12px'
          }}>
            <Typography className={h3} gutterBottom>
              {'Tiltak for å oppnå restrisiko'} {/*TODO: oppdater disse til å være dynamiske!*/}
            </Typography>
            <Button
              className={button}
              variant="text"
              color="primary"
              onClick={() => editScenario('measure')}
              startIcon={<BorderColorOutlinedIcon />}
            >
            </Button>
          </Grid>
          {scenario.tiltak.map((tiltak, index) => (
            <TiltakView tiltak={tiltak} index={index + 1} />
          ))}
        </Paper>

      </Box>
      <Box className={buttons}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '0.5rem',
          justifyContent: 'flex-start'
        }}>
        <Button
          startIcon={<DeleteIcon />}
          variant="text"
          color="primary"
          onClick={openDeleteConfirmation}
        >
          {t('scenarioDrawer.deleteScenarioButton')}
        </Button>
      </Box>

      <DeleteConfirmation />

      <CloseConfirmation
        isOpen={showCloseConfirmation}
        close={close}
        save={saveAndClose}
      />
    </>
  );
};
