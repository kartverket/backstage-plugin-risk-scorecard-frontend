import React, { ChangeEvent } from 'react';
import { Box, Button, IconButton, Typography } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { Scenario } from '../interface/interfaces';
import { Dropdown } from './Dropdown';
import { TextField } from './Textfield';
import schema from '../../ros_schema_no_v1_0.json';
import { useDrawerContentStyles } from './ScenarioDrawerStyle';

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

  const { header, content, icon, buttons } = useDrawerContentStyles();

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
        <TextField
          label="Beskrivelse"
          value={scenario.beskrivelse}
          handleChange={setBeskrivelse}
        />

        <Dropdown
          label="Trusselaktører"
          selectedValues={scenario.trusselaktører}
          options={trusselaktørerOptions}
          handleChange={setTrusselaktører}
          multiple
        />

        <Dropdown
          label="Sårbarheter"
          selectedValues={scenario.sårbarheter}
          options={sårbarheterOptions}
          handleChange={setSårbarheter}
          multiple
        />

        <Dropdown
          label="Sannsynlighet"
          selectedValues={[scenario.risiko.sannsynlighet.toString()]}
          options={nivåer}
          handleChange={setSannsynlighet}
        />

        <Dropdown
          label="Konsekvens"
          selectedValues={[scenario.risiko.konsekvens.toString()]}
          options={nivåer}
          handleChange={setKonsekvens}
        />
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
