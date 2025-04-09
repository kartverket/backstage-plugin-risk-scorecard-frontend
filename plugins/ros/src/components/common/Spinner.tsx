import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export function Spinner({ size }: { size?: string | number }) {
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
      <CircularProgress
        size={size}
        sx={{
          display: 'flex',
          marginTop: '200px',
        }}
      />
    </Box>
  );
}
