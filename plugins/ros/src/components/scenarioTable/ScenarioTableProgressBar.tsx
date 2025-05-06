import { Box, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';

interface ScenarioTableProgressBarProps {
  completedCount: number;
  totalCount: number;
}

const LinearProgressStyled = styled(LinearProgress)(({ theme }) => {
  return {
    height: theme.spacing(2),
    width: '100%',
    borderRadius: 5,
    backgroundColor:
      theme.palette.grey[theme.palette.mode === 'light' ? 200 : 700],
    '& .MuiLinearProgress-bar': {
      backgroundColor: theme.palette.primary.main,
    },
  };
});

export function ScenarioTableProgressBar({
  completedCount,
  totalCount,
}: ScenarioTableProgressBarProps) {
  return (
    <Box display="flex" alignItems="center" gap={2} width="100%">
      <Box sx={{ flexGrow: 1, minWidth: 100, width: '100%' }}>
        <LinearProgressStyled
          variant="determinate"
          value={100 * (completedCount / totalCount)}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}
      >
        {completedCount} / {totalCount}
        {completedCount === totalCount ? ' 👑' : ''}
      </Typography>
    </Box>
  );
}
