import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Box, IconButton } from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';
import { useState } from 'react';
import { useFontStyles } from '../../utils/style';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiSc } from '../../utils/types';
import { formatNumber } from '../../utils/utilityfunctions';
import { EstimatedRiskInfoDialog } from './EstimatedRiskInfoDialog';
import { Flex, Text } from '@backstage/ui';
import { useTheme } from '@mui/material/styles';

interface AggregatedCostProps {
  riSc: RiSc;
  initialRisk: boolean;
}

export function AggregatedCost({ riSc, initialRisk }: AggregatedCostProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const theme = useTheme();
  const { body2 } = useFontStyles();

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
    <Box
      style={{
        backgroundColor: theme.palette.mode === 'dark' ? '#FCEBCD' : '#FCEBCD',
        padding: '8px 16px',
      }}
    >
      <Text as="h3" variant="body-large" weight="bold">
        {t('riskMatrix.estimatedRisk.title')}
      </Text>
      <Flex align="center" gap="0">
        <Text variant="body-large" className={body2}>
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
