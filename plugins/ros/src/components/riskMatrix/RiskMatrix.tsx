import { Fragment, useState } from 'react';
import Box from '@mui/material/Box';
import { AggregatedCost } from './AggregatedCost';
import { RiScWithMetadata } from '../../utils/types';
import { MatrixTabs } from './Tabs';
import { riskMatrix } from '../../utils/constants';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useFontStyles } from '../../utils/style';
import { RiskMatrixTabs } from './utils';
import { Card, CardBody, CardHeader, Text } from '@backstage/ui';
import { RiskMatrixSquare } from './RiskMatrixSquare.tsx';
import styles from './RiskMatrixSquare.module.css';

export function RiskMatrix({
  riScWithMetadata,
}: {
  riScWithMetadata: RiScWithMetadata;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { label2 } = useFontStyles();
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
        <Box className={styles.gridWrapper}>
          <Box className={styles.grid}>
            <Box className={styles.konsekvens}>
              <Text
                variant="body-large"
                weight="bold"
                className={`${styles.centered} ${label2}`}
              >
                {t('dictionary.consequence')}
              </Text>
            </Box>
            {riskMatrix.map((row, rowIndex) => (
              <Fragment key={rowIndex}>
                <Box className={styles.centered}>
                  <Text
                    variant="title-x-small"
                    weight="bold"
                    className={styles.text}
                  >
                    {5 - rowIndex}
                  </Text>
                </Box>
                {row.map((_, colIndex) => (
                  <RiskMatrixSquare
                    size="grid"
                    consequence={4 - rowIndex}
                    probability={colIndex}
                    riScCountObject={{
                      isInitialRisk: tab === RiskMatrixTabs.initialRisk,
                      riSc: riScWithMetadata,
                    }}
                  />
                ))}
              </Fragment>
            ))}
            <Box className={styles.centered} />
            <Box className={styles.centered} />
            {riskMatrix.map((_, col) => (
              <Box className={styles.centered} key={col}>
                <Text
                  variant="title-x-small"
                  weight="bold"
                  className={styles.text}
                >
                  {col + 1}
                </Text>
              </Box>
            ))}
            <Box className={styles.sannsynlighet}>
              <Text
                weight="bold"
                variant="body-large"
                className={`${styles.centered} ${label2}`}
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
