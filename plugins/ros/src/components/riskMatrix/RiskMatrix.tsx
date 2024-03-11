import React, { useState } from 'react';
import { Paper, Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import Box from '@mui/material/Box';
import { useRiskMatrixStyles } from './style';
import { RiskMatrixScenarioCount } from './RiskMatrixScenarioCount';
import { AggregatedCost } from './AggregatedCost';
import { ROS } from '../utils/types';
import { MatrixColors } from '../ScenarioTable/ScenarioTableStyles';
import TabContext from '@material-ui/lab/TabContext';
import { Tabs } from './Tabs';

export const RiskMatrix = ({ ros }: { ros: ROS }) => {
  const indices = [0, 1, 2, 3, 4];

  const {
    grid,
    riskMatrixGrid,
    bottomRow,
    leftColumn,
    riskMatrixItem,
    riskSummary,
  } = useRiskMatrixStyles();

  const [tab, setTab] = useState('startrisiko');

  return (
    <Box>
      <InfoCard title="Risikomatrise">
        <TabContext value={tab}>
          <Tabs setTab={setTab} />
          <Box className={riskSummary}>
            <AggregatedCost ros={ros} startRisiko={tab === 'startrisiko'} />
          </Box>
          <Box className={grid}>
            <Box className={riskMatrixGrid}>
              <Box className={leftColumn}>
                <Typography variant="h6">Konsekvens</Typography>
              </Box>
              {indices.map(row => (
                <>
                  <Box className={riskMatrixItem}>
                    <Typography variant="h6">{5 - row}</Typography>
                  </Box>
                  {indices.map(col => (
                    <Paper
                      className={riskMatrixItem}
                      style={{ backgroundColor: MatrixColors[4 - row][col] }}
                    >
                      <RiskMatrixScenarioCount
                        ros={ros}
                        probability={col}
                        consequence={4 - row}
                        startRisiko={tab === 'startrisiko'}
                      />
                    </Paper>
                  ))}
                </>
              ))}
              <Box className={riskMatrixItem} />
              <Box className={riskMatrixItem} />
              {indices.map(col => (
                <Box className={riskMatrixItem}>
                  <Typography variant="h6">{col + 1}</Typography>
                </Box>
              ))}
            </Box>
            <Box className={bottomRow}>
              <Typography variant="h6">Sannsynlighet</Typography>
            </Box>
          </Box>
        </TabContext>
      </InfoCard>
    </Box>
  );
};
