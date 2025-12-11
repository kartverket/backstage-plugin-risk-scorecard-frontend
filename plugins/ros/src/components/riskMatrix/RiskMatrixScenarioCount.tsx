import { ClickAwayListener, Paper, Tooltip } from '@material-ui/core';
import { useState } from 'react';
import { RiScStatus, RiScWithMetadata } from '../../utils/types';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useScenario } from '../../contexts/ScenarioContext';
import {
  findConsequenceIndex,
  findProbabilityIndex,
} from '../../utils/utilityfunctions';
import { Text } from '@backstage/ui';
import styles from './RiskMatrixScenarioCount.module.css';
import riskMatrixSquareStyles from './RiskMatrixSquare.module.css';

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
    <div>
      <Text variant="title-x-small" weight="bold">
        {t('riskMatrix.tooltip.title')}
      </Text>
      <ul className={styles.tooltipList}>
        {scenarios.map(scenario => (
          <li
            key={scenario.ID}
            className={styles.tooltipListItem}
            onClick={e => {
              e.stopPropagation();
              handleScenarioClick(scenario.ID);
            }}
          >
            <Text>{scenario.title}</Text>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
      <Tooltip
        interactive
        classes={{
          tooltip: riskMatrixSquareStyles.tooltip,
          arrow: riskMatrixSquareStyles.tooltipArrow,
        }}
        title={tooltipList}
        placement="right"
        arrow
        open={tooltipOpen}
      >
        <Paper
          className={`${riskMatrixSquareStyles.circle} ${riskMatrixSquareStyles.centered} ${
            isHovered || isHighlightedFromExternal
              ? riskMatrixSquareStyles.circleHovered
              : ''
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
            className={riskMatrixSquareStyles.circleText}
          >
            {scenarios.length}
          </Text>
        </Paper>
      </Tooltip>
    </ClickAwayListener>
  );
}
