import React from 'react';
import { Drawer } from '@material-ui/core';
import { ScenarioDrawerContent } from './ScenarioDrawerContent';
import { emptyScenario, Scenario } from '../utils/interfaces';
import { useScenarioDrawerStyles } from './style';

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
        isOpen={isOpen}
      />
    </Drawer>
  );
};
