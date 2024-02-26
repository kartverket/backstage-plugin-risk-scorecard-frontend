import React, { useContext, useState } from 'react';
import { Drawer } from '@material-ui/core';
import { ScenarioDrawerView } from './ScenarioDrawerView';
import { useScenarioDrawerStyles } from './style';
import { emptyScenario } from '../utils/utilityfunctions';
import { ScenarioDrawerEdit } from './ScenarioDrawerEdit';
import { ScenarioContext } from '../ROSPlugin/ScenarioContext';

interface ScenarioDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const ScenarioDrawer = ({ isOpen, setIsOpen }: ScenarioDrawerProps) => {
  const classes = useScenarioDrawerStyles();

  const { setScenario, setOriginalScenario } = useContext(ScenarioContext)!!;

  const onClose = () => {
    setIsOpen(false);
    setScenario(emptyScenario());
    setOriginalScenario(emptyScenario());
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
        <ScenarioDrawerEdit setIsOpen={setIsOpen} />
      ) : (
        <ScenarioDrawerView setIsOpen={setIsOpen} editScenario={editScenario} />
      )}
    </Drawer>
  );
};
