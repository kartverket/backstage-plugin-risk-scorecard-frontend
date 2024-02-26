import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import Box from '@mui/material/Box';
import { useRiskMatrixStyles } from './style';
import { RiskMatrixScenarioCount } from './RiskMatrixScenarioCount';
import { AggregatedCost } from './AggregatedCost';
import { ROS } from '../utils/types';

export const RiskMatrix = ({ ros }: { ros: ROS }) => {
  const indices = [0, 1, 2, 3, 4];

  const matrixColors = [
    ['#FBE36A', '#FF8B38', '#FF8B38', '#F23131', '#F23131'],
    ['#FBE36A', '#FBE36A', '#FF8B38', '#FF8B38', '#F23131'],
    ['#6CC6A4', '#FBE36A', '#FBE36A', '#FF8B38', '#FF8B38'],
    ['#6CC6A4', '#6CC6A4', '#FBE36A', '#FBE36A', '#FF8B38'],
    ['#6CC6A4', '#6CC6A4', '#6CC6A4', '#FBE36A', '#FBE36A'],
  ];

  const { grid, riskMatrix, topRow, rightColumn, riskMatrixItem, riskSummary } =
    useRiskMatrixStyles();

  return (
    <Box>
      <InfoCard title="Risikomatrise">
        <Box className={grid}>
          <Box className={topRow}>
            <Typography variant="h6">Sannsynlighet</Typography>
          </Box>

          <Box className={riskMatrix}>
            {indices.map(row => (
              <>
                <Box className={riskMatrixItem}>
                  <Typography variant="h6">{5 - row}</Typography>
                </Box>
                {indices.map(col => (
                  <Paper
                    className={riskMatrixItem}
                    style={{ backgroundColor: matrixColors[row][col] }}
                  >
                    <RiskMatrixScenarioCount
                      ros={ros}
                      probability={col}
                      consequence={4 - row}
                    />
                  </Paper>
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
        <Box className={riskSummary}>
          <AggregatedCost ros={ros} />
        </Box>
      </InfoCard>
    </Box>
  );
};
