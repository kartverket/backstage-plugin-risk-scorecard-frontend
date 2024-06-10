import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Paper, Typography } from '@material-ui/core';
import { Scenario } from '../utils/types';
import { useTableStyles } from './ScenarioTableStyles';
import {
  getConsequenceLevel,
  getProbabilityLevel,
  getRiskMatrixColor,
} from '../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';

interface ScenarioTableRowProps {
  scenario: Scenario;
  viewRow: (id: string) => void;
  isLastRow?: boolean;
}

export const ScenarioTableRow = ({
  scenario,
  viewRow,
  isLastRow,
}: ScenarioTableRowProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const {
    riskColor,
    rowBackground,
    rowBorder,
    tableCell,
    tableCellTitle,
    tableCellContainer,
  } = useTableStyles();

  const remainingActions = scenario.actions.filter(
    a => a.status !== 'Completed',
  );

  return (
    <TableRow
      className={`${isLastRow ? undefined : rowBorder} ${rowBackground}`}
      onClick={() => viewRow(scenario.ID)}
    >
      <TableCell className={tableCellTitle}>
        <Typography color="primary" style={{ fontWeight: 600 }}>
          {scenario.title}
        </Typography>
      </TableCell>

      <TableCell className={tableCell}>
        <div className={tableCellContainer}>
          <Paper
            className={riskColor}
            style={{
              backgroundColor: getRiskMatrixColor(scenario.risk),
            }}
          />
          {t('scenarioTable.columns.probabilityChar')}:
          {getProbabilityLevel(scenario.risk)}{' '}
          {t('scenarioTable.columns.consequenceChar')}:
          {getConsequenceLevel(scenario.risk)}
        </div>
      </TableCell>
      <TableCell className={tableCell}>
        <div className={tableCellContainer}>
          {remainingActions.length > 0 ? (
            <>
              {remainingActions.length} {t('dictionary.planned').toLowerCase()}
            </>
          ) : (
            t('dictionary.completed')
          )}
        </div>
      </TableCell>
      <TableCell className={tableCell}>
        <div className={tableCellContainer}>
          <Paper
            className={riskColor}
            style={{
              backgroundColor: getRiskMatrixColor(scenario.remainingRisk),
            }}
          />
          {t('scenarioTable.columns.probabilityChar')}:
          {getProbabilityLevel(scenario.remainingRisk)}{' '}
          {t('scenarioTable.columns.consequenceChar')}:
          {getConsequenceLevel(scenario.remainingRisk)}
        </div>
      </TableCell>
    </TableRow>
  );
};
