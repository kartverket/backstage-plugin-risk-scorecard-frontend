import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import { TextField } from '../ScenarioDrawer/Textfield';
import { useDialogStyles } from './DialogStyle';
import { ROS } from '../utils/types';
import { emptyROS } from '../utils/utilityfunctions';

interface ROSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  saveRos: (newRos: ROS) => void;
}

export const ROSDialog = ({
  isOpen,
  onClose,
  saveRos,
  ...props
}: ROSDialogProps) => {
  const [newROS, setNewROS] = useState<ROS>(emptyROS(true));

  const classes = useDialogStyles();

  const clearROS = () => {
    setNewROS(emptyROS(false));
  };

  const handleCreate = () => {
    saveRos(newROS);
    onClose();
    clearROS();
  };

  const handleCancel = () => {
    onClose();
    clearROS();
  };

  const setTittel = (tittel: string) =>
    setNewROS({
      ...newROS,
      tittel: tittel,
    });

  const setOmfang = (omfang: string) =>
    setNewROS({
      ...newROS,
      omfang: omfang,
    });

  return (
    <Dialog
      classes={{ paper: classes.paper }}
      open={isOpen}
      onClose={onClose}
      {...props}
    >
      <DialogTitle>Ny analyse</DialogTitle>
      <DialogContent>
        <Box className={classes.content}>
          {/* TODO: feltvalidering */}
          <TextField
            label="Tittel"
            value={newROS.tittel}
            minRows={1}
            handleChange={setTittel}
          />
        </Box>
        <Box className={classes.content}>
          <TextField
            label="Omfang"
            value={newROS.omfang}
            minRows={4}
            handleChange={setOmfang}
          />
        </Box>
      </DialogContent>
      <div
        style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <Box className={classes.buttons}>
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            Avbryt
          </Button>
          <Button variant="contained" color="primary" onClick={handleCreate}>
            Opprett
          </Button>
        </Box>
      </div>
    </Dialog>
  );
};
