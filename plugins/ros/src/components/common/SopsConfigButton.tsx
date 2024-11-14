import React from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Button from '@mui/material/Button';
import { Settings } from '@material-ui/icons';

interface SopsConfigButtonProps {
  handleClick: () => void;
}

export const SopsConfigButton = ({ handleClick } : SopsConfigButtonProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Button
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
      }}
      onClick={handleClick}
    >
      <Settings />
      {`${t('encryption.title')}`}
    </Button>
  );
};