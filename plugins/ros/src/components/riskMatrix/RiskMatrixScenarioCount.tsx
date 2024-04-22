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
import CircleIcon from '@material-ui/icons/FiberManualRecord';
import { consequenceOptions, probabilityOptions } from '../utils/constants';
import { RiSc } from '../utils/types';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';

interface ScenarioCountProps {
  riSc: RiSc;
  probability: number;
  consequence: number;
  startRisiko: boolean;
}

export const RiskMatrixScenarioCount = ({
  riSc,
  probability,
  consequence,
  startRisiko,
}: ScenarioCountProps) => {
  const {
    circle,
    centered,
    circleText,
    text,
    tooltip,
    tooltipArrow,
    tooltipText,
  } = useRiskMatrixStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const scenarier = riSc.scenarios.filter(
    scenario =>
      probabilityOptions.indexOf(
        startRisiko
          ? scenario.risk.probability
          : scenario.remainingRisk.probability,
      ) === probability &&
      consequenceOptions.indexOf(
        startRisiko
          ? scenario.risk.consequence
          : scenario.remainingRisk.consequence,
      ) === consequence,
  );

  if (scenarier.length === 0) {
    return null;
  }

  const tooltipList = (
    <List dense>
      <ListSubheader className={tooltipText}>
        <Typography variant="h6" className={tooltipText}>
          {t('riskMatrix.tooltip.title')}
        </Typography>
      </ListSubheader>
      {scenarier.map(s => (
        <ListItem button disableGutters className={tooltipText}>
          <CircleIcon className={tooltipText} style={{ width: '10px' }} />
          <ListItemText
            className={tooltipText}
            style={{ paddingLeft: '0.6rem' }}
          >
            <span>{s.title}</span>
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
          className={`${circle} ${centered}`}
          elevation={10}
          onClick={() => setTooltipOpen(!tooltipOpen)}
        >
          <Typography className={`${circleText} ${text}`}>
            {scenarier.length}
          </Typography>
        </Paper>
      </Tooltip>
    </ClickAwayListener>
  );
};
