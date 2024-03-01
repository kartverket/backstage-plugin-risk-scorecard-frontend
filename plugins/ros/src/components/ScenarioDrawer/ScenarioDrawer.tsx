import React, { useContext, useState } from 'react';
import { Drawer } from '@material-ui/core';
import { useScenarioDrawerStyles } from './style';
import { emptyScenario } from '../utils/utilityfunctions';
import { ScenarioContext } from '../ROSPlugin/ScenarioContext';
import { ScenarioDrawerEdit } from './edit/ScenarioDrawerEdit';
import { ScenarioDrawerView } from './view/ScenarioDrawerView';

interface ScenarioDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const ScenarioDrawer = ({ isOpen, setIsOpen }: ScenarioDrawerProps) => {
  const { paperEdit, paperView } = useScenarioDrawerStyles();

  const { setScenario, setOriginalScenario } = useContext(ScenarioContext)!!;

  const onClose = () => {
    setIsOpen(false);
    setScenario(emptyScenario());
    setOriginalScenario(emptyScenario());
    setEditMode(false);
  };

  const [editMode, setEditMode] = useState(false);

  const openEditMode = () => setEditMode(true);

  return (
    <Drawer
      classes={{ paper: editMode ? paperEdit : paperView }}
      variant="persistent"
      anchor="right"
      open={isOpen}
      onClose={onClose}
    >
      {editMode ? (
        <ScenarioDrawerEdit onClose={onClose} />
      ) : (
        <ScenarioDrawerView onClose={onClose} openEditMode={openEditMode} />
      )}
    </Drawer>
  );
};
