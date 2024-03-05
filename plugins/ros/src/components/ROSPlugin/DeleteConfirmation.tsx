import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import React, { useContext } from 'react';
import { ScenarioContext } from './ScenarioContext';

export const DeleteConfirmation = () => {
  const { deleteConfirmationIsOpen, closeDeleteConfirmation, confirmDeletion } =
    useContext(ScenarioContext)!!;

  return (
    <Dialog open={deleteConfirmationIsOpen}>
      <DialogTitle>Er du sikker på at du vil du slette scenario?</DialogTitle>
      <DialogActions>
        <Button
          style={{ textTransform: 'none' }}
          onClick={closeDeleteConfirmation}
        >
          Avbryt
        </Button>

        <Button
          style={{ textTransform: 'none' }}
          onClick={() => {
            confirmDeletion();
            closeDeleteConfirmation();
          }}
        >
          Slett scenario
        </Button>
      </DialogActions>
    </Dialog>
  );
};
