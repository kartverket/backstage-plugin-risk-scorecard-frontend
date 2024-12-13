import { GitPullRequestIcon } from '../common/GitPullRequestIcon';
import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';

interface OpenPullRequestButtonProps {
  handleClick: () => void;
}

export const OpenPullRequestButton = ({
  handleClick,
}: OpenPullRequestButtonProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Button
      sx={{
        gap: 1,
        textTransform: 'none',
      }}
      onClick={() => handleClick()}
    >
      <GitPullRequestIcon />
      <Typography
        sx={{
          whiteSpace: 'nowrap',
        }}
      >
        {t('sopsConfigDialog.openPR')}
      </Typography>
    </Button>
  );
};
