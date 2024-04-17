import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Paper, Typography } from '@material-ui/core';
import { konsekvensOptions, sannsynlighetOptions } from '../utils/constants';
import { Scenario } from '../utils/types';
import { useTableStyles } from './ScenarioTableStyles';
import { getRiskMatrixColor } from '../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';

interface ScenarioTableRowProps {
  scenario: Scenario;
  viewRow: (id: string) => void;
}

export const ScenarioTableRow = ({
  scenario,
  viewRow,
}: ScenarioTableRowProps) => {
  const sannsynlighet =
    sannsynlighetOptions.indexOf(scenario.risiko.sannsynlighet) + 1;
  const konsekvens = konsekvensOptions.indexOf(scenario.risiko.konsekvens) + 1;
  const restSannsynlighet =
    sannsynlighetOptions.indexOf(scenario.restrisiko.sannsynlighet) + 1;
  const restKonsekvens =
    konsekvensOptions.indexOf(scenario.restrisiko.konsekvens) + 1;
  const fullførteTiltak = scenario.tiltak.filter(
    tiltak => tiltak.status === 'Fullført',
  ).length;

  const { riskColor, rowBackground, rowBorder } = useTableStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <TableRow className={rowBorder}>
      <button
        className={rowBackground}
        onClick={() => viewRow(scenario.ID)}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          border: 'none',
        }}
      >
        <TableCell style={{ display: 'flex', width: '40%' }}>
          <Typography color="primary" style={{ fontWeight: 600 }}>
            {scenario.tittel}
          </Typography>
        </TableCell>

        <TableCell
          style={{
            display: 'flex',
            width: '20%',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Paper
            className={riskColor}
            style={{
              backgroundColor: getRiskMatrixColor(scenario.risiko),
            }}
          />
          {t('scenarioTable.columns.consequenceChar')}:{konsekvens}{' '}
          {t('scenarioTable.columns.probabilityChar')}:{sannsynlighet}
        </TableCell>

        <TableCell
          style={{
            display: 'flex',
            width: '20%',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '0.4rem',
          }}
        >
          <Paper
            className={riskColor}
            style={{
              backgroundColor: getRiskMatrixColor(scenario.restrisiko),
            }}
          />
          {t('scenarioTable.columns.consequenceChar')}:{restKonsekvens}{' '}
          {t('scenarioTable.columns.probabilityChar')}:{restSannsynlighet}
        </TableCell>
        <TableCell style={{ display: 'flex', width: '20%' }}>
          {fullførteTiltak}/{scenario.tiltak.length}{' '}
          {t('scenarioTable.columns.completed')}
        </TableCell>
      </button>
    </TableRow>
  );
};
