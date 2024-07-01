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

interface RiskError {
  title: string | null;
  scope: string | null;
}

export const RiScDialog = ({
  onClose,
  dialogState,
  createNewRiSc,
  updateRiSc,
  riSc,
  ...props
}: RiScDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { paper, content, buttons } = useRiScDialogStyles();
  const { h1 } = useFontStyles();

  const [newRiSc, setNewRiSc] = useState<RiSc>(
    dialogState === RiScDialogStates.Edit ? riSc!!.content : emptyRiSc(),
  );

  const [newRiScError, setNewRiScError] = useState<RiskError>({
    title: null,
    scope: null,
  });

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

  const setTitle = (title: string) => {
    setNewRiScError({
      ...newRiScError,
      title: null,
    });
    setNewRiSc({
      ...newRiSc,
      title: title,
    });
  };

  const setScope = (scope: string) => {
    setNewRiScError({
      ...newRiScError,
      scope: null,
    });
    setNewRiSc({
      ...newRiSc,
      scope: scope,
    });
  };

  const header =
    dialogState === RiScDialogStates.Create
      ? t('rosDialog.titleNew')
      : t('rosDialog.titleEdit');

  return (
    <Dialog
      classes={{ paper: paper }}
      open={dialogState !== RiScDialogStates.Closed}
      onClose={handleCancel}
      {...props}
    >
      <DialogContent>
        <Typography className={h1}>{header}</Typography>
        <Box className={content}>
          <TextField
            label={t('dictionary.title')}
            value={newRiSc.title}
            minRows={1}
            handleChange={setTitle}
            error={newRiScError.title}
            required
          />
        </Box>
        <Box className={content}>
          <TextField
            label={t('dictionary.scope')}
            subtitle={t('rosDialog.scopeDescription')}
            value={newRiSc.scope}
            minRows={4}
            handleChange={setScope}
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
        <Box className={buttons}>
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
