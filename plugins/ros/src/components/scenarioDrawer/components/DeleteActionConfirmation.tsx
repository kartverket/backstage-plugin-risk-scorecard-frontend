import Button from '@mui/material/Button';
import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { dialogActions } from '../../common/mixins';
import { FormScenario } from '../../../utils/types';
import { UseFieldArrayRemove, UseFormReturn } from 'react-hook-form';

export const DeleteActionConfirmation = ({
  deleteActionConfirmationIsOpen,
  setDeleteActionConfirmationIsOpen,
  remove,
  index,
  onSubmit,
}: {
  deleteActionConfirmationIsOpen: boolean;
  setDeleteActionConfirmationIsOpen: (
    deleteActionConfirmationIsOpen: boolean,
  ) => void;
  formMethods: UseFormReturn<FormScenario>;
  index: number;
  remove: UseFieldArrayRemove;
  onSubmit: () => void;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const confirmDeletion = () => {
    remove(index);
    onSubmit();
    setDeleteActionConfirmationIsOpen(false);
  };

  return (
    <Dialog open={deleteActionConfirmationIsOpen}>
      <DialogTitle>{t('scenarioDrawer.deleteActionConfirmation')}</DialogTitle>
      <DialogActions sx={dialogActions}>
        <Button onClick={() => setDeleteActionConfirmationIsOpen(false)}>
          {t('dictionary.cancel')}
        </Button>
        <Button onClick={confirmDeletion} variant="contained" color="error">
          {t('scenarioDrawer.deleteActionButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
