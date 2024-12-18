import * as React from 'react';
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const CircularProgressWithLabel = (
  props: CircularProgressProps & { step: number },
) => {
  const progress = props.step * 33.33;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        size={80}
        thickness={4}
        value={progress}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ color: 'text.secondary' }}>
          {`${props.step}/3`}
        </Typography>
      </Box>
    </Box>
  );
};

interface CircularWithValueLabelProps {
  step: 1 | 2 | 3;
}

const Progress = ({ step }: CircularWithValueLabelProps) => {
  return <CircularProgressWithLabel step={step} />;
};

export default Progress;
