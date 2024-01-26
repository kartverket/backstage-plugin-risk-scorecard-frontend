import React, { useState } from 'react';
import { Drawer } from '@material-ui/core';
import { DrawerContent } from './ROSDrawerContent';
import { Scenario } from '../interface/interfaces';
import { useDrawerStyles } from './DrawerStyle';

interface ROSInputProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lagreNyttScenario: (scenario: Scenario) => void;
}

export const ROSDrawer = ({
  isOpen,
  setIsOpen,
  lagreNyttScenario,
}: ROSInputProps) => {
  const classes = useDrawerStyles();

  const [nyttScenario, setNyttScenario] = useState<Scenario>(tomtScenario());

  const slettScenario = () => setNyttScenario(tomtScenario());

  const lagreScenario = () => {
    lagreNyttScenario(nyttScenario);
    slettScenario();
  };

  return (
    <Drawer
      classes={{ paper: classes.paper }}
      variant="persistent"
      anchor="right"
      open={isOpen}
      onClose={() => {
        slettScenario();
        setIsOpen(false);
      }}
    >
      <DrawerContent
        toggleDrawer={setIsOpen}
        nyttScenario={nyttScenario}
        setNyttScenario={setNyttScenario}
        lagreNyttScenario={lagreScenario}
        slettNyttScenario={slettScenario}
      />
    </Drawer>
  );
};

export const tomtScenario = (): Scenario => ({
  ID: 0,
  beskrivelse: '',
  sistEndret: new Date().toISOString().split('T')[0],
  trusselaktører: [],
  sårbarheter: [],
  risiko: {
    oppsummering: '',
    sannsynlighet: 0,
    konsekvens: 0,
  },
  tiltak: [],
});
