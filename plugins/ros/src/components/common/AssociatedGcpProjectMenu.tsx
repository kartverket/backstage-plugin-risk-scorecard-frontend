import React from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Button from '@mui/material/Button';
import { EnhancedEncryptionOutlined } from '@material-ui/icons';

export const AssociatedGcpProjectMenu = (handleClick: () => {}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Button
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
      }}
      onClick={handleClick()}
    >
      {`${t('associatedGcpProject.description')}: TEST-PROD`}
      <EnhancedEncryptionOutlined />
    </Button>
  );
};