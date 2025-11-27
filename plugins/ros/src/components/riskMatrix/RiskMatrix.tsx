import { Fragment, useState } from 'react';
import Box from '@mui/material/Box';
import { RiskMatrixScenarioCount } from './RiskMatrixScenarioCount';
import { AggregatedCost } from './AggregatedCost';
import { RiScWithMetadata } from '../../utils/types';
import { MatrixTabs } from './Tabs';
import { riskMatrix } from '../../utils/constants';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useFontStyles } from '../../utils/style';
import { useRiskMatrixStyles } from './riskMatrixStyle';
import { RiskMatrixTabs } from './utils';
import { Card, CardBody, CardHeader, Text } from '@backstage/ui';

export function RiskMatrix({
  riScWithMetadata,
}: {
  riScWithMetadata: RiScWithMetadata;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { label2 } = useFontStyles();
  const {
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
    <Card>
      <CardHeader>
        <Text variant="title-small" weight="bold">
          {t('riskMatrix.title')}
        </Text>
      </CardHeader>
      <CardBody>
        <MatrixTabs setTab={setTab} currentTab={tab} />
        {riScWithMetadata.content.scenarios.length > 0 && (
          <Box
            style={{
              marginTop: '18px',
            }}
          >
            <AggregatedCost
              riSc={riScWithMetadata.content}
              initialRisk={tab === RiskMatrixTabs.initialRisk}
            />
          </Box>
        )}
        <Box className={gridWrapper}>
          <Box className={grid}>
            <Box className={konsekvens}>
              <Text
                variant="body-large"
                weight="bold"
                className={`${centered} ${label2}`}
              >
                {t('dictionary.consequence')}
              </Text>
            </Box>
            {riskMatrix.map((row, rowIndex) => (
              <Fragment key={rowIndex}>
                <Box className={centered}>
                  <Text variant="title-x-small" weight="bold" className={text}>
                    {5 - rowIndex}
                  </Text>
                </Box>
                {row.map((col, colIndex) => (
                  <Box
                    className={`${square} ${centered}`}
                    style={{ backgroundColor: col }}
                    key={colIndex}
                  >
                    <RiskMatrixScenarioCount
                      riScWithMetadata={riScWithMetadata}
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
                <Text variant="title-x-small" weight="bold" className={text}>
                  {col + 1}
                </Text>
              </Box>
            ))}
            <Box className={sannsynlighet}>
              <Text
                weight="bold"
                variant="body-large"
                className={`${centered} ${label2}`}
              >
                {t('dictionary.probability')}
              </Text>
            </Box>
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
}
