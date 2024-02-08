import { Tiltak } from '../Tiltak';
import { Button } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { Scenario } from '../../interface/interfaces';
import { Tiltak as ITiltak } from '../../interface/interfaces';

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
        style={{ textTransform: 'none', paddingTop: '1rem' }}
      >
        Legg til tiltak
      </Button>
    </TabPanel>
  );
};
