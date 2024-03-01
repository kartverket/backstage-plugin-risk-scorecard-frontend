import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import Box from '@mui/material/Box';
import { useRiskMatrixStyles } from './style';
import { RiskMatrixScenarioCount } from './RiskMatrixScenarioCount';
import { AggregatedCost } from './AggregatedCost';
import { ROS } from '../utils/types';
import { riskMatrix } from '../utils/constants';

export const RiskMatrix = ({ ros }: { ros: ROS }) => {
  const {
    grid,
    riskMatrixGrid,
    topRow,
    rightColumn,
    riskMatrixItem,
    riskSummary,
  } = useRiskMatrixStyles();

  return (
    <Box>
      <InfoCard title="Risikomatrise">
        <Box className={grid}>
          <Box className={topRow}>
            <Typography variant="h6">Sannsynlighet</Typography>
          </Box>
          <Box className={riskMatrixGrid}>
            {riskMatrix.map((cols, row) => (
              <>
                <Box className={riskMatrixItem}>
                  <Typography variant="h6">{5 - row}</Typography>
                </Box>
                {cols.map((color, col) => (
                  <Paper
                    className={riskMatrixItem}
                    style={{ backgroundColor: color }}
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
            {riskMatrix.map((_, col) => (
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
