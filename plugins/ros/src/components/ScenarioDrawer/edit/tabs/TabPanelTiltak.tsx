import { TiltakEdit } from '../TiltakEdit';
import { Button, Typography } from '@material-ui/core';
import Grid from '@mui/material/Grid';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { Risiko, Scenario, Tiltak as ITiltak } from '../../../utils/types';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { TextField } from '../../Textfield';
import { Dropdown } from '../../Dropdown';
import { tabStyles, useTabsTiltakStyles } from './style';
import {
  konsekvensOptions,
  sannsynlighetOptions,
} from '../../../utils/constants';
import {
  getKonsekvensLevel,
  getRestKonsekvensLevel,
  getRestSannsynlighetLevel,
  getSannsynlighetLevel,
} from '../../../utils/utilityfunctions';
import { useFontStyles } from '../../style';
import Divider from '@mui/material/Divider';

interface TabPanelTiltakProps {
  scenario: Scenario;
  updateTiltak: (tiltak: ITiltak) => void;
  deleteTiltak: (tiltak: ITiltak) => void;
  addTiltak: () => void;
  updateRestrisiko: (restrisiko: Risiko) => void;
  options: string[];
}

export const TabPanelTiltak = ({
  scenario,
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

  const { body2, subtitle1 } = useFontStyles();

  return (
    <TabPanel value="tiltak" className={tabPanel}>
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
        Legg til tiltak
      </Button>

      <Divider variant="fullWidth" style={{ paddingTop: '1.5rem' }} />

      <Grid container style={{ paddingTop: '1.5rem' }} columns={9}>
        <Grid item xs={12}>
          <Typography className={subtitle1}>Restrisiko</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography className={body2}>Risiko i dag</Typography>
        </Grid>
        <Grid item xs={1} />
        <Grid item xs={4}>
          <Typography className={body2}>
            Risiko etter planlagte tiltak
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <TextField label="Konsekvens" value={getKonsekvensLevel(scenario)} />
        </Grid>
        <Grid item xs={2}>
          <TextField
            label="Sannsynlighet"
            value={getSannsynlighetLevel(scenario)}
          />
        </Grid>
        <Grid item xs={1} className={arrow}>
          <KeyboardDoubleArrowRightIcon fontSize="large" />
        </Grid>
        <Grid item xs={2}>
          <Dropdown<number>
            label="Konsekvens"
            options={options}
            selectedValues={getRestKonsekvensLevel(scenario)}
            handleChange={setRestKonsekvens}
          />
        </Grid>
        <Grid item xs={2}>
          <Dropdown<number>
            label="Sannsynlighet"
            options={options}
            selectedValues={getRestSannsynlighetLevel(scenario)}
            handleChange={setRestSannsynlighet}
          />
        </Grid>
      </Grid>
    </TabPanel>
  );
};
