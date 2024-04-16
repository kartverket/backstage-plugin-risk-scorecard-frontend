import React, { useState } from 'react';
import { Box, IconButton, makeStyles, Typography } from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';
import { ROS } from '../utils/types';
import { EstimatedRiskInfoDialog } from './EstimatedRiskInfoDialog';
import { formatNOK } from '../utils/utilityfunctions';
import { pluginRiScTranslationRef } from '../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

interface AggregatedCostProps {
  ros: ROS;
  startRisiko: boolean;
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

export const AggregatedCost = ({ ros, startRisiko }: AggregatedCostProps) => {
  const cost = ros.scenarier
    .map(scenario =>
      startRisiko
        ? scenario.risiko.sannsynlighet * scenario.risiko.konsekvens
        : scenario.restrisiko.sannsynlighet * scenario.restrisiko.konsekvens,
    )
    .reduce((a, b) => a + b, 0);

  const [showDialog, setShowDialog] = useState(false);
  const { outerBox, innerBox } = useStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Box className={outerBox}>
      <Typography>Estimert risiko</Typography>
      <Box className={innerBox}>
        <Typography variant="h5">
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
