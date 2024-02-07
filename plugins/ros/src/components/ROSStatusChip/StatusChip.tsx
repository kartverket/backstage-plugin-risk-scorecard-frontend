import Chip from '@material-ui/core/Chip';
import React, { ReactComponentElement, useEffect, useState } from 'react';
import { RosIdentifier, RosStatus } from '../utils/types';
import { useStatusChipStyles, useStatusTextStyles } from './statusChipStyle';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import CircleIcon from '@mui/icons-material/Circle';
import { Grid, Typography } from '@material-ui/core';
import GitHubIcon from '@mui/icons-material/GitHub';

interface ChipProps {
  selectedId: string;
  rosIdsWithStatus: RosIdentifier[];
}

const getChipColor = (status: RosStatus, classes: ClassNameMap): string => {
  switch (status) {
    case RosStatus.Draft:
      return classes.rosDraft;
    case RosStatus.SentForApproval:
    case RosStatus.Published:
      return classes.rosPublished;
    default:
      return classes.rosDraft;
  }
};

const getChipTextStatus = (status: RosStatus): string => {
  switch (status) {
    case RosStatus.Draft:
      return 'Mangler godkjenning';
    case RosStatus.SentForApproval:
    case RosStatus.Published:
      return 'Godkjent';
    default:
      return 'Kunne ikke hente status';
  }
};

const getPRStatus = (
  status: RosStatus,
  classes: ClassNameMap,
): ReactComponentElement<any> | null => {
  switch (status) {
    case RosStatus.SentForApproval:
      return (
        <Typography className={classes.prStatus}>
          <GitHubIcon className={classes.prIcon} />
          Avventer godkjenning av PR
        </Typography>
      );
    case RosStatus.Draft:
    case RosStatus.Published:
    default:
      return null;
  }
};

export const getROSStatus = (
  rosIdsWithStatus: RosIdentifier[],
  selectedId: string,
) => {
  return rosIdsWithStatus.filter(x => x.id === selectedId)[0].status;
};

export const StatusChip = ({ rosIdsWithStatus, selectedId }: ChipProps) => {
  const status = getROSStatus(rosIdsWithStatus, selectedId);
  const chipClasses: ClassNameMap = useStatusChipStyles();
  const textClasses: ClassNameMap = useStatusTextStyles();

  const [chipColorClass, setChipColorClass] = useState<string | null>(null);

  useEffect(() => {
    const chipColor = getChipColor(status, chipClasses);
    setChipColorClass(chipColor);
  }, [status, chipClasses]);

  return (
    <Grid item>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Chip
            color="primary"
            size="medium"
            variant="outlined"
            label={getChipTextStatus(status)}
            icon={<CircleIcon className={chipClasses.statusIcon} />}
            className={[chipColorClass, chipClasses.statusChip].join(' ')}
          />
        </Grid>
        <Grid item xs={12}>
          {getPRStatus(status, textClasses)}
        </Grid>
      </Grid>
    </Grid>
  );
};
