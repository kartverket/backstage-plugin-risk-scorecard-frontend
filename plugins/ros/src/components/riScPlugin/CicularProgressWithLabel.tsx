import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CircularProgressProps } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

export const CircularProgressWithLabel = (
  props: CircularProgressProps & {
    value: number;
    text: string;
    size?: string | number;
  },
) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '200px',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          padding: '10px',
        }}
      >
        <CircularProgress size={props.size} variant="determinate" {...props} />
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
          <Typography
            variant="caption"
            component="div"
            sx={{ color: 'text.secondary' }}
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
      <Typography
        variant="caption"
        component="div"
        sx={{ color: 'text.secondary' }}
      >
        {props.text}
      </Typography>
    </Box>
  );
};
