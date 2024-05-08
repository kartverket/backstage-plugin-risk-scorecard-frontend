import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import React, { useContext } from 'react';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const DeleteConfirmation = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { deleteConfirmationIsOpen, abortDeletion, confirmDeletion } =
    useContext(ScenarioContext)!!;

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
