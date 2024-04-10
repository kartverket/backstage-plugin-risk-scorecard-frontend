import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import React from 'react';
import { pluginTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

interface CloseConfirmationProps {
  isOpen: boolean;
  close: () => void;
  save: () => void;
}

export const CloseConfirmation = ({
  isOpen,
  close,
  save,
}: CloseConfirmationProps) => {
  const { t } = useTranslationRef(pluginTranslationRef);
  return (
    <Dialog open={isOpen}>
      <DialogTitle>{t('scenarioDrawer.closeConfirmation')}</DialogTitle>
      <DialogActions>
        <Button style={{ textTransform: 'none' }} onClick={close}>
          {t('dictionary.discardChanges')}
        </Button>

        <Button style={{ textTransform: 'none' }} onClick={save}>
          {t('dictionary.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
