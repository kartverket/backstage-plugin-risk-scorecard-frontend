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
  const {
    riskSummary,
    grid,
    gridWrapper,
    konsekvens,
    sannsynlighet,
    square,
    text,
    centered,
  } = useRiskMatrixStyles();

  const [tab, setTab] = useState('startrisiko');

  return (
    <InfoCard title="Risikomatrise">
      <TabContext value={tab}>
        <Tabs setTab={setTab} />
        <Box className={riskSummary}>
          <AggregatedCost ros={ros} startRisiko={tab === 'startrisiko'} />
        </Box>
        <Box className={gridWrapper}>
          <Box className={grid}>
            <Box className={konsekvens}>
              <Typography className={`${centered} ${text}`}>
                Konsekvens
              </Typography>
            </Box>
            {indices.map(row => (
              <>
                <Box className={centered}>
                  <Typography className={text}>{5 - row}</Typography>
                </Box>
                {indices.map(col => (
                  <Box
                    className={`${square} ${centered}`}
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
            <Box className={centered} />
            <Box className={centered} />
            {indices.map(col => (
              <Box className={centered}>
                <Typography className={text}>{col + 1}</Typography>
              </Box>
            ))}
            <Box className={sannsynlighet}>
              <Typography className={`${centered} ${text}`}>
                Sannsynlighet
              </Typography>
            </Box>
          </Box>
        </Box>
      </TabContext>
    </InfoCard>
  );
};
