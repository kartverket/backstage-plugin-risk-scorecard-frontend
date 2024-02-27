import React, { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, IconButton, Typography } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { Dropdown } from '../Dropdown';
import { TextField } from '../Textfield';
import { useScenarioDrawerStyles } from '../style';
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
import { Risiko, Tiltak } from '../../utils/types';
import { CloseConfirmation } from './CloseConfirmation';
import {
  emptyTiltak,
  getKonsekvensLevel,
  getSannsynlighetLevel,
} from '../../utils/utilityfunctions';
import { ScenarioContext } from '../../ROSPlugin/ScenarioContext';

interface ScenarioDrawerEitProps {
  onClose: () => void;
}

export const ScenarioDrawerEdit = ({ onClose }: ScenarioDrawerEitProps) => {
  const { header, content, icon, buttons } = useScenarioDrawerStyles();

  const { scenario, setScenario, originalScenario, saveScenario } =
    useContext(ScenarioContext)!!;

  const [tab, setTab] = useState('konsekvens');

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const setTittel = (tittel: string) =>
    setScenario({
      ...scenario,
      tittel: tittel,
    });

  const setBeskrivelse = (beskrivelse: string) =>
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

  const setSannsynlighet = (sannsynlighetLevel: number) =>
    setScenario({
      ...scenario,
      risiko: {
        ...scenario.risiko,
        sannsynlighet: sannsynlighetOptions[sannsynlighetLevel - 1],
      },
    });

  const setKonsekvens = (konsekvensLevel: number) =>
    setScenario({
      ...scenario,
      risiko: {
        ...scenario.risiko,
        konsekvens: konsekvensOptions[konsekvensLevel - 1],
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

  const handleCloseDrawer = () => {
    if (JSON.stringify(scenario) !== JSON.stringify(originalScenario)) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirmation(false);
    onClose();
  };

  const handleSaveAndClose = () => {
    saveScenario();
    setIsOpen(false);
    setShowCloseConfirmation(false);
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
        </Grid>

        <Box sx={{ width: '100%', typography: 'body1' }}>
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
        save={handleSaveAndClose}
      />
    </>
  );
};
