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
  // const { selectedRiSc: riSc } = useRiScs();
  // const { scenario } = useScenario();
  // const { submitEditedScenarioToRiSc } = useScenario();

  const confirmDeletion = () => {
    // riSc.content.scenarios.forEach(s => {
    //   if (s.ID === scenario.ID) {
    //     const updatedActions = s.actions.filter(action => action.ID !== id);
    //     const updatedScenario = { ...s, actions: updatedActions };

    remove(index);
    onSubmit();
    // submitEditedScenarioToRiSc(updatedScenario);
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
