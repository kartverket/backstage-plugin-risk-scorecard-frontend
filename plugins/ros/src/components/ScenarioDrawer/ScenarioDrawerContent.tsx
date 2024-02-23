import React, { useState } from 'react';
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

  const setTittel = (tittel: string) =>
    setScenario({
      ...scenario,
      tittel: tittel,
    });

  const setDescription = (beskrivelse: string) =>
    setScenario({
      ...scenario,
      beskrivelse: beskrivelse,
    });

  const setTrusselaktører = (trusselaktører: string[]) =>
    setScenario({
      ...scenario,
      trusselaktører: trusselaktører,
    });

  const setSårbarheter = (sårbarheter: string[]) =>
    setScenario({
      ...scenario,
      sårbarheter: sårbarheter,
    });

  const getSannsynlighetIndex = () =>
    sannsynlighetOptions.indexOf(scenario.risiko.sannsynlighet) + 1;

  const setSannsynlighet = (sannsynlighetIndex: number) =>
    setScenario({
      ...scenario,
      risiko: {
        ...scenario.risiko,
        sannsynlighet: sannsynlighetOptions[sannsynlighetIndex - 1],
      },
    });

  const getKonsekvensIndex = () =>
    konsekvensOptions.indexOf(scenario.risiko.konsekvens) + 1;

  const setKonsekvens = (konsekvensIndex: number) =>
    setScenario({
      ...scenario,
      risiko: {
        ...scenario.risiko,
        konsekvens: konsekvensOptions[konsekvensIndex - 1],
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
        <Typography variant="h4">Risikoscenario</Typography>
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
              label="Tittel"
              value={scenario.tittel}
              minRows={1}
              handleChange={setTittel}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Beskrivelse"
              value={scenario.beskrivelse}
              minRows={4}
              handleChange={setDescription}
            />
          </Grid>

          <Grid item xs={6}>
            <Dropdown<string[]>
              label="Trusselaktører"
              selectedValues={scenario.trusselaktører}
              options={trusselaktørerOptions}
              handleChange={setTrusselaktører}
            />
          </Grid>

          <Grid item xs={6}>
            <Dropdown<string[]>
              label="Sårbarheter"
              selectedValues={scenario.sårbarheter}
              options={sårbarheterOptions}
              handleChange={setSårbarheter}
            />
          </Grid>
        </Grid>

        <Box sx={{ width: '100%', typography: 'body1' }}>
          <TabContext value={tab}>
            <Tabs setTab={setTab} />
            <TabPanelKonsekvens
              selected={getKonsekvensIndex()}
              setKonsekvens={setKonsekvens}
            />
            <TabPanelSannsynlighet
              selected={getSannsynlighetIndex()}
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
