import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export const Spinner = ({
  size,
  text,
}: {
  size?: string | number;
  text: string;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        minWidth: '100wh',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column', // Stacks spinner and text vertically
          alignItems: 'center', // Centers spinner and text horizontally
        }}
      >
        <CircularProgress
          size={size}
          sx={{
            display: 'flex',
            marginTop: '200px',
          }}
        />
        <Typography
          variant="caption"
          component="div"
          sx={{ color: 'text.secondary', marginTop: '10px' }}
        >{`${text}`}</Typography>
      </Box>
    </Box>
  );
};
