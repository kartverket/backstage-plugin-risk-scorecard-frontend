import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import React from 'react';

interface CloseConfirmationProps {
  isOpen: boolean;
  close: () => void;
  cancel: () => void;
}

export const CloseConfirmation = ({
  isOpen,
  close,
  cancel,
}: CloseConfirmationProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogTitle>Er du sikker på at du vil lukke uten å lagre?</DialogTitle>
      <DialogActions>
        <Button style={{ textTransform: 'none' }} onClick={cancel}>
          Avbryt
        </Button>

        <Button
          style={{ textTransform: 'none' }}
          onClick={() => {
            close();
          }}
        >
          Lukk
        </Button>
      </DialogActions>
    </Dialog>
  );
};
