import React, { useState } from "react";
import { Drawer } from "@material-ui/core";
import { DrawerContent } from "./ROSDrawerContent";
import { Scenario } from "../interface/interfaces";
import { tomtScenario, useDrawerStyles } from "./DrawerStyle";

interface ROSInputProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lagreNyttScenario: (scenario: Scenario) => void;
}

export const ROSDrawer = (
  {
    isOpen,
    setIsOpen,
    lagreNyttScenario
  }: ROSInputProps
) => {

  const classes = useDrawerStyles();

  const [nyttScenario, setNyttScenario] = useState<Scenario>(tomtScenario());

  const lagreScenario = () => {
    lagreNyttScenario(nyttScenario);
    setNyttScenario(tomtScenario());
  };

  return (
    <Drawer
      classes={{ paper: classes.paper }}
      variant="persistent"
      anchor="right"
      open={isOpen}
      onClose={() => {
        setNyttScenario(tomtScenario());
        setIsOpen(false);
      }}
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