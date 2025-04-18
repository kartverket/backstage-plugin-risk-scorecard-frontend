import { CircularProgressProps } from '@mui/material/CircularProgress';
import { LinearProgress } from '@material-ui/core';

function CircularProgressWithLabel(
  props: CircularProgressProps & { step: number },
) {
  const progress = props.step * 33.33;

  return <LinearProgress variant="determinate" value={progress} />;
}

interface CircularWithValueLabelProps {
  step: 0 | 1 | 2 | 3;
}

function Progress({ step }: CircularWithValueLabelProps) {
  return <CircularProgressWithLabel step={step} />;
}

export default Progress;
