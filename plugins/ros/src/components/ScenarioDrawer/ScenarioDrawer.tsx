import React from 'react';
import { Drawer } from '@material-ui/core';
import { ScenarioDrawerContent } from './ScenarioDrawerContent';
import { useScenarioDrawerStyles } from './style';
import { Scenario } from '../utils/types';
import { emptyScenario } from '../utils/utilityfunctions';

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

  const onClose = () => {
    setIsOpen(false);
    clearScenario();
  };

  return (
    <Drawer
      classes={{ paper: classes.paper }}
      variant="persistent"
      anchor="right"
      open={isOpen}
      onClose={onClose}
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
