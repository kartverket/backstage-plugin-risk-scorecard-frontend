import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import React from 'react';

interface CloseConfirmationProps {
  isOpen: boolean;
  close: () => void;
  save: () => void;
}

export const CloseConfirmation = ({
  isOpen,
  close,
  save,
}: CloseConfirmationProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogTitle>Vil du lagre endringene dine?</DialogTitle>
      <DialogActions>
        <Button style={{ textTransform: 'none' }} onClick={close}>
          Forkast endringer
        </Button>

        <Button
          style={{ textTransform: 'none' }}
          onClick={() => {
            save();
          }}
        >
          Lagre
        </Button>
      </DialogActions>
    </Dialog>
  );
};
