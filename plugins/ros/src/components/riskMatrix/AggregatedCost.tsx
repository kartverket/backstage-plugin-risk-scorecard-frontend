import React from 'react';
import { ROS } from '../utils/interfaces';
import { Typography } from '@material-ui/core';
import { formatNOK } from '../utils/utilityfunctions';

interface AggregatedCostProps {
  ros: ROS;
}

export const AggregatedCost = ({ ros }: AggregatedCostProps) => {
  const cost = ros.scenarier
    .map(scenario => scenario.risiko.sannsynlighet * scenario.risiko.konsekvens)
    .reduce((a, b) => a + b, 0);

  return (
    <Typography>
      Den aggregerte risikokostnaden for ROS-en er {formatNOK(cost)},- NOK
    </Typography>
  );
};
