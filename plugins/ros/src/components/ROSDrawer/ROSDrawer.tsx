import React from "react";
import { Drawer, makeStyles, Theme } from "@material-ui/core";
import { DrawerContent } from "./ROSDrawerContent";
import { Scenario } from "../interface/interfaces";

interface ROSInputProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  nyttScenario: Scenario;
  setNyttScenario: (nyttScenario: Scenario) => void;
}

export const ROSDrawer = ({ isOpen, setIsOpen, nyttScenario, setNyttScenario }: ROSInputProps) => {

  const classes = useDrawerStyles();

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
      <DrawerContent toggleDrawer={setIsOpen} nyttScenario={nyttScenario} setNyttScenario={setNyttScenario}/>
    </Drawer>
  );
}

const useDrawerStyles = makeStyles((theme: Theme) => ({
    paper: {
      width: "50%",
      justifyContent: "space-between",
      padding: theme.spacing(8)
    }
  })
);