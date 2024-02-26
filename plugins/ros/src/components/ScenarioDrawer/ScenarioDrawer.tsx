import React, { useContext } from 'react';
import { Drawer } from '@material-ui/core';
import { ScenarioDrawerContent } from './ScenarioDrawerContent';
import { useScenarioDrawerStyles } from './style';
import { emptyScenario } from '../utils/utilityfunctions';
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

  return (
    <Drawer
      classes={{ paper: classes.paper }}
      variant="persistent"
      anchor="right"
      open={isOpen}
      onClose={onClose}
    >
      <ScenarioDrawerContent setIsOpen={setIsOpen} />
    </Drawer>
  );
};
