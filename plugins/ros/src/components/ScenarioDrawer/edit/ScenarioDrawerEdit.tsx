import React, { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, Typography } from '@material-ui/core';
import { Dropdown } from '../Dropdown';
import { TextField } from '../Textfield';
import { useFontStyles, useScenarioDrawerContentStyles } from '../style';
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
} from '../../utils/constants';
import { CloseConfirmation } from './CloseConfirmation';
import {
  getKonsekvensLevel,
  getSannsynlighetLevel,
} from '../../utils/utilityfunctions';
import { ScenarioContext } from '../../ROSPlugin/ScenarioContext';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';

interface ScenarioDrawerEitProps {
  onClose: () => void;
}

export const ScenarioDrawerEdit = ({ onClose }: ScenarioDrawerEitProps) => {
  const { header, buttons } = useScenarioDrawerContentStyles();
  const { h1, button } = useFontStyles();

  const {
    scenario,
    originalScenario,
    saveScenario,
    setTittel,
    setBeskrivelse,
    setTrusselaktører,
    setSårbarheter,
    setSannsynlighet,
    setKonsekvens,
    addTiltak,
    updateTiltak,
    deleteTiltak,
    updateRestrisiko,
  } = useContext(ScenarioContext)!!;

  const [tab, setTab] = useState('konsekvens');

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const handleCloseDrawer = () => {
    if (JSON.stringify(scenario) !== JSON.stringify(originalScenario)) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  const close = () => {
    onClose();
    setShowCloseConfirmation(false);
  };

  const saveAndClose = () => {
    saveScenario();
    close();
  };

  return (
    <>
      <Box className={header}>
        <Typography variant="h1" className={h1}>
          Risikoscenario
        </Typography>
        <Button
          className={button}
          variant="outlined"
          color="primary"
          onClick={onClose}
          endIcon={<KeyboardTabIcon />}
        >
          Lukk
        </Button>
      </Box>

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
            handleChange={setBeskrivelse}
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

        <Grid item xs={12}>
          <TabContext value={tab}>
            <Tabs setTab={setTab} />
            <TabPanelKonsekvens
              selected={getKonsekvensLevel(scenario)}
              setKonsekvens={setKonsekvens}
            />
            <TabPanelSannsynlighet
              selected={getSannsynlighetLevel(scenario)}
              setSannsynlighet={setSannsynlighet}
              options={sannsynlighetOptions.map((_, index) =>
                (index + 1).toString(),
              )}
            />
            <TabPanelTiltak
              scenario={scenario}
              updateTiltak={updateTiltak}
              deleteTiltak={deleteTiltak}
              addTiltak={addTiltak}
              updateRestrisiko={updateRestrisiko}
              options={konsekvensOptions.map((_, index) =>
                (index + 1).toString(),
              )}
            />
          </TabContext>
        </Grid>

        <Grid item xs={12} className={buttons} style={{ paddingTop: '2rem' }}>
          <Button
            style={{ textTransform: 'none' }}
            variant="contained"
            color="primary"
            onClick={saveAndClose}
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
        </Grid>
      </Grid>

      <CloseConfirmation
        isOpen={showCloseConfirmation}
        close={close}
        save={saveAndClose}
      />
    </>
  );
};
