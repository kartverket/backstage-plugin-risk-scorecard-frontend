import React, { ChangeEvent } from "react";
import { Box, Button, IconButton, Typography } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { Scenario } from "../interface/interfaces";
import { Dropdown } from "./Dropdown";
import { Textfield } from "./Textfield";
import schema from "../../ros_schema_no_v1_0.json";
import { tomtScenario } from "./DrawerStyle";
import { useDrawerContentStyles } from "./DrawerStyle";

interface ROSDrawerContentProps {
  toggleDrawer: (isOpen: boolean) => void;
  nyttScenario: Scenario;
  setNyttScenario: (nyttScenario: Scenario) => void;
  lagreNyttScenario: () => void;
  slettNyttScenario: () => void;
}

export const DrawerContent = (
  {
    toggleDrawer,
    nyttScenario,
    setNyttScenario,
    lagreNyttScenario,
    slettNyttScenario
  }: ROSDrawerContentProps
) => {

  const nivåer = ["1", "2", "3", "4", "5"];
  const trusselaktørerOptions = schema.properties.scenarier.items.properties.trusselaktører.items.enum;
  const sårbarheterOptions = schema.properties.scenarier.items.properties.trusselaktører.items.enum;
  // sconst requiredFields = schema.properties.scenarier.items.required;

  const { header, content, icon, buttons } = useDrawerContentStyles();

  const setBeskrivelse = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({ ...nyttScenario, beskrivelse: event.target.value as string });

  const setTrusselaktører = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({ ...nyttScenario, trusselaktører: event.target.value as string[] });

  const setSårbarheter = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({ ...nyttScenario, sårbarheter: event.target.value as string[] });

  const setSannsynlighet = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      risiko: { ...nyttScenario.risiko, sannsynlighet: event.target.value as number }
    });

  const setKonsekvens = (event: ChangeEvent<{ value: unknown }>) =>
    setNyttScenario({
      ...nyttScenario,
      risiko: { ...nyttScenario.risiko, konsekvens: event.target.value as number }
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
          selected={nyttScenario.trusselaktører}
          options={trusselaktørerOptions}
          handleChange={setTrusselaktører}
          multiple
        />

        <Dropdown
          label="Sårbarheter"
          selected={nyttScenario.sårbarheter}
          options={sårbarheterOptions}
          handleChange={setSårbarheter}
          multiple
        />

        <Dropdown
          label="Sannsynlighet"
          selected={[nyttScenario.risiko.sannsynlighet.toString()]}
          options={nivåer}
          handleChange={setSannsynlighet}
        />

        <Dropdown
          label="Konsekvens"
          selected={[nyttScenario.risiko.konsekvens.toString()]}
          options={nivåer}
          handleChange={setKonsekvens}
        />

      </Box>
      <Box className={buttons}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => lagreNyttScenario()}
        >
          Lagre
        </Button>
        <Button
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