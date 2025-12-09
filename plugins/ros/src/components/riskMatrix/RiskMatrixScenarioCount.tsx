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
import { useScenario } from '../../contexts/ScenarioContext';
import {
  findConsequenceIndex,
  findProbabilityIndex,
} from '../../utils/utilityfunctions';
import { Text } from '@backstage/ui';
import styles from './RiskMatrixSquare.module.css';

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
  const isHighlightedFromExternal = scenarios.some(s =>
    hoveredScenarios.some(h => h.ID === s.ID),
  );

  const tooltipList = (
    <List dense>
      <ListSubheader className={styles.tooltipText}>
        <Text
          variant="title-x-small"
          weight="bold"
          className={styles.tooltipText}
        >
          {t('riskMatrix.tooltip.title')}
        </Text>
      </ListSubheader>
      {scenarios.map(s => (
        <ListItem
          key={s.ID}
          button
          disableGutters
          className={styles.tooltipText}
          onClick={() => {
            handleScenarioClick(s.ID);
          }}
        >
          <CircleIcon
            className={styles.tooltipText}
            style={{ width: '10px' }}
          />
          <ListItemText
            className={styles.tooltipText}
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
        classes={{ tooltip: styles.tooltip, arrow: styles.tooltipArrow }}
        title={tooltipList}
        placement="right"
        arrow
        open={tooltipOpen}
      >
        <Paper
          className={`${styles.circle} ${styles.centered} ${
            isHovered || isHighlightedFromExternal ? styles.circleHovered : ''
          }`}
          elevation={10}
          onClick={() => setTooltipOpen(!tooltipOpen)}
          onMouseEnter={() => {
            setIsHovered(true);
            // Add scenarios to hovered list using functional update and dedupe by ID
            setHoveredScenarios(prev => {
              const map = new Map<string, (typeof scenarios)[0]>();
              prev.forEach(p => map.set(p.ID, p));
              scenarios.forEach(s => map.set(s.ID, s));
              return Array.from(map.values());
            });
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setHoveredScenarios(prev =>
              prev.filter(s => !scenarios.some(s2 => s2.ID === s.ID)),
            );
          }}
        >
          <Text
            variant="body-large"
            weight="bold"
            className={styles.circleText}
          >
            {scenarios.length}
          </Text>
        </Paper>
      </Tooltip>
    </ClickAwayListener>
  );
}
