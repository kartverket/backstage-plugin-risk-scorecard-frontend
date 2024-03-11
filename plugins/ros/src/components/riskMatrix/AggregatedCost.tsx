import React, { useState } from 'react';
import { Grid, IconButton, makeStyles, Typography } from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';
import { formatNOK } from '../utils/utilityfunctions';
import { ROS } from '../utils/types';
import { EstimatedRiskInfoDialog } from './EstimatedRiskInfoDialog';

interface AggregatedCostProps {
  ros: ROS;
  startRisiko: boolean;
}

const useStyles = makeStyles({
  gridOuterContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  gridInnerContainer: {
    display: 'flex',
    justifyContent: 'start',
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
  const classes = useStyles();
  return (
    <>
      <Grid container className={classes.gridOuterContainer}>
        <Grid item>
          <Typography>Estimert risiko</Typography>
        </Grid>
        <Grid item className={classes.gridInnerContainer}>
          <Typography variant="h5">{formatNOK(cost)} kr/år</Typography>
          <IconButton size="small" onClick={() => setShowDialog(true)}>
            <InfoIcon />
          </IconButton>
        </Grid>
      </Grid>
      <EstimatedRiskInfoDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </>
  );
};
