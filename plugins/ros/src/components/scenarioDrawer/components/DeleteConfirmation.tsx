import Button from '@mui/material/Button';
import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useScenario } from '../../../contexts/ScenarioContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

export const DeleteConfirmation = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { deleteConfirmationIsOpen, abortDeletion, confirmDeletion } =
    useScenario();

  return (
    <Dialog open={deleteConfirmationIsOpen}>
      <DialogTitle>
        {t('scenarioDrawer.deleteScenarioConfirmation')}
      </DialogTitle>
      <DialogActions sx={{ gap: 1, paddingX: 3, paddingY: 2 }}>
        <Button onClick={abortDeletion}>{t('dictionary.cancel')}</Button>
        <Button onClick={confirmDeletion} variant="contained" color="error">
          {t('scenarioDrawer.deleteScenarioButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
