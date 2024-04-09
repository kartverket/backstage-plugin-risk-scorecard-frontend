import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import React, { useContext } from 'react';
import { ScenarioContext } from '../../rosPlugin/ScenarioContext';
import { pluginTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const DeleteConfirmation = () => {
  const { deleteConfirmationIsOpen, abortDeletion, confirmDeletion } =
    useContext(ScenarioContext)!!;

  const { t } = useTranslationRef(pluginTranslationRef);

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
