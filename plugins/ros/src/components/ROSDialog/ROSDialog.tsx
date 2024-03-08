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

  const [newROSError, setNewROSError] = useState<{
    tittel: string | null;
    omfang: string | null;
  }>({
    tittel: null,
    omfang: null,
  });

  const classes = useDialogStyles();
  const { h1 } = useFontStyles();

  const clearROS = () => {
    setNewROS(emptyROS(false));
  };

  const handleCreate = () => {
    setNewROSError({
      tittel: newROS.tittel ? null : 'Tittel må fylles ut',
      omfang: newROS.omfang ? null : 'Omfang må fylles ut',
    });
    if (!newROS.tittel || !newROS.omfang) return;

    saveRos(newROS);
    onClose();
    clearROS();
  };

  const handleCancel = () => {
    onClose();
    clearROS();
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
            error={newROSError.tittel}
            required
          />
        </Box>
        <Box className={classes.content}>
          {/* <Typography className={label}>Omfang</Typography>
          <Typography className={labelSubtitle}>
            Hva risikoanalysen skal vurdere. Hva som ikke inngår som en del av
            omfanget må også defineres.
          </Typography>*/}
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
