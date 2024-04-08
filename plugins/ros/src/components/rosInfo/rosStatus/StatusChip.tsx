import Chip from '@material-ui/core/Chip';
import React, { ReactComponentElement, useEffect, useState } from 'react';
import { RosStatus } from '../../utils/types';
import { useStatusChipStyles, useStatusTextStyles } from './statusChipStyle';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import CircleIcon from '@mui/icons-material/Circle';
import { Grid, Typography } from '@material-ui/core';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginTranslationRef } from '../../utils/translations';

interface ChipProps {
  currentRosStatus: RosStatus;
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
  const { t } = useTranslationRef(pluginTranslationRef);

  switch (status) {
    case RosStatus.Draft:
      return t('rosInfo.statusBox.status.missing');
    case RosStatus.SentForApproval:
    case RosStatus.Published:
      return t('rosInfo.statusBox.status.approved');
    default:
      return t('rosInfo.statusBox.status.error');
  }
};

const getPRStatus = (
  status: RosStatus,
  classes: ClassNameMap,
): ReactComponentElement<any> | null => {
  const { t } = useTranslationRef(pluginTranslationRef);

  switch (status) {
    case RosStatus.SentForApproval:
      return (
        <Typography className={classes.prStatus}>
          <GitHubIcon className={classes.prIcon} />
          {t('rosInfo.statusBox.prStatus')}
        </Typography>
      );
    case RosStatus.Draft:
    case RosStatus.Published:
    default:
      return null;
  }
};
export const StatusChip = ({ currentRosStatus }: ChipProps) => {
  const chipClasses: ClassNameMap = useStatusChipStyles();
  const textClasses: ClassNameMap = useStatusTextStyles();

  const [chipColorClass, setChipColorClass] = useState<string | null>(null);

  useEffect(() => {
    const chipColor = getChipColor(currentRosStatus, chipClasses);
    setChipColorClass(chipColor);
  }, [currentRosStatus, chipClasses]);

  return (
    <Grid container direction="column" spacing={0}>
      <Grid item>
        <Chip
          color="primary"
          size="medium"
          variant="outlined"
          label={getChipTextStatus(currentRosStatus)}
          icon={<CircleIcon className={chipClasses.statusIcon} />}
          className={[chipColorClass, chipClasses.statusChip].join(' ')}
        />
      </Grid>
      <Grid item>{getPRStatus(currentRosStatus, textClasses)}</Grid>
    </Grid>
  );
};
