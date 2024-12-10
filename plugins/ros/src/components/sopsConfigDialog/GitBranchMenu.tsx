import React, { useState } from 'react';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import { SopsConfig } from '../../utils/types';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { GitHubIcon } from '@backstage/core-components';
import Box from '@mui/material/Box';
import { GitBranchMenuItem } from './GitBranchMenuItem';

interface SelectSopsConfigComponentProps {
  chosenBranch: string;
  onChange: (branch: string) => void;
  sopsConfigs: SopsConfig[];
  hasOpenedOnce: boolean;
  handleOpenFirst: () => void;
}

export const GitBranchMenu = ({
  chosenBranch,
  onChange,
  sopsConfigs,
  hasOpenedOnce,
  handleOpenFirst,
}: SelectSopsConfigComponentProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    handleOpenFirst();
    setAnchorEl(event.currentTarget);
  };
  const handleClickMenuItem = (branch: string) => {
    onChange(branch);
    setAnchorEl(null);
  };

  const pullRequestCount = sopsConfigs.filter(
    config => config.pullRequest,
  ).length;

  return (
    <Badge
      color="error"
      badgeContent={pullRequestCount}
      invisible={hasOpenedOnce}
    >
      <Tooltip title="Git branch">
        <Button
          onClick={handleClick}
          size="small"
          sx={{
            gap: 1,
            textTransform: 'none',
          }}
        >
          <GitHubIcon />
          <Typography>{chosenBranch}</Typography>
        </Button>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        variant="selectedMenu"
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography
          sx={{
            fontStyle: 'italic',
            color: 'gray',
            marginLeft: 1,
          }}
        >
          Branches
        </Typography>
        {sopsConfigs.map((config, index) => (
          <GitBranchMenuItem
            key={index}
            value={config.branch}
            text={config.branch}
            handleClick={handleClickMenuItem}
            isPullRequest={false}
            setBold={false}
          />
        ))}
        {pullRequestCount > 0 && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <Typography
                sx={{
                  fontStyle: 'italic',
                  color: 'gray',
                  marginLeft: 1,
                }}
              >
                Pull requests
              </Typography>
            </Box>
            {sopsConfigs.map((config, index) =>
              config.pullRequest ? (
                <GitBranchMenuItem
                  key={index}
                  value={config.branch}
                  text={config.pullRequest.title}
                  handleClick={handleClickMenuItem}
                  isPullRequest={true}
                  setBold={!hasOpenedOnce}
                />
              ) : null,
            )}
          </Box>
        )}
      </Menu>
    </Badge>
  );
};
