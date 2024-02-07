import { Button, Grid } from '@material-ui/core';
import { StatusChip } from '../ROSStatusChip/StatusChip';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import React from 'react';
import { RosStatus } from '../utils/types';
import { useButtonStyles } from '../ROSPlugin/rosPluginStyle';

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
    <Grid item xs={2}>
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
