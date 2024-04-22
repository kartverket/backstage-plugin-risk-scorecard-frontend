import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@material-ui/core';
import { StatusChip } from './StatusChip';
import React, { ReactComponentElement, useState } from 'react';
import { RiScStatus, RiScWithMetadata } from '../../utils/types';
import { useButtonStyles } from '../../riScPlugin/riScPluginStyle';
import Alert from '@mui/material/Alert';
import { useRiScDialogStyles } from '../../riScDialog/riScDialogStyle';
import Checkbox from '@material-ui/core/Checkbox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';

interface RiScPublisDialogProps {
  openDialog: boolean;
  handleCancel: () => void;
  handlePublish: () => void;
}

const RiScPublishDialog = ({
  openDialog,
  handleCancel,
  handlePublish,
}: RiScPublisDialogProps): ReactComponentElement<any> => {
  const classes = useRiScDialogStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [userIsRisikoEierAndApproves, setUserIsRisikoEierAndApproves] =
    useState<boolean>(false);

  const handleCheckboxInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserIsRisikoEierAndApproves(event.target.checked);
  };

  return (
    <Dialog open={openDialog}>
      <DialogTitle>{t('publishDialog.title')}</DialogTitle>
      <DialogContent>
        <Alert severity="info" icon={false}>
          <Grid container>
            <Grid item xs={1}>
              <Checkbox
                color="primary"
                checked={userIsRisikoEierAndApproves}
                onChange={handleCheckboxInput}
              />
            </Grid>
            <Grid item xs={8}>
              {t('publishDialog.checkboxLabel')}
            </Grid>
          </Grid>
        </Alert>
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
            {t('dictionary.cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublish}
            disabled={!userIsRisikoEierAndApproves}
          >
            {t('dictionary.confirm')}
          </Button>
        </Box>
      </div>
    </Dialog>
  );
};

interface RiScStatusProps {
  selectedRiSc: RiScWithMetadata;
  publishRiScFn: () => void;
}

export const RiScStatusComponent = ({
  selectedRiSc,
  publishRiScFn,
}: RiScStatusProps) => {
  const statusComponentClasses = useButtonStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [publishRiScDialogIsOpen, setPublishRiScDialogIsOpen] =
    useState<boolean>(false);

  const handleApproveAndPublish = () => {
    publishRiScFn();
    setPublishRiScDialogIsOpen(false);
  };

  return (
    <Grid item container xs direction="column" alignItems="flex-end">
      <Grid item xs>
        <StatusChip currentRiScStatus={selectedRiSc.status} />
      </Grid>

      <Grid item container spacing={1} justifyContent="flex-end">
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            onClick={() => setPublishRiScDialogIsOpen(!publishRiScDialogIsOpen)}
            className={statusComponentClasses.godkjennButton}
            fullWidth
            disabled={selectedRiSc.status !== RiScStatus.Draft}
          >
            <Typography variant="button">
              {t('rosStatus.approveButton')}
            </Typography>
          </Button>
        </Grid>
      </Grid>

      <RiScPublishDialog
        openDialog={publishRiScDialogIsOpen}
        handlePublish={handleApproveAndPublish}
        handleCancel={() => setPublishRiScDialogIsOpen(false)}
      />
    </Grid>
  );
};
