import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
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
  const { riskSummary, grid, konsekvens, sannsynlighet, index, square } =
    useRiskMatrixStyles();

  const [tab, setTab] = useState('startrisiko');

  return (
    <InfoCard title="Risikomatrise">
      <TabContext value={tab}>
        <Tabs setTab={setTab} />
        <Box className={riskSummary}>
          <AggregatedCost ros={ros} startRisiko={tab === 'startrisiko'} />
        </Box>
        <Box className={grid}>
          <Box className={konsekvens}>
            <Typography variant="h6">Konsekvens</Typography>
          </Box>
          {indices.map(row => (
            <>
              <Box className={index}>
                <Typography variant="h6">{5 - row}</Typography>
              </Box>
              {indices.map(col => (
                <Box
                  className={square}
                  style={{ backgroundColor: MatrixColors[4 - row][col] }}
                >
                  <RiskMatrixScenarioCount
                    ros={ros}
                    probability={col}
                    consequence={4 - row}
                    startRisiko={tab === 'startrisiko'}
                  />
                </Box>
              ))}
            </>
          ))}
          <Box className={index} />
          <Box className={index} />
          {indices.map(col => (
            <Box className={index}>
              <Typography variant="h6">{col + 1}</Typography>
            </Box>
          ))}
          <Box className={sannsynlighet}>
            <Typography variant="h6">Sannsynlighet</Typography>
          </Box>
        </Box>
      </TabContext>
    </InfoCard>
  );
};
