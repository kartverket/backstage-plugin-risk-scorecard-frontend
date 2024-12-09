import { PullRequestObject } from '../../utils/DTOs';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, ListItemButton, Tooltip } from '@mui/material';
import { GitHubIcon } from '@backstage/core-components';
import ListItemText from '@mui/material/ListItemText';
import { getPullRequestSecondaryText } from '../../utils/utilityfunctions';
import React from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';

interface PullRequestComponentProps {
  pullRequest: PullRequestObject;
}

export const PullRequestComponent = ({
  pullRequest,
}: PullRequestComponentProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Tooltip title={t('sopsConfigDialog.gotoPullRequest')}>
      <ListItemButton
        onClick={() => {
            window.open(pullRequest.url, "_blank")?.focus()
        }}
        dense={true}
      >
        <ListItemAvatar>
          <Avatar>
            <GitHubIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={pullRequest.title}
          secondary={getPullRequestSecondaryText(
            new Date(pullRequest.createdAt),
            pullRequest.openedBy,
          )}
        />
      </ListItemButton>
    </Tooltip>
  );
};
