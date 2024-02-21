import React, { ChangeEvent, useState } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, IconButton, Typography } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { Dropdown } from './Dropdown';
import { TextField } from './Textfield';
import { useScenarioDrawerStyles } from './style';
import TabContext from '@material-ui/lab/TabContext';
import { TabPanelTiltak } from './tabs/TabPanelTiltak';
import { TabPanelSannsynlighet } from './tabs/TabPanelSannsynlighet';
import { TabPanelKonsekvens } from './tabs/TabPanelKonsekvens';
import { Tabs } from './tabs/Tabs';
import {
  konsekvensOptions,
  sannsynlighetOptions,
  sårbarheterOptions,
  trusselaktørerOptions,
} from '../utils/constants';
import { Risiko, Scenario, Tiltak } from '../utils/types';
import { emptyTiltak } from '../utils/utilityfunctions';

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
  const options = ['1', '2', '3', '4', '5'];
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
        sannsynlighet: sannsynlighetOptions[Number(event.target.value) - 1],
      },
    });

  const setKonsekvens = (event: ChangeEvent<{ value: unknown }>) =>
    setScenario({
      ...scenario,
      risiko: {
        ...scenario.risiko,
        konsekvens: konsekvensOptions[Number(event.target.value) - 1],
      },
    });

  const addTiltak = () =>
    setScenario({ ...scenario, tiltak: [...scenario.tiltak, emptyTiltak()] });

  const updateTiltak = (tiltak: Tiltak) => {
    const updatedTiltak = scenario.tiltak.some(t => t.ID === tiltak.ID)
      ? scenario.tiltak.map(t => (t.ID === tiltak.ID ? tiltak : t))
      : [...scenario.tiltak, tiltak];
    setScenario({ ...scenario, tiltak: updatedTiltak });
  };

  const deleteTiltak = (tiltak: Tiltak) => {
    const updatedTiltak = scenario.tiltak.filter(t => t.ID !== tiltak.ID);
    setScenario({ ...scenario, tiltak: updatedTiltak });
  };

  const updateRestrisiko = (restrisiko: Risiko) =>
    setScenario({ ...scenario, restrisiko });

  const [tab, setTab] = useState('konsekvens');

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
        </Grid>

        <Box sx={{ width: '100%', typography: 'body1' }}>
          <TabContext value={tab}>
            <Tabs setTab={setTab} />
            <TabPanelKonsekvens
              selected={
                konsekvensOptions.indexOf(scenario.risiko.konsekvens) + 1
              }
              setKonsekvens={setKonsekvens}
            />
            <TabPanelSannsynlighet
              selected={
                sannsynlighetOptions.indexOf(scenario.risiko.sannsynlighet) + 1
              }
              setSannsynlighet={setSannsynlighet}
              options={options}
            />
            <TabPanelTiltak
              scenario={scenario}
              updateTiltak={updateTiltak}
              deleteTiltak={deleteTiltak}
              addTiltak={addTiltak}
              updateRestrisiko={updateRestrisiko}
              options={options}
            />
          </TabContext>
        </Box>
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
