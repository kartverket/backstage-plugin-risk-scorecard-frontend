import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Paper, Typography } from '@material-ui/core';
import { konsekvensOptions, sannsynlighetOptions } from '../utils/constants';
import { Scenario } from '../utils/types';
import { MatrixColors, useTableStyles } from './ScenarioTableStyles';

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

  const { riskColor, rowBackground } = useTableStyles();

  return (
    <TableRow
      style={{
        borderBottom: 'solid 1px #616161',
      }}
    >
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
              backgroundColor: MatrixColors[konsekvens - 1][sannsynlighet - 1],
            }}
          />
          K:{konsekvens} S:{sannsynlighet}
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
              backgroundColor:
                MatrixColors[restKonsekvens - 1][restSannsynlighet - 1],
            }}
          />
          K:{restKonsekvens} S:{restSannsynlighet}
        </TableCell>
        <TableCell style={{ display: 'flex', width: '20%' }}>
          {fullførteTiltak}/{scenario.tiltak.length} fullførte
        </TableCell>
      </button>
    </TableRow>
  );
};
