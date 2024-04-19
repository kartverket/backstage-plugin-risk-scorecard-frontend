import React, { useContext } from 'react';
import { ScenarioContext } from '../../rosPlugin/ScenarioContext';
import { useFontStyles } from '../../scenarioDrawer/style';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Box from '@material-ui/core/Box';
import { Button, Typography } from '@material-ui/core';
import Grid from '@mui/material/Grid';
import { TextField } from '../../utils/Textfield';
import { TiltakEdit } from '../../scenarioDrawer/edit/tabs/tiltak/TiltakEdit';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

export const InitiativesStep = () => {
  const {
    scenario,
    setEksisterendeTiltak,
    updateTiltak,
    deleteTiltak,
    addTiltak,
  } = useContext(ScenarioContext)!!;

  const { h2, subtitle2, tiltakSubtitle } = useFontStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Box>
      <Typography className={h2}>{t('dictionary.measure')}</Typography>
      <Typography className={subtitle2}>
        {t('scenarioDrawer.measureTab.subtitle')}
      </Typography>
      <Grid item xs={12} style={{ paddingTop: '1.5rem' }}>
        <TextField
          label={t('scenarioDrawer.measureTab.existingMeasure')}
          subtitle={t('scenarioDrawer.measureTab.existingMeasureSubtitle')}
          value={scenario.eksisterendeTiltak}
          handleChange={setEksisterendeTiltak}
          minRows={3}
        />
      </Grid>
      <Typography variant="h6" className={tiltakSubtitle}>
        {t('scenarioDrawer.measureTab.plannedMeasures')}
      </Typography>
      {scenario.tiltak.map((tiltak, index) => (
        <TiltakEdit
          tiltak={tiltak}
          index={index + 1}
          updateTiltak={updateTiltak}
          deleteTiltak={deleteTiltak}
        />
      ))}

      <Button
        startIcon={<AddCircleOutlineIcon />}
        color="primary"
        onClick={addTiltak}
        style={{ textTransform: 'none' }}
      >
        {t('scenarioDrawer.measureTab.addMeasureButton')}
      </Button>
    </Box>
  );
};
