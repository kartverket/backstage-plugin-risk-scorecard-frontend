import { Tiltak } from '../Tiltak';
import { Button, Typography } from '@material-ui/core';
import Grid from '@mui/material/Grid';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { Risiko, Scenario, Tiltak as ITiltak } from '../../utils/types';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { TextField } from '../Textfield';
import { Dropdown } from '../Dropdown';
import { tabStyles, useTabsTiltakStyles } from './style';
import { konsekvensOptions, sannsynlighetOptions } from '../../utils/constants';

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

  const setRestKonsekvens = (restKonsekvensIndex: number) => {
    updateRestrisiko({
      ...scenario.restrisiko,
      konsekvens: konsekvensOptions[restKonsekvensIndex - 1],
    });
  };

  const setRestSannsynlighet = (restSannsynlighetIndex: number) => {
    updateRestrisiko({
      ...scenario.restrisiko,
      sannsynlighet: sannsynlighetOptions[restSannsynlighetIndex - 1],
    });
  };

  const getKonsekvensIndex = () =>
    konsekvensOptions.indexOf(scenario.risiko.konsekvens) + 1;

  const getSannsynlighetIndex = () =>
    sannsynlighetOptions.indexOf(scenario.risiko.sannsynlighet) + 1;

  const getRestKonsekvensIndex = () =>
    konsekvensOptions.indexOf(scenario.restrisiko.konsekvens) + 1;

  const getRestSannsynlighetIndex = () =>
    sannsynlighetOptions.indexOf(scenario.restrisiko.sannsynlighet) + 1;

  const classes = tabStyles();

  return (
    <TabPanel value="tiltak" className={classes.tabPanel}>
      {scenario.tiltak.map((tiltak, index) => (
        <Tiltak
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
      >
        Legg til tiltak
      </Button>

      <Grid container style={{ paddingTop: '2rem' }} columns={9}>
        <Grid item xs={4}>
          <Typography variant="h6">Risiko i dag</Typography>
        </Grid>
        <Grid item xs={1} />
        <Grid item xs={4}>
          <Typography variant="h6">Etter planlagte tiltak</Typography>
        </Grid>
        <Grid item xs={2} style={{ paddingTop: 0 }}>
          <TextField label="Konsekvens" value={getKonsekvensIndex()} />
        </Grid>
        <Grid item xs={2} style={{ paddingTop: 0 }}>
          <TextField label="Sannsynlighet" value={getSannsynlighetIndex()} />
        </Grid>
        <Grid item xs={1} className={arrow}>
          <KeyboardDoubleArrowRightIcon fontSize="large" />
        </Grid>
        <Grid item xs={2} style={{ paddingTop: 0 }}>
          <Dropdown<number>
            label="Konsekvens"
            options={options}
            selectedValues={getRestKonsekvensIndex()}
            handleChange={setRestKonsekvens}
          />
        </Grid>
        <Grid item xs={2} style={{ paddingTop: 0 }}>
          <Dropdown<number>
            label="Sannsynlighet"
            options={options}
            selectedValues={getRestSannsynlighetIndex()}
            handleChange={setRestSannsynlighet}
          />
        </Grid>
      </Grid>
    </TabPanel>
  );
};
