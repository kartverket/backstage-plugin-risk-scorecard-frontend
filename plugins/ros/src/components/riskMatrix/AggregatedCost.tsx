import React, { useState } from 'react';
import { Box, IconButton, makeStyles, Typography } from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';
import { ROS } from '../utils/types';
import { EstimatedRiskInfoDialog } from './EstimatedRiskInfoDialog';
import { formatNOK } from '../utils/utilityfunctions';
import { pluginTranslationRef } from '../utils/translations';
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
  const { t } = useTranslationRef(pluginTranslationRef);
  const { num, unit } = formatNumber(cost, t);
  return (
    <Box className={outerBox}>
      <Typography>Estimert risiko</Typography>
      <Box className={innerBox}>
        <Typography variant="h5">
          {num} {unit && unit + ' '}
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

function formatNumber(
  cost: number,
  t: (s: any) => string,
): { num: string; unit?: string } {
  if (cost < 1e4) {
    return { num: formatNOK(cost) };
  } else {
    let zeros;
    let unit;
    if (cost < 1e6) {
      zeros = 1e3;
      unit = 'thousand';
    } else if (cost < 1e9) {
      zeros = 1e6;
      unit = 'million';
    } else if (cost < 1e12) {
      zeros = 1e9;
      unit = 'billion';
    } else {
      zeros = 1e12;
      unit = 'trillion';
    }
    let num = (cost / zeros).toFixed(1);
    if (num.endsWith('0') || zeros === 1e3) {
      num = (cost / zeros).toFixed(0);
    }
    if (cost / zeros > 1 && unit != 'thousand') {
      unit = unit + 's';
    }
    unit = t(`riskMatrix.estimatedRisk.suffix.${unit}`) ?? unit;
    return { num, unit };
  }
}
