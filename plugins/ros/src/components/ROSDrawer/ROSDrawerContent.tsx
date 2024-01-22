import React from "react";
import { Box, Button, FormControl, IconButton, makeStyles, TextField, Theme, Typography } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { Select } from "@backstage/core-components";
import { Scenario } from "../interface/interfaces";

interface ROSDrawerContentProps {
  toggleDrawer: (isOpen: boolean) => void;
  nyttScenario: Scenario;
  setNyttScenario: (nyttScenario: Scenario) => void;
  lagreNyttScenario: () => void;
  slettNyttScenario: () => void;
}

export const DrawerContent =
  ({
     toggleDrawer,
     nyttScenario,
     setNyttScenario,
     lagreNyttScenario,
      slettNyttScenario
   }: ROSDrawerContentProps) => {

    const { header, content, icon, buttons, beskrivelseLabel } = useDrawerContentStyles();

    return (
      <>
        <Box className={header}>
          <Typography variant="h4">Nytt risikoscenario</Typography>
          <IconButton
            key="dismiss"
            title="Close the drawer"
            onClick={() => toggleDrawer(false)}
            color="inherit"
          >
            <Close className={icon} />
          </IconButton>
        </Box>

        <FormControl className={content}>
          <Box>
            <Typography className={beskrivelseLabel} variant="subtitle2">Beskrivelse</Typography>
            <TextField
              required
              id="filled-multiline-static"
              value={nyttScenario.beskrivelse}
              multiline
              fullWidth
              minRows={4}
              maxRows={4}
              variant="filled"
              onChange={event => setNyttScenario({ ...nyttScenario, beskrivelse: event.target.value })}
            />
          </Box>
          <Select
            placeholder="-- Velg --"
            label="Trusselaktører"
            items={trusselaktører}
            selected={nyttScenario.trusselaktører}
            multiple
            onChange={event => setNyttScenario({ ...nyttScenario, trusselaktører: event as string[] })}
          />
          <Select
            placeholder="-- Velg --"
            label="Sårbarheter"
            items={sårbarheter}
            selected={nyttScenario.sårbarheter}
            multiple
            onChange={event => setNyttScenario({ ...nyttScenario, sårbarheter: event as string[] })}
          />
          <Select
            placeholder="-- Velg --"
            label="Sannsynlighet"
            items={nivåer}
            selected={nyttScenario.risiko.sannsynlighet}
            onChange={event => setNyttScenario({
              ...nyttScenario,
              risiko: { ...nyttScenario.risiko, sannsynlighet: event as number }
            })}
          />
          <Select
            placeholder="-- Velg --"
            label="Konsekvens"
            items={nivåer}
            selected={nyttScenario.risiko.konsekvens}
            onChange={event => setNyttScenario({
              ...nyttScenario,
              risiko: { ...nyttScenario.risiko, konsekvens: event as number }
            })}
          />
        </FormControl>

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

const useDrawerContentStyles = makeStyles((theme: Theme) => ({
    header: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between"
    },
    icon: {
      fontSize: 20
    },
    content: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: "70%"
    },
    beskrivelseLabel: {
      marginBottom: theme.spacing(1)
    },
    buttons: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing(2)
    }
  })
);

// TODO: Hent data fra json schema

const trusselaktører = [
  { label: "Datasnok", value: "Datasnok" },
  { label: "Hacktivist", value: "Hacktivist" },
  { label: "Uheldig ansatt", value: "Uheldig ansatt" },
  { label: "Innside-aktør", value: "Innside-aktør" },
  { label: "Organiserte kriminelle", value: "Organiserte kriminelle" },
  { label: "Terroristorganisasjon", value: "Terroristorganisasjon" },
  { label: "Nasjon/stat", value: "Nasjon/stat" }
];

const sårbarheter = [
  { label: "Kompromittert adminbruker", value: "Kompromittert adminbruker" },
  { label: "Sårbarhet i avhengighet", value: "Sårbarhet i avhengighet" },
  { label: "Lekket hemmelighet", value: "Lekket hemmelighet" },
  { label: "Feilkonfigurering", value: "Feilkonfigurering" },
  { label: "Klussing med input", value: "Klussing med input" },
  { label: "Benekte brukerhandling", value: "Benekte brukerhandling" },
  { label: "Informasjonslekkasje", value: "Informasjonslekkasje" },
  { label: "Tjenestenekt", value: "Tjenestenekt" },
  { label: "Rettighetseskalering", value: "Rettighetseskalering" }
];

const nivåer = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 }
];