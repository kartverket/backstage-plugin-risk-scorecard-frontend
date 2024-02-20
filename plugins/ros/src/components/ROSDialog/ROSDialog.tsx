import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import { TextField } from '../ScenarioDrawer/Textfield';
import { ROS } from '../../../../../../plugins/ros/src/components/utils/interfaces';
import { useDialogStyles } from './DialogStyle';

interface ROSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  setRos: (ros: ROS) => void;
  saveRos: (newRos: ROS) => void;
}

interface NewROSOptions {
  withVersions: boolean;
}

export const ROSDialog = ({
  isOpen,
  onClose,
  setRos,
  saveRos,
  ...props
}: ROSDialogProps) => {
  const emptyROS = (withVersions: NewROSOptions): ROS => ({
    skjemaVersjon: withVersions ? '1' : '',
    tittel: '',
    omfang: '',
    scenarier: [],
  });

  const [newROS, setNewROS] = useState<ROS>(emptyROS({ withVersions: true }));

  const classes = useDialogStyles();

  const clearROS = () => {
    setNewROS(emptyROS({ withVersions: false }));
  };

  const handleCreate = () => {
    setRos(newROS);
    saveRos(newROS);
    onClose();
    clearROS();
  };

  const handleCancel = () => {
    onClose();
    clearROS();
  };

  const setTittel = (event: ChangeEvent<{ value: unknown }>) =>
    setNewROS({
      ...newROS,
      tittel: event.target.value as string,
    });

  const setOmfang = (event: ChangeEvent<{ value: unknown }>) =>
    setNewROS({
      ...newROS,
      omfang: event.target.value as string,
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
