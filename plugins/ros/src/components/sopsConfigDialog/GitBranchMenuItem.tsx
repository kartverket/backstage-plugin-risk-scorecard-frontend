import Box from '@mui/material/Box';
import { GitBranchIcon } from '../common/GitBranchIcon';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { GitPullRequestIcon } from '../common/GitPullRequestIcon';

interface GitBranchMenuItemProps {
  value: string;
  text: string;
  handleClick: (branch: string, isNewBranch: boolean) => void;
  isPullRequest: boolean;
  setBold: boolean;
}

export const GitBranchMenuItem = ({
  value,
  text,
  handleClick,
  isPullRequest,
  setBold,
}: GitBranchMenuItemProps) => {
  return (
    <MenuItem onClick={() => handleClick(value, false)} value={value}>
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
};
