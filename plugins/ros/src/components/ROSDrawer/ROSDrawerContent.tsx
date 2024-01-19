import React from "react";
import { Box, Button, IconButton, makeStyles, TextField, Theme, Typography } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { Select } from "@backstage/core-components";

interface ROSDrawerContentProps {
  toggleDrawer: (isOpen: boolean) => void;
}

export const DrawerContent = ({ toggleDrawer }: ROSDrawerContentProps) => {

  const { header, content, icon, buttons } = useDrawerContentStyles();

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
      <Box className={content}>
        <>
          <Typography variant="subtitle1">Beskrivelse</Typography>
          <TextField
            id="filled-multiline-static"
            hiddenLabel
            multiline
            fullWidth
            minRows={4}
            maxRows={4}
            variant="filled"
            onChange={() => {
            }}
          />
        </>
        <Select

          placeholder="-- Velg --"
          label="Trusselaktører"
          items={trusselaktører}
          multiple
          onChange={() => {
          }}
        />
        <Select
          placeholder="-- Velg --"
          label="Sårbarheter"
          items={sårbarheter}
          multiple
          onChange={() => {
          }}
        />
        <Select
          placeholder="-- Velg --"
          label="Sannsynlighet"
          items={nivåer}
          onChange={() => {
          }}
        />
        <Select
          placeholder="-- Velg --"
          label="Konsekvens"
          items={nivåer}
          onChange={() => {
          }}
        />
      </Box>
      <Box className={buttons}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => toggleDrawer(false)}
        >
          Lagre
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => toggleDrawer(false)}
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
      justifyContent: "center",
      width: "100%"
    },
    select: {
      width: "100%",
      margin: "1rem 0"
    },
    buttons: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing(2),
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