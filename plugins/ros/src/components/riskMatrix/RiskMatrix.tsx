import React, { Fragment, useState } from 'react';
import { Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import Box from '@mui/material/Box';
import { RiskMatrixScenarioCount } from './RiskMatrixScenarioCount';
import { AggregatedCost } from './AggregatedCost';
import { RiSc } from '../utils/types';
import TabContext from '@material-ui/lab/TabContext';
import { Tabs } from './Tabs';
import { riskMatrix } from '../utils/constants';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';
import { useFontStyles } from '../utils/style';
import { useRiskMatrixStyles } from './riskMatrixStyle';

export enum RiskMatrixTabs {
  initialRisk = 'initialRisk',
  remainingRisk = 'remainingRisk',
}

export const RiskMatrix = ({ riSc }: { riSc: RiSc }) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { label2 } = useFontStyles();
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

  const [tab, setTab] = useState<RiskMatrixTabs>(RiskMatrixTabs.initialRisk);

  return (
    <InfoCard title={t('riskMatrix.title')}>
      <TabContext value={tab}>
        <Tabs setTab={setTab} />
        {riSc.scenarios.length > 0 && (
          <Box className={riskSummary}>
            <AggregatedCost
              riSc={riSc}
              initialRisk={tab === RiskMatrixTabs.initialRisk}
            />
          </Box>
        )}
        <Box className={gridWrapper}>
          <Box className={grid}>
            <Box className={konsekvens}>
              <Typography className={`${centered} ${label2}`}>
                {t('dictionary.consequence')}
              </Typography>
            </Box>
            {riskMatrix.map((row, rowIndex) => (
              <Fragment key={rowIndex}>
                <Box className={centered}>
                  <Typography className={text}>{5 - rowIndex}</Typography>
                </Box>
                {row.map((col, colIndex) => (
                  <Box
                    className={`${square} ${centered}`}
                    style={{ backgroundColor: col }}
                    key={colIndex}
                  >
                    <RiskMatrixScenarioCount
                      riSc={riSc}
                      probability={colIndex}
                      consequence={4 - rowIndex}
                      initialRisk={tab === RiskMatrixTabs.initialRisk}
                    />
                  </Box>
                ))}
              </Fragment>
            ))}
            <Box className={centered} />
            <Box className={centered} />
            {riskMatrix.map((_, col) => (
              <Box className={centered} key={col}>
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
