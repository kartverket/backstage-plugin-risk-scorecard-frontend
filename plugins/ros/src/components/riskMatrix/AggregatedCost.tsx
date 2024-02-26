import React from 'react';

import { Grid, Typography } from '@material-ui/core';
import { formatNOK } from '../utils/utilityfunctions';
import { ROS } from '../utils/types';

interface AggregatedCostProps {
  ros: ROS;
}

export const AggregatedCost = ({ ros }: AggregatedCostProps) => {
  const cost = ros.scenarier
    .map(scenario => scenario.risiko.sannsynlighet * scenario.risiko.konsekvens)
    .reduce((a, b) => a + b, 0);

  return (
    <Grid alignContent="center" container direction="column">
      <Typography>Risikoen har en potensiell årlig kostnad på</Typography>
      <Typography style={{ paddingBottom: '1rem' }} align="center" variant="h5">
        {formatNOK(cost)} kr
      </Typography>
    </Grid>
  );
};
