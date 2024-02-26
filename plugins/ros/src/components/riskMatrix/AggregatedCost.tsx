import React, { useState } from 'react';

import { Grid, IconButton, Typography } from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';
import { formatNOK } from '../utils/utilityfunctions';
import { ROS } from '../utils/types';
import { InfotextDialog } from './InfotextDialog';

interface AggregatedCostProps {
  ros: ROS;
  onClose: () => void;
}

export const AggregatedCost = ({ ros }: AggregatedCostProps) => {
  const cost = ros.scenarier
    .map(scenario => scenario.risiko.sannsynlighet * scenario.risiko.konsekvens)
    .reduce((a, b) => a + b, 0);

  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Grid alignItems="center" container direction="column">
        <Typography>Risikoen har en potensiell årlig kostnad på</Typography>
        <Grid
          container
          direction="row"
          alignContent="center"
          justifyContent="center"
          alignItems="center"
          style={{ paddingBottom: '1rem', paddingTop: '0.5rem' }}
        >
          <Typography align="center" variant="h5">
            {formatNOK(cost)} kr
          </Typography>
          <IconButton size="small" onClick={() => setShowDialog(true)}>
            <InfoIcon />
          </IconButton>
        </Grid>
      </Grid>
      <InfotextDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </>
  );
};
