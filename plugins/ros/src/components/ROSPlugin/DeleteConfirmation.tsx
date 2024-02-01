import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import React from 'react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  close: () => void;
  confirmDeletion: () => void;
}

export const DeleteConfirmation = ({
  isOpen,
  close,
  confirmDeletion,
}: DeleteConfirmationProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogTitle>
        {'Er du sikker på at du vil du slette scenario?'}
      </DialogTitle>
      <DialogActions>
        <Button style={{ textTransform: 'none' }} onClick={close}>
          Avbryt
        </Button>

        <Button
          style={{ textTransform: 'none' }}
          onClick={() => {
            confirmDeletion();
            close();
          }}
        >
          Slett scenario
        </Button>
      </DialogActions>
    </Dialog>
  );
};
