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
import { ROS } from '../interface/interfaces';
import { useRiskMatrixStyles } from './style';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

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
      scenario.risiko.sannsynlighet === probability + 1 &&
      scenario.risiko.konsekvens === consequence + 1,
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
            <b>{s.ID}</b> - {s.trusselaktører.join(', ')}
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
