import { Tiltak } from '../Tiltak';
import { Button, Typography } from '@material-ui/core';
import Grid from '@mui/material/Grid';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import TabPanel from '@material-ui/lab/TabPanel';
import React, { ChangeEvent } from 'react';
import {
  Risiko,
  Scenario,
  Tiltak as ITiltak,
} from '../../interface/interfaces';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { TextField } from '../Textfield';
import { Dropdown } from '../Dropdown';
import { useTabsTiltakStyles } from './style';

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

  const setRestKonsekvens = (event: ChangeEvent<{ value: unknown }>) => {
    updateRestrisiko({
      ...scenario.restrisiko,
      konsekvens: Number(event.target.value),
    });
  };

  const setRestSannsynlighet = (event: ChangeEvent<{ value: unknown }>) => {
    updateRestrisiko({
      ...scenario.restrisiko,
      sannsynlighet: Number(event.target.value),
    });
  };

  return (
    <TabPanel value="tiltak">
      {scenario.tiltak.map(tiltak => (
        <Tiltak
          tiltak={tiltak}
          updateTiltak={updateTiltak}
          deleteTiltak={deleteTiltak}
        />
      ))}

      <Button
        startIcon={<AddCircleOutlineIcon />}
        variant="text"
        color="primary"
        onClick={addTiltak}
        style={{ textTransform: 'none', paddingTop: '2rem' }}
      >
        Legg til tiltak
      </Button>

      <Grid container style={{ paddingTop: '2rem' }} columns={9}>
        <Grid item xs={4}>
          <Typography variant="h5">Risiko i dag</Typography>
        </Grid>
        <Grid item xs={1}></Grid>
        <Grid item xs={4}>
          <Typography variant="h5">Etter planlagte tiltak</Typography>
        </Grid>
        <Grid item xs={2} style={{ paddingTop: 0 }}>
          <TextField
            label="Konsekvens"
            value={scenario.risiko.konsekvens.toString()}
            disabled={true}
          />
        </Grid>
        <Grid item xs={2} style={{ paddingTop: 0 }}>
          <TextField
            label="Sannsynlighet"
            value={scenario.risiko.sannsynlighet.toString()}
            disabled={true}
          />
        </Grid>
        <Grid item xs={1} className={arrow}>
          <KeyboardDoubleArrowRightIcon fontSize="large" />
        </Grid>
        <Grid item xs={2} style={{ paddingTop: 0 }}>
          <Dropdown
            label={'Konsekvens'}
            options={options}
            selectedValues={[scenario.restrisiko.konsekvens.toString()]}
            handleChange={setRestKonsekvens}
          />
        </Grid>
        <Grid item xs={2} style={{ paddingTop: 0 }}>
          <Dropdown
            label={'Sannsynlighet'}
            options={options}
            selectedValues={[scenario.restrisiko.sannsynlighet.toString()]}
            handleChange={setRestSannsynlighet}
          />
        </Grid>
      </Grid>
    </TabPanel>
  );
};
