import * as React from 'react';
import { CircularProgressProps } from '@mui/material/CircularProgress';
import { LinearProgress } from '@material-ui/core';

const CircularProgressWithLabel = (
  props: CircularProgressProps & { step: number },
) => {
  const progress = props.step * 33.33;

  return <LinearProgress variant="determinate" value={progress} />;
};

interface CircularWithValueLabelProps {
  step: 1 | 2 | 3;
}

const Progress = ({ step }: CircularWithValueLabelProps) => {
  return <CircularProgressWithLabel step={step} />;
};

export default Progress;
