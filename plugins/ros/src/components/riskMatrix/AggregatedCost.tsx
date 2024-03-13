import React, { useState } from 'react';
import { Box, IconButton, makeStyles, Typography } from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';
import { formatNOK } from '../utils/utilityfunctions';
import { ROS } from '../utils/types';
import { EstimatedRiskInfoDialog } from './EstimatedRiskInfoDialog';

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
  return (
    <Box className={outerBox}>
      <Typography>Estimert risiko</Typography>
      <Box className={innerBox}>
        <Typography variant="h5">{formatNOK(cost)} kr/år</Typography>
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
