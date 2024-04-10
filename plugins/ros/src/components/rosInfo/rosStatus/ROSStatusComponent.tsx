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
import { RosStatus, ROSWithMetadata } from '../../utils/types';
import { useButtonStyles } from '../../rosPlugin/rosPluginStyle';
import Alert from '@mui/material/Alert';
import { useRosDialogStyles } from '../../rosDialog/rosDialogStyle';
import Checkbox from '@material-ui/core/Checkbox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginTranslationRef } from '../../utils/translations';

interface ROSPublisDialogProps {
  openDialog: boolean;
  handleCancel: () => void;
  handlePublish: () => void;
}

const ROSPublishDialog = ({
  openDialog,
  handleCancel,
  handlePublish,
}: ROSPublisDialogProps): ReactComponentElement<any> => {
  const classes = useRosDialogStyles();
  const { t } = useTranslationRef(pluginTranslationRef);
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

interface ROSStatusProps {
  selectedROS: ROSWithMetadata;
  publishRosFn: () => void;
}

export const ROSStatusComponent = ({
  selectedROS,
  publishRosFn,
}: ROSStatusProps) => {
  const statusComponentClasses = useButtonStyles();
  const { t } = useTranslationRef(pluginTranslationRef);

  const [publishROSDialogIsOpen, setPublishROSDialogIsOpen] =
    useState<boolean>(false);

  const handleApproveAndPublish = () => {
    publishRosFn();
    setPublishROSDialogIsOpen(false);
  };

  return (
    <Grid item container xs direction="column" alignItems="flex-end">
      <Grid item xs>
        <StatusChip currentRosStatus={selectedROS.status} />
      </Grid>

      <Grid item container spacing={1} justifyContent="flex-end">
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            onClick={() => setPublishROSDialogIsOpen(!publishROSDialogIsOpen)}
            className={statusComponentClasses.godkjennButton}
            fullWidth
            disabled={selectedROS.status !== RosStatus.Draft}
          >
            <Typography variant="button">
              {t('rosStatus.approveButton')}
            </Typography>
          </Button>
        </Grid>
      </Grid>

      <ROSPublishDialog
        openDialog={publishROSDialogIsOpen}
        handlePublish={handleApproveAndPublish}
        handleCancel={() => setPublishROSDialogIsOpen(false)}
      />
    </Grid>
  );
};
