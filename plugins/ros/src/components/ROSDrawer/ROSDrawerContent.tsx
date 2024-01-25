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
  const nivåer = ['1', '2', '3', '4', '5'];
  const trusselaktørerOptions =
    schema.properties.scenarier.items.properties.trusselaktører.items.enum;
  const sårbarheterOptions =
    schema.properties.scenarier.items.properties.sårbarheter.items.enum;
  // sconst requiredFields = schema.properties.scenarier.items.required;

  const { header, content, icon, buttons } = useDrawerContentStyles();

  const setBeskrivelse = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      beskrivelse: event.target.value as string,
    });

  const setTrusselaktører = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      trusselaktører: event.target.value as string[],
    });

  const setSårbarheter = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      sårbarheter: event.target.value as string[],
    });

  const setSannsynlighet = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      risiko: {
        ...nyttScenario.risiko,
        sannsynlighet: Number(event.target.value),
      },
    });

  const setKonsekvens = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      risiko: {
        ...nyttScenario.risiko,
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
          selectedValues={nyttScenario.trusselaktører}
          options={trusselaktørerOptions}
          handleChange={setTrusselaktører}
          multiple
        />

        <Dropdown
          label="Sårbarheter"
          selectedValues={nyttScenario.sårbarheter}
          options={sårbarheterOptions}
          handleChange={setSårbarheter}
          multiple
        />

        <Dropdown
          label="Sannsynlighet"
          selectedValues={[nyttScenario.risiko.sannsynlighet.toString()]}
          options={nivåer}
          handleChange={setSannsynlighet}
        />

        <Dropdown
          label="Konsekvens"
          selectedValues={[nyttScenario.risiko.konsekvens.toString()]}
          options={nivåer}
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
