import { Button, Grid } from '@material-ui/core';
import { getROSStatus, StatusChip } from '../ROSStatusChip/StatusChip';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import React from 'react';
import { RosIdentifier, RosStatus } from '../utils/types';
import { useButtonStyles } from '../ROSPlugin/rosPluginStyle';

interface ROSStatusProps {
  currentROSId: string;
  rosIdsWithStatus: RosIdentifier[];
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
  rosIdsWithStatus,
  publishRosFn,
}: ROSStatusProps) => {
  const buttonStyles = useButtonStyles();

  return (
    <Grid item xs={2}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <StatusChip
            selectedId={currentROSId}
            rosIdsWithStatus={rosIdsWithStatus}
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
                disabled={
                  !rosNsApproval(getROSStatus(rosIdsWithStatus, currentROSId))
                }
              >
                Godkjenn
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
