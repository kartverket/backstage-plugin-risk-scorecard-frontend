import React, { useState } from 'react';
import { Box, IconButton, makeStyles, Typography } from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';
import { RiSc } from '../utils/types';
import { EstimatedRiskInfoDialog } from './EstimatedRiskInfoDialog';
import { formatNOK } from '../utils/utilityfunctions';
import { pluginRiScTranslationRef } from '../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useFontStyles } from '../scenarioDrawer/style';

interface AggregatedCostProps {
  riSc: RiSc;
  initialRisk: boolean;
}

const useStyles = makeStyles({
  outerBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  innerBox: {
    display: 'flex',
    alignItems: 'center',
  },
});

export const AggregatedCost = ({ riSc, initialRisk }: AggregatedCostProps) => {
  const cost = riSc.scenarios
    .map(scenario =>
      initialRisk
        ? scenario.risk.probability * scenario.risk.consequence
        : scenario.remainingRisk.probability *
          scenario.remainingRisk.consequence,
    )
    .reduce((a, b) => a + b, 0);

  const [showDialog, setShowDialog] = useState(false);
  const { outerBox, innerBox } = useStyles();
  const { label2, body2 } = useFontStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
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
};

function formatNumber(cost: number, t: (s: any, c: any) => string): string {
  if (cost < 1e4) {
    return formatNOK(cost);
  } else {
    let { threshold, unit } = [
      { threshold: 1e6, unit: 'thousand' },
      { threshold: 1e9, unit: 'million' },
      { threshold: 1e12, unit: 'billion' },
      { threshold: 1e15, unit: 'trillion' },
    ].find(({ threshold }) => cost < threshold)!!;
    return t(`riskMatrix.estimatedRisk.suffix.${unit}`, {
      count: Number(((cost / threshold) * 1000).toFixed(0)),
    });
  }
}
