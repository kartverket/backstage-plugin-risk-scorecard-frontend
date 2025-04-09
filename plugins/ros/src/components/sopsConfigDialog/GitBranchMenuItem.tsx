import Box from '@mui/material/Box';
import { GitBranchIcon } from '../common/GitBranchIcon';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

import { GitPullRequestIcon } from '../common/GitPullRequestIcon';

interface GitBranchMenuItemProps {
  value: string;
  text: string;
  handleClick: (branch: string) => void;
  isPullRequest: boolean;
  setBold: boolean;
}

export function GitBranchMenuItem({
  value,
  text,
  handleClick,
  isPullRequest,
  setBold,
}: GitBranchMenuItemProps) {
  return (
    <MenuItem onClick={() => handleClick(value)} value={value}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {isPullRequest ? <GitPullRequestIcon /> : <GitBranchIcon />}
        {isPullRequest && setBold ? (
          <Typography sx={{ fontWeight: 'bold' }}>{text}</Typography>
        ) : (
          <Typography>{text}</Typography>
        )}
      </Box>
    </MenuItem>
  );
}
