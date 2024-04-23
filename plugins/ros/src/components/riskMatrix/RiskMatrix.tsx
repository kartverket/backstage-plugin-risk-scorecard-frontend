import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import Box from '@mui/material/Box';
import { useRiskMatrixStyles } from './style';
import { RiskMatrixScenarioCount } from './RiskMatrixScenarioCount';
import { AggregatedCost } from './AggregatedCost';
import { RiSc } from '../utils/types';
import TabContext from '@material-ui/lab/TabContext';
import { Tabs } from './Tabs';
import { riskMatrix } from '../utils/constants';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';
import { useFontStyles } from '../scenarioDrawer/style';

export const RiskMatrix = ({ riSc }: { riSc: RiSc }) => {
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

  const { label2 } = useFontStyles();

  const [tab, setTab] = useState('startrisiko');

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <InfoCard title={t('riskMatrix.title')}>
      <TabContext value={tab}>
        <Tabs setTab={setTab} />
        {riSc.scenarios.length > 0 && (
          <Box className={riskSummary}>
            <AggregatedCost riSc={riSc} initialRisk={tab === 'startrisiko'} />
          </Box>
        )}
        <Box className={gridWrapper}>
          <Box className={grid}>
            <Box className={konsekvens}>
              <Typography className={`${centered} ${label2}`}>
                {t('dictionary.consequence')}
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
                    style={{ backgroundColor: riskMatrix[row][col] }}
                  >
                    <RiskMatrixScenarioCount
                      riSc={riSc}
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
              <Typography className={`${centered} ${label2}`}>
                {t('dictionary.probability')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </TabContext>
    </InfoCard>
  );
};
