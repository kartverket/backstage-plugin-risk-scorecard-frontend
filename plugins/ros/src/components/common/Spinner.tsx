import { Flex } from '@backstage/ui';
import CircularProgress from '@mui/material/CircularProgress';

export function Spinner({ size }: { size?: string | number }) {
  return (
    <Flex
      align="start"
      justify="center"
      style={{
        minWidth: '100wh',
        height: '100vh',
      }}
    >
      <CircularProgress
        size={size}
        sx={{
          display: 'flex',
          marginTop: '200px',
        }}
      />
    </Flex>
  );
}
