import {
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Paper,
  Tooltip,
} from '@material-ui/core';
import { useState } from 'react';
import CircleIcon from '@material-ui/icons/FiberManualRecord';
import { RiScStatus, RiScWithMetadata } from '../../utils/types';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useRiskMatrixStyles } from './riskMatrixStyle';
import { useScenario } from '../../contexts/ScenarioContext';
import {
  findConsequenceIndex,
  findProbabilityIndex,
} from '../../utils/utilityfunctions';
import { Text } from '@backstage/ui';
import { useTheme } from '@mui/material/styles';

interface ScenarioCountProps {
  riScWithMetadata: RiScWithMetadata;
  probability: number;
  consequence: number;
  initialRisk: boolean;
}

export function RiskMatrixScenarioCount({
  riScWithMetadata,
  probability,
  consequence,
  initialRisk,
}: ScenarioCountProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const theme = useTheme();
  const { circle, centered, tooltip, tooltipArrow, tooltipText } =
    useRiskMatrixStyles();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { openScenarioDrawer, hoveredScenarios, setHoveredScenarios } =
    useScenario();

  function handleScenarioClick(ID: string) {
    setTooltipOpen(false);
    openScenarioDrawer(
      ID,
      riScWithMetadata.status !== RiScStatus.DeletionDraft &&
        riScWithMetadata.status !== RiScStatus.DeletionSentForApproval,
    );
  }

  const scenarios = riScWithMetadata.content.scenarios.filter(
    scenario =>
      findProbabilityIndex(
        initialRisk
          ? scenario.risk.probability
          : scenario.remainingRisk.probability,
      ) === probability &&
      findConsequenceIndex(
        initialRisk
          ? scenario.risk.consequence
          : scenario.remainingRisk.consequence,
      ) === consequence,
  );

  if (scenarios.length === 0) {
    return null;
  }

  const tooltipList = (
    <List dense>
      <ListSubheader className={tooltipText}>
        <Text variant="title-x-small" weight="bold" className={tooltipText}>
          {t('riskMatrix.tooltip.title')}
        </Text>
      </ListSubheader>
      {scenarios.map(s => (
        <ListItem
          key={s.ID}
          button
          disableGutters
          className={tooltipText}
          onClick={() => {
            handleScenarioClick(s.ID);
          }}
        >
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
        interactive
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
          onMouseEnter={() => {
            setIsHovered(true);
            setHoveredScenarios([...hoveredScenarios, ...scenarios]);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setHoveredScenarios(
              hoveredScenarios.filter(
                scenario => !scenarios.some(s => s.ID === scenario.ID),
              ),
            );
          }}
        >
          <Text
            variant="body-large"
            weight="bold"
            style={{
              color:
                !isHovered && theme.palette.mode === 'dark'
                  ? 'var(--bui-white)'
                  : 'var(--bui-black)',
            }}
          >
            {scenarios.length}
          </Text>
        </Paper>
      </Tooltip>
    </ClickAwayListener>
  );
}
