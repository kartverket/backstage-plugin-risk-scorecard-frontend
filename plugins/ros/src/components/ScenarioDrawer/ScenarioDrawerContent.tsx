import React, { ChangeEvent, useEffect, useState } from 'react';
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
import { emptyTiltak, Risiko, Scenario, Tiltak } from '../utils/interfaces';
import { CloseConfirmation } from './CloseConfirmation';

interface ROSDrawerContentProps {
  toggleDrawer: (isOpen: boolean) => void;
  scenario: Scenario;
  setScenario: (nyttScenario: Scenario) => void;
  saveScenario: () => void;
  clearScenario: () => void;
  isOpen: boolean;
}

export const ScenarioDrawerContent = ({
  toggleDrawer,
  scenario,
  setScenario,
  saveScenario,
  clearScenario,
  isOpen,
}: ROSDrawerContentProps) => {
  const options = ['1', '2', '3', '4', '5'];
  // sconst requiredFields = schema.properties.scenarier.items.required;

  const { header, content, icon, buttons } = useScenarioDrawerStyles();

  const [tab, setTab] = useState('konsekvens');

  const [originalScenario, setOriginalScenario] = useState<Scenario>(scenario);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
      setOriginalScenario(scenario);
    }
  }, [isOpen]);

  useEffect(() => {
    if (originalScenario) {
      setHasUnsavedChanges(
        JSON.stringify(scenario) !== JSON.stringify(originalScenario),
      );
    }
  }, [scenario, originalScenario]);

  const handleConfirmClose = () => {
    clearScenario();
    toggleDrawer(false);
    setShowCloseConfirmation(false);
  };

  const handleCloseDrawer = () => {
    if (hasUnsavedChanges) {
      setShowCloseConfirmation(true);
    } else {
      clearScenario();
      toggleDrawer(false);
    }
  };

  return (
    <>
      <Box className={header}>
        <Typography variant="h4">Risikoscenario</Typography>
        <IconButton
          key="dismiss"
          title="Close the drawer"
          onClick={() => {
            handleCloseDrawer();
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
          onClick={handleCloseDrawer}
        >
          Avbryt
        </Button>
      </Box>
      <CloseConfirmation
        isOpen={showCloseConfirmation}
        close={handleConfirmClose}
        cancel={() => setShowCloseConfirmation(false)}
      />
    </>
  );
};
