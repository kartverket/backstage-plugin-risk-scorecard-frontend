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
  const { riskColor, rowBackground, rowBorder, tableCell } = useTableStyles();

  const remainingActions = scenario.actions.filter(
    a => a.status !== 'Completed',
  );

  return (
    <TableRow
      className={`${isLastRow ? undefined : rowBorder} ${rowBackground}`}
      onClick={() => viewRow(scenario.ID)}
    >
      <TableCell
        className={tableCell}
        style={{
          width: '40%',
          minWidth: '200px',
        }}
      >
        <Typography color="primary" style={{ fontWeight: 600 }}>
          {scenario.title}
        </Typography>
      </TableCell>

      <TableCell className={tableCell}>
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
      </TableCell>
      <TableCell className={tableCell}>
        {remainingActions.length > 0 ? (
          <>
            {remainingActions.length} {t('dictionary.planned').toLowerCase()}
          </>
        ) : (
          t('dictionary.completed')
        )}
      </TableCell>
      <TableCell className={tableCell}>
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
      </TableCell>
    </TableRow>
  );
};
