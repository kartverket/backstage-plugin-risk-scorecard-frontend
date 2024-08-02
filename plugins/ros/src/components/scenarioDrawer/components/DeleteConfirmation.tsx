import Button from '@mui/material/Button';
import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { dialogActions } from '../../common/mixins';
import { useScenario } from '../../../contexts/ScenarioContext';
import { useRiScs } from '../../../contexts/RiScContext';

export const DeleteConfirmation = ({
  deleteConfirmationIsOpen,
  setDeleteConfirmationIsOpen,
}: {
  deleteConfirmationIsOpen: boolean;
  setDeleteConfirmationIsOpen: (deleteConfirmationIsOpen: boolean) => void;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc: riSc, updateRiSc } = useRiScs();
  const { scenario, closeScenarioForm } = useScenario();

  const confirmDeletion = () => {
    if (riSc) {
      setDeleteConfirmationIsOpen(false);
      closeScenarioForm();
      const updatedScenarios = riSc.content.scenarios.filter(
        s => s.ID !== scenario.ID,
      );
      updateRiSc({ ...riSc.content, scenarios: updatedScenarios });
    }
  };

  return (
    <Dialog open={deleteConfirmationIsOpen}>
      <DialogTitle>
        {t('scenarioDrawer.deleteScenarioConfirmation')}
      </DialogTitle>
      <DialogActions sx={dialogActions}>
        <Button onClick={() => setDeleteConfirmationIsOpen(false)}>
          {t('dictionary.cancel')}
        </Button>
        <Button onClick={confirmDeletion} variant="contained" color="error">
          {t('scenarioDrawer.deleteScenarioButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
