import React from 'react';
import { makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import Box from '@mui/material/Box';

export const RiskMatrix = () => {
  const indices = [0, 1, 2, 3, 4];

  const matrixColors = [
    ['#6CC6A4', '#FF8B38', '#F23131', '#F23131', '#F23131'],
    ['#6CC6A4', '#FBE36A', '#FF8B38', '#F23131', '#F23131'],
    ['#6CC6A4', '#FBE36A', '#FF8B38', '#F23131', '#F23131'],
    ['#6CC6A4', '#6CC6A4', '#FBE36A', '#FF8B38', '#F23131'],
    ['#6CC6A4', '#6CC6A4', '#6CC6A4', '#FBE36A', '#F23131'],
  ];

  const { grid, riskMatrix, topRow, rightColumn, riskMatrixItem } =
    useRiskMatrixStyles();

  return (
    <Box sx={{ width: '50%' }}>
      <InfoCard title="Risikomatrise">
        <Box className={grid}>
          <Box className={topRow}>
            <Typography variant="h6">Sannsynlighet</Typography>
          </Box>

          <Box className={riskMatrix}>
            {indices.map(row => (
              <>
                <Box className={riskMatrixItem}>
                  <Typography variant="h6">{row + 1}</Typography>
                </Box>
                {indices.map(col => (
                  <Paper
                    className={riskMatrixItem}
                    style={{ backgroundColor: matrixColors[row][col] }}
                  />
                ))}
              </>
            ))}
            <Box className={riskMatrixItem} />
            {indices.map(col => (
              <Box className={riskMatrixItem}>
                <Typography variant="h6">{col + 1}</Typography>
              </Box>
            ))}
          </Box>

          <Box className={rightColumn}>
            <Typography variant="h6">Konsekvens</Typography>
          </Box>
        </Box>
      </InfoCard>
    </Box>
  );
};

const useRiskMatrixStyles = makeStyles((theme: Theme) => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridTemplateRows: 'repeat(7, 1fr)',
    gap: '2px',
  },
  riskMatrix: {
    gridColumn: 'span 11',
    gridRow: 'span 6',
    display: 'grid',
    gridTemplateColumns: '1fr repeat(5, 2fr)',
    gridTemplateRows: 'repeat(6, 1fr)',
    gap: '0.3rem',
  },
  riskMatrixItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
  topRow: {
    gridColumn: 'span 12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
  rightColumn: {
    gridColumn: 'span 1',
    gridRow: 'span 5',
    padding: theme.spacing(2),
    writingMode: 'vertical-rl',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
