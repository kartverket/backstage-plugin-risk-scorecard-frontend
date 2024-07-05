import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useScenario } from '../../../ScenarioContext';

export const DeleteConfirmation = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { deleteConfirmationIsOpen, abortDeletion, confirmDeletion } =
    useScenario();

  return (
    <Dialog open={deleteConfirmationIsOpen}>
      <DialogTitle>
        {t('scenarioDrawer.deleteScenarioConfirmation')}
      </DialogTitle>
      <DialogActions>
        <Button style={{ textTransform: 'none' }} onClick={abortDeletion}>
          {t('dictionary.cancel')}
        </Button>

        <Button style={{ textTransform: 'none' }} onClick={confirmDeletion}>
          {t('scenarioDrawer.deleteScenarioButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
