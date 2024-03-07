import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Typography,
} from '@material-ui/core';
import { TextField } from '../ScenarioDrawer/Textfield';
import { useDialogStyles } from './DialogStyle';
import { ROS } from '../utils/types';
import { emptyROS } from '../utils/utilityfunctions';
import { useFontStyles } from '../ScenarioDrawer/style';

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
  const { label, labelSubtitle, h1 } = useFontStyles();

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
      <DialogContent>
        <Typography className={h1}>Ny risiko- og sårbarhetsanalyse</Typography>
        <Box className={classes.content}>
          <TextField
            label="Tittel"
            value={newROS.tittel}
            minRows={1}
            handleChange={setTittel}
          />
        </Box>
        <Box className={classes.content}>
          <Typography className={label}>Omfang</Typography>
          <Typography className={labelSubtitle}>
            Hva risikoanalysen skal vurdere. Hva som ikke inngår som en del av
            omfanget må også defineres.
          </Typography>
          <TextField
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
          <Button variant="contained" color="primary" onClick={handleCreate}>
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
