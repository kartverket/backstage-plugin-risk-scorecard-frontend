import React, { useContext } from 'react';
import { Drawer } from '@material-ui/core';
import { useScenarioDrawerStyles } from './style';
import { ScenarioContext } from '../riScPlugin/ScenarioContext';
import { ScenarioDrawerView } from './view/ScenarioDrawerView';
import { ScenarioDrawerState } from '../utils/hooks';

export const ScenarioDrawer = () => {
  const { paperView } = useScenarioDrawerStyles();

  const { scenarioDrawerState, closeScenario } = useContext(ScenarioContext)!!;

  const isOpen = scenarioDrawerState !== ScenarioDrawerState.Closed;

  return (
    <Drawer
      classes={{ paper: paperView }}
      variant="temporary"
      anchor="right"
      open={isOpen}
      onClose={closeScenario}
    >
      <ScenarioDrawerView />
    </Drawer>
  );
};
