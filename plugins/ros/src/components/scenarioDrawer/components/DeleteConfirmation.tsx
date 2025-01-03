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
import { deletionScenario } from '../../../utils/utilityfunctions';
import { AlertProps } from '../../../utils/types';

export const DeleteConfirmation = ({
  deleteConfirmationIsOpen,
  setDeleteConfirmationIsOpen,
  showAlert,
}: {
  deleteConfirmationIsOpen: boolean;
  setDeleteConfirmationIsOpen: (deleteConfirmationIsOpen: boolean) => void;
  showAlert: ({ message, severity }: AlertProps) => void;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc: riSc, updateRiSc } = useRiScs();
  const { scenario, closeScenarioForm } = useScenario();

  return (
    <Dialog open={deleteConfirmationIsOpen}>
      <DialogTitle>
        {t('scenarioDrawer.deleteScenarioConfirmation')}
      </DialogTitle>
      <DialogActions sx={dialogActions}>
        <Button onClick={() => setDeleteConfirmationIsOpen(false)}>
          {t('dictionary.cancel')}
        </Button>
        <Button
          onClick={() => {
            setDeleteConfirmationIsOpen(false);
            closeScenarioForm();
            deletionScenario(riSc, updateRiSc, scenario, showAlert);
          }}
          variant="contained"
          color="error"
        >
          {t('scenarioDrawer.deleteScenarioButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
