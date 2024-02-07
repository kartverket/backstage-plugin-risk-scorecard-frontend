import { Button, Grid } from '@material-ui/core';
import { StatusChip } from '../ROSStatusChip/StatusChip';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import React, { ReactComponentElement } from 'react';
import { RosIdentifier, RosStatus } from '../utils/types';
import { useButtonStyles } from '../ROSPlugin/rosPluginStyle';
import { Alert, AlertTitle } from '@mui/material';
import { useAlertStyles } from '../ROSStatusChip/statusChipStyle';

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
                onClick={() => publishRosFn()}
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
