import {
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useRiskMatrixStyles } from './style';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { konsekvensOptions, sannsynlighetOptions } from '../utils/constants';
import { ROS } from '../utils/types';

interface ScenarioCountProps {
  ros: ROS;
  probability: number;
  consequence: number;
}

export const RiskMatrixScenarioCount = ({
  ros,
  probability,
  consequence,
}: ScenarioCountProps) => {
  const { circle, tooltip, tooltipArrow, tooltipText } = useRiskMatrixStyles();

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const scenarier = ros.scenarier.filter(
    scenario =>
      sannsynlighetOptions.indexOf(scenario.risiko.sannsynlighet) ===
        probability &&
      konsekvensOptions.indexOf(scenario.risiko.konsekvens) === consequence,
  );

  if (scenarier.length === 0) {
    return null;
  }

  const tooltipList = (
    <List dense>
      <ListSubheader className={tooltipText}>
        <Typography variant="h6" className={tooltipText}>
          Risikoscenarier
        </Typography>
      </ListSubheader>
      {scenarier.map(s => (
        <ListItem button disableGutters className={tooltipText}>
          <FiberManualRecordIcon
            className={tooltipText}
            style={{ width: '10px' }}
          />
          <ListItemText
            className={tooltipText}
            style={{ paddingLeft: '0.6rem' }}
          >
            <span>{s.tittel}</span>
          </ListItemText>
        </ListItem>
      ))}
    </List>
  );

  return (
    <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
      <Tooltip
        classes={{ tooltip: tooltip, arrow: tooltipArrow }}
        title={tooltipList}
        placement="right"
        arrow
        open={tooltipOpen}
      >
        <Paper
          className={circle}
          elevation={10}
          onClick={() => setTooltipOpen(!tooltipOpen)}
        >
          <Typography variant="h6" style={{ color: 'black' }}>
            {scenarier.length}
          </Typography>
        </Paper>
      </Tooltip>
    </ClickAwayListener>
  );
};
