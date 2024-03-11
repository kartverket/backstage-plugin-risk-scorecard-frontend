import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@material-ui/core';
import { StatusChip } from '../ROSStatusChip/StatusChip';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import React, { ReactComponentElement, useState } from 'react';
import { RosStatus, ROSWithMetadata } from '../utils/types';
import { useButtonStyles } from '../ROSPlugin/rosPluginStyle';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useAlertStyles } from '../ROSStatusChip/statusChipStyle';
import { useDialogStyles } from '../ROSDialog/DialogStyle';
import Checkbox from '@material-ui/core/Checkbox';

interface ROSPublisDialogProps {
  openDialog: boolean;
  handleCancel: () => void;
  handlePublish: () => void;
}

export const ROSPublishDialog = ({
  openDialog,
  handleCancel,
  handlePublish,
}: ROSPublisDialogProps): ReactComponentElement<any> => {
  const classes = useDialogStyles();
  const [userIsRisikoEierAndApproves, setUserIsRisikoEierAndApproves] =
    useState<boolean>(false);

  const handleCheckboxInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserIsRisikoEierAndApproves(event.target.checked);
  };

  return (
    <Dialog open={openDialog}>
      <DialogTitle>Godkjenn ROS</DialogTitle>
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
              Jeg bekrefter at jeg er risikoeier og godtar risikoen i denne
              risiko- og sårbarhetsanalysen.
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
            Avbryt
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublish}
            disabled={!userIsRisikoEierAndApproves}
          >
            Bekreft
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

const rosNsApproval = (status: RosStatus) => {
  switch (status) {
    case RosStatus.Draft:
      return true;
    case RosStatus.Published:
    case RosStatus.SentForApproval:
      return false;
    default:
      return false;
  }
};

export const ROSStatusComponent = ({
  selectedROS,
  publishRosFn,
}: ROSStatusProps) => {
  const statusComponentClasses = useButtonStyles();
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
            disabled={!rosNsApproval(selectedROS.status)}
          >
            <Typography variant="button">Godkjenn ROS</Typography>
          </Button>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            variant="outlined"
            className={statusComponentClasses.settingsButton}
          >
            <SettingsOutlinedIcon />
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

interface ROSAlertProperties {
  selectedROS: ROSWithMetadata | null;
  roses: ROSWithMetadata[] | null;
}

export const ROSStatusAlertNotApprovedByRisikoeier = ({
  selectedROS,
  roses,
}: ROSAlertProperties): ReactComponentElement<any> | null => {
  const { noApprovalBanner } = useAlertStyles();

  return !(
    roses &&
    selectedROS &&
    selectedROS.status === RosStatus.Draft
  ) ? null : (
    <Alert severity="warning">
      <AlertTitle>
        ROS-analysen inneholder endringer som ikke er godkjent.
      </AlertTitle>
      Nivået for restrisiko har endret seg som krever ny godkjenning fra
      risikoeier.
    </Alert>
  );
};
