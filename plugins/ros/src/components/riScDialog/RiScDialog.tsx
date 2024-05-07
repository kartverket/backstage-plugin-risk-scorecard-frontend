import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Typography,
} from '@material-ui/core';
import { TextField } from '../utils/Textfield';
import { RiSc, RiScWithMetadata } from '../utils/types';
import { emptyRiSc } from '../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';
import { useRiScDialogStyles } from './riScDialogStyle';
import { useFontStyles } from '../utils/style';

export enum RiScDialogStates {
  Closed,
  Edit,
  Create,
}

interface RiScDialogProps {
  onClose: () => void;
  dialogState: RiScDialogStates;
  createNewRiSc: (newRiSc: RiSc) => void;
  updateRiSc: (newRiSc: RiSc) => void;
  riSc: RiScWithMetadata | null;
}

export const RiScDialog = ({
  onClose,
  dialogState,
  createNewRiSc,
  updateRiSc,
  riSc,
  ...props
}: RiScDialogProps) => {
  const [newRiSc, setNewRiSc] = useState<RiSc>(
    dialogState === RiScDialogStates.Edit ? riSc!!.content : emptyRiSc(),
  );

  const [newRiScError, setNewRiScError] = useState<{
    title: string | null;
    scope: string | null;
  }>({
    title: null,
    scope: null,
  });

  const classes = useRiScDialogStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h1 } = useFontStyles();

  const handleCancel = () => {
    onClose();
    setNewRiSc(emptyRiSc());
    setNewRiScError({
      title: null,
      scope: null,
    });
  };

  const handleSave = () => {
    setNewRiScError({
      title: newRiSc.title === '' ? t('rosDialog.titleError') : null,
      scope: newRiSc.scope === '' ? t('rosDialog.scopeError') : null,
    });
    if (!newRiSc.title || !newRiSc.scope) return;

    if (dialogState === RiScDialogStates.Create) {
      createNewRiSc(newRiSc);
    } else {
      updateRiSc(newRiSc);
    }
    handleCancel();
  };

  const setTittel = (tittel: string) => {
    setNewRiScError({
      ...newRiScError,
      title: null,
    });
    setNewRiSc({
      ...newRiSc,
      title: tittel,
    });
  };

  const setOmfang = (omfang: string) => {
    setNewRiScError({
      ...newRiScError,
      scope: null,
    });
    setNewRiSc({
      ...newRiSc,
      scope: omfang,
    });
  };

  const header =
    dialogState === RiScDialogStates.Create
      ? t('rosDialog.titleNew')
      : t('rosDialog.titleEdit');

  return (
    <Dialog
      classes={{ paper: classes.paper }}
      open={dialogState !== RiScDialogStates.Closed}
      onClose={handleSave}
      {...props}
    >
      <DialogContent>
        <Typography className={h1}>{header}</Typography>
        <Box className={classes.content}>
          <TextField
            label={t('dictionary.title')}
            value={newRiSc.title}
            minRows={1}
            handleChange={setTittel}
            error={newRiScError.title}
            required
          />
        </Box>
        <Box className={classes.content}>
          <TextField
            label={t('dictionary.scope')}
            subtitle={t('rosDialog.scopeDescription')}
            value={newRiSc.scope}
            minRows={4}
            handleChange={setOmfang}
            error={newRiScError.scope}
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
            {t('dictionary.save')}
          </Button>
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            {t('dictionary.cancel')}
          </Button>
        </Box>
      </div>
    </Dialog>
  );
};
