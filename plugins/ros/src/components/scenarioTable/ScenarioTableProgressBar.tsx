import { Box } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import { Text } from '@backstage/ui';

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
      <Box sx={{ flexGrow: 1, minWidth: 120 }}>
        <LinearProgressStyled
          variant="determinate"
          value={100 * (completedCount / totalCount)}
        />
      </Box>
      <Box sx={{ width: 65, textAlign: 'left', ml: 1 }}>
        <Text variant="body-medium" style={{ whiteSpace: 'pre-line' }}>
          {' '}
          {completedCount} / {totalCount}
          {completedCount === totalCount ? ' 👑' : ''}
        </Text>
      </Box>
    </Box>
  );
}
