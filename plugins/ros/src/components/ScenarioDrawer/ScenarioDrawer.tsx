import React, { useState } from 'react';
import { Drawer } from '@material-ui/core';
import { ScenarioDrawerView } from './ScenarioDrawerView';
import { useScenarioDrawerStyles } from './style';
import { Scenario } from '../utils/types';
import { emptyScenario } from '../utils/utilityfunctions';
import { ScenarioDrawerEdit } from './ScenarioDrawerEdit';

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

  const [editMode, setEditMode] = useState(false);

  const editScenario = () => setEditMode(true);

  return (
    <Drawer
      classes={{ paper: classes.paper }}
      variant="persistent"
      anchor="right"
      open={isOpen}
      onClose={onClose}
    >
      {editMode ? (
        <ScenarioDrawerEdit
          toggleDrawer={setIsOpen}
          scenario={scenario}
          setScenario={setScenario}
          saveScenario={saveScenario}
          clearScenario={clearScenario}
        />
      ) : (
        <ScenarioDrawerView
          toggleDrawer={setIsOpen}
          scenario={scenario}
          setScenario={setScenario}
          saveScenario={saveScenario}
          clearScenario={clearScenario}
          editScenario={editScenario}
        />
      )}
    </Drawer>
  );
};
