import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { IconButton } from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';
import { useState } from 'react';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiSc } from '../../utils/types';
import { formatNumber } from '../../utils/utilityfunctions';
import { EstimatedRiskInfoDialog } from './EstimatedRiskInfoDialog';
import { Box, Flex, Text } from '@backstage/ui';
import styles from './AggregatedCost.module.css';

interface AggregatedCostProps {
  riSc: RiSc;
  initialRisk: boolean;
}

export function AggregatedCost({ riSc, initialRisk }: AggregatedCostProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [showDialog, setShowDialog] = useState(false);

  const cost = riSc.scenarios
    .map(scenario => {
      return initialRisk
        ? scenario.risk.probability * scenario.risk.consequence
        : scenario.remainingRisk.probability *
            scenario.remainingRisk.consequence;
    })
    .reduce((a, b) => a + b, 0);

  return (
    <Box className={styles.boxStyle}>
      <Text as="h3" variant="body-large" weight="bold">
        {t('riskMatrix.estimatedRisk.title')}
      </Text>
      <Flex align="center" gap="0">
        <Text variant="body-large">
          {formatNumber(cost, t)}{' '}
          {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
        </Text>
        <IconButton size="small" onClick={() => setShowDialog(true)}>
          <InfoIcon />
        </IconButton>
      </Flex>
      <EstimatedRiskInfoDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </Box>
  );
}
