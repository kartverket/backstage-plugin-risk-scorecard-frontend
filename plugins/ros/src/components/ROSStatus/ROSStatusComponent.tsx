import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
} from '@material-ui/core';
import { StatusChip } from '../ROSStatusChip/StatusChip';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import React, { ReactComponentElement, useState } from 'react';
import { RosIdentifier, RosStatus } from '../utils/types';
import { useButtonStyles } from '../ROSPlugin/rosPluginStyle';
import { Alert, AlertTitle } from '@mui/material';
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
              ></Checkbox>
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
  currentROSId: string;
  currentRosStatus: RosStatus;
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
  currentROSId,
  currentRosStatus,
  publishRosFn,
}: ROSStatusProps) => {
  const buttonStyles = useButtonStyles();
  const [publishROSDialogIsOpen, setPublishROSDialogIsOpen] =
    useState<boolean>(false);

  const handleApproveAndPublish = () => {
    publishRosFn();
    setPublishROSDialogIsOpen(false);
  };

  return (
    <Grid item xs={3}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <StatusChip
            selectedId={currentROSId}
            currentRosStatus={currentRosStatus}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={8}>
              <Button
                style={{ textTransform: 'none' }}
                color="primary"
                variant="contained"
                onClick={() =>
                  setPublishROSDialogIsOpen(!publishROSDialogIsOpen)
                }
                className={buttonStyles.godkjennButton}
                fullWidth
                disabled={!rosNsApproval(currentRosStatus)}
              >
                Godkjenn ROS
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                color="primary"
                variant="outlined"
                className={buttonStyles.settingsButton}
              >
                <SettingsOutlinedIcon />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <ROSPublishDialog
        openDialog={publishROSDialogIsOpen}
        handlePublish={handleApproveAndPublish}
        handleCancel={() => setPublishROSDialogIsOpen(false)}
      ></ROSPublishDialog>
    </Grid>
  );
};

interface ROSAlertProperties {
  currentROSId: string | null;
  rosIdsWithStatus: RosIdentifier[] | null;
  rosStatus: RosStatus | null;
}

export const ROSStatusAlertNotApprovedByRisikoeier = ({
  currentROSId,
  rosIdsWithStatus,
  rosStatus,
}: ROSAlertProperties): ReactComponentElement<any> | null => {
  const classes = useAlertStyles();
  if (!rosIdsWithStatus || !currentROSId) return null;
  else if (rosStatus !== RosStatus.Draft) return null;
  return (
    <Alert severity="warning" className={classes.noApprovalBanner}>
      <AlertTitle>
        ROS-analysen inneholder endringer som ikke er godkjent
      </AlertTitle>
      Nivået for restrisiko har endret seg som krever ny godkjenning fra
      risikoeier.
    </Alert>
  );
};
