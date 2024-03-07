import React, { useState } from 'react';
import { Grid, IconButton, makeStyles, Typography } from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';
import { formatNOK } from '../utils/utilityfunctions';
import { ROS } from '../utils/types';
import { EstimatedRiskInfoDialog } from './EstimatedRiskInfoDialog';

interface AggregatedCostProps {
  ros: ROS;
}

const useStyles = makeStyles({
  gridOuterContainer: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  gridInnerContainer: {
    justifyContent: 'center',
    paddingBottom: '1rem',
    paddingTop: '0.5rem',
  },
});

export const AggregatedCost = ({ ros }: AggregatedCostProps) => {
  const cost = ros.scenarier
    .map(scenario => scenario.risiko.sannsynlighet * scenario.risiko.konsekvens)
    .reduce((a, b) => a + b, 0);

  const [showDialog, setShowDialog] = useState(false);
  const classes = useStyles();
  return (
    <>
      <Grid container className={classes.gridOuterContainer}>
        <Typography>Risikoen har en potensiell årlig kostnad på</Typography>
        <Grid container className={classes.gridInnerContainer}>
          <Typography align="center" variant="h5">
            {formatNOK(cost)} kr
          </Typography>
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
