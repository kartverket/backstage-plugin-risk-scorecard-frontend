import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Typography,
} from '@material-ui/core';
import { TextField } from '../utils/Textfield';
import { ROS, ROSWithMetadata } from '../utils/types';
import { useFontStyles } from '../scenarioDrawer/style';
import { rosOmfangError, rosTittelError } from '../utils/constants';
import { emptyROS } from '../utils/utilityfunctions';
import {useRosDialogStyles} from "./rosDialogStyle";

export enum ROSDialogStates {
  Closed,
  Edit,
  Create,
}

interface ROSDialogProps {
  onClose: () => void;
  dialogState: ROSDialogStates;
  createNewRos: (newRos: ROS) => void;
  updateRos: (newRos: ROS) => void;
  ros: ROSWithMetadata | null;
}

export const ROSDialog = ({
  onClose,
  dialogState,
  createNewRos,
  updateRos,
  ros,
  ...props
}: ROSDialogProps) => {
  const [newROS, setNewROS] = useState<ROS>(
    dialogState === ROSDialogStates.Edit ? ros!!.content : emptyROS(),
  );

  const [newROSError, setNewROSError] = useState<{
    tittel: string | null;
    omfang: string | null;
  }>({
    tittel: null,
    omfang: null,
  });

  const classes = useRosDialogStyles();
  const { h1 } = useFontStyles();

  const handleCancel = () => {
    onClose();
    setNewROS(emptyROS());
    setNewROSError({
      tittel: null,
      omfang: null,
    });
  };

  const handleSave = () => {
    setNewROSError({
      tittel: newROS.tittel === '' ? rosTittelError : null,
      omfang: newROS.omfang === '' ? rosOmfangError : null,
    });
    if (!newROS.tittel || !newROS.omfang) return;

    if (dialogState === ROSDialogStates.Create) {
      createNewRos(newROS);
    } else {
      updateRos(newROS);
    }
    handleCancel();
  };

  const setTittel = (tittel: string) => {
    setNewROSError({
      ...newROSError,
      tittel: null,
    });
    setNewROS({
      ...newROS,
      tittel: tittel,
    });
  };

  const setOmfang = (omfang: string) => {
    setNewROSError({
      ...newROSError,
      omfang: null,
    });
    setNewROS({
      ...newROS,
      omfang: omfang,
    });
  };

  const header =
    dialogState === ROSDialogStates.Create
      ? 'Ny risiko- og sårbarhetsanalyse'
      : 'Rediger ROS-analyse';

  return (
    <Dialog
      classes={{ paper: classes.paper }}
      open={dialogState !== ROSDialogStates.Closed}
      onClose={handleSave}
      {...props}
    >
      <DialogContent>
        <Typography className={h1}>{header}</Typography>
        <Box className={classes.content}>
          <TextField
            label="Tittel"
            value={newROS.tittel}
            minRows={1}
            handleChange={setTittel}
            error={newROSError.tittel}
            required
          />
        </Box>
        <Box className={classes.content}>
          <TextField
            label="Omfang"
            subtitle="Hva risikoanalysen skal vurdere. Hva som ikke inngår som en del av omfanget må også defineres."
            value={newROS.omfang}
            minRows={4}
            handleChange={setOmfang}
            error={newROSError.omfang}
            required
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
          <Button variant="contained" color="primary" onClick={handleSave}>
            Lagre
          </Button>
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            Avbryt
          </Button>
        </Box>
      </div>
    </Dialog>
  );
};
