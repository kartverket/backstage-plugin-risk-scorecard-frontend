import React from 'react';
import { Drawer } from '@material-ui/core';
import { ScenarioDrawerContent } from './ScenarioDrawerContent';
import { Scenario } from '../interface/interfaces';
import { useScenarioDrawerStyles } from './ScenarioDrawerStyle';

interface ScenarioDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  saveScenario: () => void;
}

export const emptyScenario = (): Scenario => ({
  ID: Math.floor(Math.random() * 100000),
  beskrivelse: '',
  sistEndret: new Date().toISOString().split('T')[0],
  trusselaktører: [],
  sårbarheter: [],
  risiko: {
    oppsummering: '',
    sannsynlighet: 1,
    konsekvens: 1,
  },
  tiltak: [],
});

export const ScenarioDrawer = ({
  isOpen,
  setIsOpen,
  scenario,
  setScenario,
  saveScenario,
}: ScenarioDrawerProps) => {
  const classes = useScenarioDrawerStyles();

  const clearScenario = () => setScenario(emptyScenario());

  return (
    <Drawer
      classes={{ paper: classes.paper }}
      variant="persistent"
      anchor="right"
      open={isOpen}
      onClose={() => {
        clearScenario();
        setIsOpen(false);
      }}
    >
      <ScenarioDrawerContent
        toggleDrawer={setIsOpen}
        scenario={scenario}
        setScenario={setScenario}
        saveScenario={saveScenario}
        clearScenario={clearScenario}
      />
    </Drawer>
  );
};
