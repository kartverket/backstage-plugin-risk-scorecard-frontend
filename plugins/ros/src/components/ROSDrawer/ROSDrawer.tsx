import React, { useState } from "react";
import { Drawer, makeStyles, Theme } from "@material-ui/core";
import { DrawerContent } from "./ROSDrawerContent";
import { Scenario } from "../interface/interfaces";

interface ROSInputProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lagreNyttScenario: (scenario: Scenario) => void;
}

export const ROSDrawer =
  ({
     isOpen,
     setIsOpen,
     lagreNyttScenario,
   }: ROSInputProps) => {

    const classes = useDrawerStyles();

    const [nyttScenario, setNyttScenario] = useState<Scenario>(tomtScenario());
    const lagreScenario = () => {
      lagreNyttScenario(nyttScenario);
      setNyttScenario(tomtScenario())
    }

    return (
      <Drawer
        classes={{
          paper: classes.paper
        }}
        variant="persistent"
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >

        <DrawerContent
          toggleDrawer={setIsOpen}
          nyttScenario={nyttScenario}
          setNyttScenario={setNyttScenario}
          lagreNyttScenario={lagreScenario}
          slettNyttScenario={() => setNyttScenario(tomtScenario())}
        />

      </Drawer>
    );
  };

const useDrawerStyles = makeStyles((theme: Theme) => ({
    paper: {
      width: "40%",
      justifyContent: "space-between",
      padding: theme.spacing(8)
    }
  })
);

export const tomtScenario = (): Scenario => ({
  ID: "",
  beskrivelse: "",
  sistEndret: new Date().toISOString().split('T')[0],
  trusselaktører: [],
  sårbarheter: [],
  risiko: {
    oppsummering: "",
    sannsynlighet: 0,
    konsekvens: 0
  },
  tiltak: []
});