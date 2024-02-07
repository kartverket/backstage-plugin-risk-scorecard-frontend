import { Tiltak } from '../Tiltak';
import { Button, Grid, Icon } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { Scenario } from '../../interface/interfaces';
import { Tiltak as ITiltak } from '../../interface/interfaces';
import { KeyboardArrowRight } from '@material-ui/icons';

interface TabPanelTiltakProps {
  scenario: Scenario;
  updateTiltak: (tiltak: ITiltak) => void;
  deleteTiltak: (tiltak: ITiltak) => void;
  addTiltak: () => void;
}

export const TabPanelTiltak = ({
  scenario,
  updateTiltak,
  deleteTiltak,
  addTiltak,
}: TabPanelTiltakProps) => {
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

      <Grid container style={{ paddingTop: '2rem' }}>
        <Grid item xs={2} style={konsekvens}></Grid>
        <Grid item xs={2} style={sannsynlighet}></Grid>
        <Grid item xs={1} style={space} />
        <Grid item xs={2} style={arrows}>
          <KeyboardArrowRight />
          <KeyboardArrowRight />
        </Grid>
        <Grid item xs={1} style={space} />
        <Grid item xs={2} style={konsekvens}></Grid>
        <Grid item xs={2} style={sannsynlighet}></Grid>
      </Grid>
    </TabPanel>
  );
};

const konsekvens = {
  backgroundColor: 'blue',
};

const sannsynlighet = {
  backgroundColor: 'green',
};

const space = {
  backgroundColor: 'yellow',
};

const arrows = {
  backgroundColor: 'red',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#1DB954',
};
