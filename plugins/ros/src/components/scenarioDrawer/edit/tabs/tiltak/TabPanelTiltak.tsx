import { TiltakEdit } from './TiltakEdit';
import { Button, Typography } from '@material-ui/core';
import Grid from '@mui/material/Grid';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { Risiko, Scenario, Tiltak as ITiltak } from '../../../../utils/types';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { TextField } from '../../../../utils/Textfield';
import { Dropdown } from '../../../../utils/Dropdown';
import { tabStyles, useTabsTiltakStyles } from '../style';
import {
  konsekvensOptions,
  sannsynlighetOptions,
} from '../../../../utils/constants';
import {
  getKonsekvensLevel,
  getSannsynlighetLevel,
} from '../../../../utils/utilityfunctions';
import { useFontStyles } from '../../../style';
import Divider from '@mui/material/Divider';
import { pluginRiScTranslationRef } from '../../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

interface TabPanelTiltakProps {
  scenario: Scenario;
  setEksisterendeTiltak: (eksisterendeTiltak: string) => void;
  updateTiltak: (tiltak: ITiltak) => void;
  deleteTiltak: (tiltak: ITiltak) => void;
  addTiltak: () => void;
  updateRestrisiko: (restrisiko: Risiko) => void;
  options: string[];
}

export const TabPanelTiltak = ({
  scenario,
  setEksisterendeTiltak,
  updateTiltak,
  deleteTiltak,
  addTiltak,
  updateRestrisiko,
  options,
}: TabPanelTiltakProps) => {
  const { arrow } = useTabsTiltakStyles();

  const setRestKonsekvens = (restKonsekvensLevel: number) => {
    updateRestrisiko({
      ...scenario.restrisiko,
      konsekvens: konsekvensOptions[restKonsekvensLevel - 1],
    });
  };

  const setRestSannsynlighet = (restSannsynlighetLevel: number) => {
    updateRestrisiko({
      ...scenario.restrisiko,
      sannsynlighet: sannsynlighetOptions[restSannsynlighetLevel - 1],
    });
  };

  const { tabPanel } = tabStyles();

  const { body2, headerSubtitle, tiltakSubtitle } = useFontStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <TabPanel value="tiltak" className={tabPanel}>
      <Typography variant="h5">{t('dictionary.measure')}</Typography>
      <Typography className={headerSubtitle}>
        {t('scenarioDrawer.measureTab.subtitle')}
      </Typography>
      <Grid item xs={12}>
        <TextField
            label={t('scenarioDrawer.measureTab.existingMeasure')}
            subtitle={t('scenarioDrawer.measureTab.existingMeasureSubtitle')}
            value={scenario.eksisterendeTiltak}
            handleChange={setEksisterendeTiltak}
            minRows={3}
        />
      </Grid>
      <Typography variant="h6" className={tiltakSubtitle}>{t('scenarioDrawer.measureTab.plannedMeasures')}</Typography>
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

      <Divider variant="fullWidth" style={{ paddingTop: '1.5rem' }} />

      <Grid container style={{ paddingTop: '1.5rem' }} columns={9}>
        <Grid item xs={12}>
          <Typography variant="h5">{t('dictionary.restRisk')}</Typography>
          <Typography className={headerSubtitle}>
            {t('scenarioDrawer.restRiskTab.subtitle')}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography className={body2}>
            {t('dictionary.initialRisk')}
          </Typography>
        </Grid>
        <Grid item xs={1} />
        <Grid item xs={4}>
          <Typography className={body2}>{t('dictionary.restRisk')}</Typography>
        </Grid>
        <Grid item xs={2}>
          <TextField
            label={t('dictionary.consequence')}
            value={getKonsekvensLevel(scenario.risiko)}
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            label={t('dictionary.probability')}
            value={getSannsynlighetLevel(scenario.risiko)}
          />
        </Grid>
        <Grid item xs={1} className={arrow}>
          <KeyboardDoubleArrowRightIcon fontSize="large" />
        </Grid>
        <Grid item xs={2}>
          <Dropdown<number>
            label={t('dictionary.consequence')}
            options={options}
            selectedValues={getKonsekvensLevel(scenario.restrisiko)}
            handleChange={setRestKonsekvens}
          />
        </Grid>
        <Grid item xs={2}>
          <Dropdown<number>
            label={t('dictionary.probability')}
            options={options}
            selectedValues={getSannsynlighetLevel(scenario.restrisiko)}
            handleChange={setRestSannsynlighet}
          />
        </Grid>
      </Grid>
    </TabPanel>
  );
};
