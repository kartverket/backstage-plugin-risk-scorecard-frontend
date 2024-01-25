import React, { ChangeEvent } from 'react';
import { Box, Button, IconButton, Typography } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { Scenario } from '../interface/interfaces';
import { Dropdown } from './Dropdown';
import { Textfield } from './Textfield';
import schema from '../../ros_schema_no_v1_0.json';
import { tomtScenario } from './DrawerStyle';
import { useDrawerContentStyles } from './DrawerStyle';

interface ROSDrawerContentProps {
  toggleDrawer: (isOpen: boolean) => void;
  nyttScenario: Scenario;
  setNyttScenario: (nyttScenario: Scenario) => void;
  lagreNyttScenario: () => void;
  slettNyttScenario: () => void;
}

export const DrawerContent = ({
  toggleDrawer,
  nyttScenario,
  setNyttScenario,
  lagreNyttScenario,
  slettNyttScenario,
}: ROSDrawerContentProps) => {
  const nivaer = ['1', '2', '3', '4', '5'];
  const trusselaktorerOptions =
    schema.properties.scenarier.items.properties.trusselaktører.items.enum;
  const sarbarheterOptions =
    schema.properties.scenarier.items.properties.sårbarheter.items.enum;
  // sconst requiredFields = schema.properties.scenarier.items.required;

  const { header, content, icon, buttons } = useDrawerContentStyles();

  const setBeskrivelse = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      beskrivelse: event.target.value as string,
    });

  const setTrusselaktorer = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      trusselaktorer: event.target.value as string[],
    });

  const setSarbarheter = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      sarbarheter: event.target.value as string[],
    });

  const setSannsynlighet = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      risiko: {
        ...nyttScenario.risiko,
        sannsynlighet: event.target.value as number,
      },
    });

  const setKonsekvens = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      risiko: {
        ...nyttScenario.risiko,
        konsekvens: event.target.value as number,
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
            setNyttScenario(tomtScenario());
            toggleDrawer(false);
          }}
          color="inherit"
        >
          <Close className={icon} />
        </IconButton>
      </Box>

      <Box className={content}>
        <Textfield
          label="Beskrivelse"
          value={nyttScenario.beskrivelse}
          handleChange={setBeskrivelse}
        />

        <Dropdown
          label="Trusselaktører"
          selectedValues={nyttScenario.trusselaktorer}
          options={trusselaktorerOptions}
          handleChange={setTrusselaktorer}
          multiple
        />

        <Dropdown
          label="Sårbarheter"
          selectedValues={nyttScenario.sarbarheter}
          options={sarbarheterOptions}
          handleChange={setSarbarheter}
          multiple
        />

        <Dropdown
          label="Sannsynlighet"
          selectedValues={[nyttScenario.risiko.sannsynlighet.toString()]}
          options={nivaer}
          handleChange={setSannsynlighet}
        />

        <Dropdown
          label="Konsekvens"
          selectedValues={[nyttScenario.risiko.konsekvens.toString()]}
          options={nivaer}
          handleChange={setKonsekvens}
        />
      </Box>
      <Box className={buttons}>
        <Button
          style={{ textTransform: 'none' }}
          variant="contained"
          color="primary"
          onClick={() => lagreNyttScenario()}
        >
          Lagre
        </Button>
        <Button
          style={{ textTransform: 'none' }}
          variant="outlined"
          color="primary"
          onClick={() => {
            slettNyttScenario();
            toggleDrawer(false);
          }}
        >
          Avbryt
        </Button>
      </Box>
    </>
  );
};
