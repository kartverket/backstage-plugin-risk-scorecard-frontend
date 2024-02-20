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

export const emptyScenario = (): Scenario => ({
  ID: generateRandomId(),
  tittel: '',
  beskrivelse: '',
  sistEndret: new Date().toISOString().split('T')[0],
  trusselaktører: [],
  sårbarheter: [],
  risiko: {
    oppsummering: '',
    sannsynlighet: 0.01,
    konsekvens: 1000,
  },
  tiltak: [],
  restrisiko: {
    oppsummering: '',
    sannsynlighet: 0.01,
    konsekvens: 1000,
  },
});

function generateRandomId(): string {
  return [...Array(3)]
    .map(() => {
      const randomChar = Math.random().toString(36)[2];
      return Math.random() < 0.5 ? randomChar.toUpperCase() : randomChar;
    })
    .join('');
}
