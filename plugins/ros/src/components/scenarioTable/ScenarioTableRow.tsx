import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Paper, Typography } from '@material-ui/core';
import { consequenceOptions, probabilityOptions } from '../utils/constants';
import { Scenario } from '../utils/types';
import { useTableStyles } from './ScenarioTableStyles';
import { getRiskMatrixColor } from '../utils/utilityfunctions';
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
  const sannsynlighet =
    probabilityOptions.indexOf(scenario.risk.probability) + 1;
  const konsekvens = consequenceOptions.indexOf(scenario.risk.consequence) + 1;
  const restSannsynlighet =
    probabilityOptions.indexOf(scenario.remainingRisk.probability) + 1;
  const restKonsekvens =
    consequenceOptions.indexOf(scenario.remainingRisk.consequence) + 1;
  const fullførteTiltak = scenario.actions.filter(
    tiltak => tiltak.status === 'Fullført',
  ).length;

  const { riskColor, rowBackground, rowBorder, tableCell } = useTableStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <TableRow className={isLastRow ? undefined : rowBorder}>
      <button
        className={rowBackground}
        onClick={() => viewRow(scenario.ID)}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          border: 'none',
          padding: 0,
        }}
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
          {t('scenarioTable.columns.consequenceChar')}:{konsekvens}{' '}
          {t('scenarioTable.columns.probabilityChar')}:{sannsynlighet}
        </TableCell>
        <TableCell className={tableCell}>
          {fullførteTiltak}/{scenario.actions.length}{' '}
          {t('scenarioTable.columns.completed')}
        </TableCell>
        <TableCell className={tableCell}>
          <Paper
            className={riskColor}
            style={{
              backgroundColor: getRiskMatrixColor(scenario.remainingRisk),
            }}
          />
          {t('scenarioTable.columns.consequenceChar')}:{restKonsekvens}{' '}
          {t('scenarioTable.columns.probabilityChar')}:{restSannsynlighet}
        </TableCell>
      </button>
    </TableRow>
  );
};
