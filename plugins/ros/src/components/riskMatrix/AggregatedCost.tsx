import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Box, IconButton, Typography } from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';
import { useState } from 'react';
import { useFontStyles } from '../../utils/style';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiSc } from '../../utils/types';
import { formatNumber } from '../../utils/utilityfunctions';
import { EstimatedRiskInfoDialog } from './EstimatedRiskInfoDialog';
import { useAggregatedCostStyles } from './aggregatedCostStyle';

interface AggregatedCostProps {
  riSc: RiSc;
  initialRisk: boolean;
}

export function AggregatedCost({ riSc, initialRisk }: AggregatedCostProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { outerBox, innerBox } = useAggregatedCostStyles();
  const { label2, body2 } = useFontStyles();

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
    <Box className={outerBox}>
      <Typography className={label2}>
        {t('riskMatrix.estimatedRisk.title')}
      </Typography>
      <Box className={innerBox}>
        <Typography className={body2}>
          {formatNumber(cost, t)}{' '}
          {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
        </Typography>
        <IconButton size="small" onClick={() => setShowDialog(true)}>
          <InfoIcon />
        </IconButton>
      </Box>
      <EstimatedRiskInfoDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </Box>
  );
}
