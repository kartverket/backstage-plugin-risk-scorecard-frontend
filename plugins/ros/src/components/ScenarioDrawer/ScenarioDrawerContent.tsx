import React, { ChangeEvent } from 'react';
import { Box, Button, Grid, IconButton, Typography } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { Scenario, Tiltak as ITiltak } from '../interface/interfaces';
import { Dropdown } from './Dropdown';
import { TextField } from './Textfield';
import schema from '../../ros_schema_no_v1_0.json';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { Tiltak } from './Tiltak';
import { useScenarioDrawerStyles } from './ScenarioDrawerStyle';

interface ROSDrawerContentProps {
  toggleDrawer: (isOpen: boolean) => void;
  scenario: Scenario;
  setScenario: (nyttScenario: Scenario) => void;
  saveScenario: () => void;
  clearScenario: () => void;
}

export const ScenarioDrawerContent = ({
  toggleDrawer,
  scenario,
  setScenario,
  saveScenario,
  clearScenario,
}: ROSDrawerContentProps) => {
  const nivåer = ['1', '2', '3', '4', '5'];
  const trusselaktørerOptions =
    schema.properties.scenarier.items.properties.trusselaktører.items.enum;
  const sårbarheterOptions =
    schema.properties.scenarier.items.properties.sårbarheter.items.enum;
  // sconst requiredFields = schema.properties.scenarier.items.required;

  const { header, content, icon, buttons } = useScenarioDrawerStyles();

  const setBeskrivelse = (event: ChangeEvent<{ value: unknown }>) =>
    setScenario({
      ...scenario,
      beskrivelse: event.target.value as string,
    });

  const setTrusselaktører = (event: ChangeEvent<{ value: unknown }>) =>
    setScenario({
      ...scenario,
      trusselaktører: event.target.value as string[],
    });

  const setSårbarheter = (event: ChangeEvent<{ value: unknown }>) =>
    setScenario({
      ...scenario,
      sårbarheter: event.target.value as string[],
    });

  const setSannsynlighet = (event: ChangeEvent<{ value: unknown }>) =>
    setScenario({
      ...scenario,
      risiko: {
        ...scenario.risiko,
        sannsynlighet: Number(event.target.value),
      },
    });

  const setKonsekvens = (event: ChangeEvent<{ value: unknown }>) =>
    setScenario({
      ...scenario,
      risiko: {
        ...scenario.risiko,
        konsekvens: Number(event.target.value),
      },
    });

  const addTiltak = () =>
    setScenario({ ...scenario, tiltak: [...scenario.tiltak, emptyTiltak()] });

  const updateTiltak = (tiltak: ITiltak) => {
    const updatedTiltak = scenario.tiltak.some(t => t.ID === tiltak.ID)
      ? scenario.tiltak.map(t => (t.ID === tiltak.ID ? tiltak : t))
      : [...scenario.tiltak, tiltak];
    setScenario({ ...scenario, tiltak: updatedTiltak });
  };

  const deleteTiltak = (tiltak: ITiltak) => {
    const updatedTiltak = scenario.tiltak.filter(t => t.ID !== tiltak.ID);
    setScenario({ ...scenario, tiltak: updatedTiltak });
  };

  return (
    <>
      <Box className={header}>
        <Typography variant="h4">Nytt risikoscenario</Typography>
        <IconButton
          key="dismiss"
          title="Close the drawer"
          onClick={() => {
            clearScenario();
            toggleDrawer(false);
          }}
          color="inherit"
        >
          <Close className={icon} />
        </IconButton>
      </Box>

      <Box className={content}>
        <Grid container>
          <Grid item xs={12}>
            <TextField
              label="Beskrivelse"
              value={scenario.beskrivelse}
              minRows={4}
              handleChange={setBeskrivelse}
            />
          </Grid>

          <Grid item xs={6}>
            <Dropdown
              label="Trusselaktører"
              selectedValues={scenario.trusselaktører}
              options={trusselaktørerOptions}
              handleChange={setTrusselaktører}
              multiple
            />
          </Grid>

          <Grid item xs={6}>
            <Dropdown
              label="Sårbarheter"
              selectedValues={scenario.sårbarheter}
              options={sårbarheterOptions}
              handleChange={setSårbarheter}
              multiple
            />
          </Grid>

          <Grid item xs={6}>
            <Dropdown
              label="Sannsynlighet"
              selectedValues={[scenario.risiko.sannsynlighet.toString()]}
              options={nivåer}
              handleChange={setSannsynlighet}
            />
          </Grid>

          <Grid item xs={6}>
            <Dropdown
              label="Konsekvens"
              selectedValues={[scenario.risiko.konsekvens.toString()]}
              options={nivåer}
              handleChange={setKonsekvens}
            />
          </Grid>
        </Grid>

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
        >
          Legg til tiltak
        </Button>
      </Box>

      <Box className={buttons}>
        <Button
          style={{ textTransform: 'none' }}
          variant="contained"
          color="primary"
          onClick={() => saveScenario()}
        >
          Lagre
        </Button>

        <Button
          style={{ textTransform: 'none' }}
          variant="outlined"
          color="primary"
          onClick={() => {
            clearScenario();
            toggleDrawer(false);
          }}
        >
          Avbryt
        </Button>
      </Box>
    </>
  );
};

const emptyTiltak = (): ITiltak => ({
  ID: Math.floor(Math.random() * 100000),
  beskrivelse: '',
  tiltakseier: '',
  frist: new Date().toISOString().split('T')[0],
  status: 'Ikke startet',
  restrisiko: {
    oppsummering: '',
    sannsynlighet: 1,
    konsekvens: 1,
  },
});
