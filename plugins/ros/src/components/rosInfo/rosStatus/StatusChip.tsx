import Chip from '@material-ui/core/Chip';
import React, {
  ReactComponentElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { RosStatus } from '../../utils/types';
import { useStatusChipStyles, useStatusTextStyles } from './statusChipStyle';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import CircleIcon from '@mui/icons-material/Circle';
import { Grid, Typography } from '@material-ui/core';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';

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

const chipText = (status: RosStatus): string => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  switch (status) {
    case RosStatus.Draft:
      return t('rosStatus.statusBadge.missing');
    case RosStatus.SentForApproval:
    case RosStatus.Published:
      return t('rosStatus.statusBadge.approved');
    default:
      return t('rosStatus.statusBadge.error');
  }
};

const getChipTextStatus = (status: RosStatus): ReactNode => {
  const { statusChipText } = useStatusChipStyles();
  return <span className={statusChipText}>{chipText(status)}</span>;
};

const getPRStatus = (
  status: RosStatus,
  classes: ClassNameMap,
): ReactComponentElement<any> | null => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  switch (status) {
    case RosStatus.SentForApproval:
      return (
        <Typography className={classes.prStatus}>
          <GitHubIcon className={classes.prIcon} />
          {t('rosStatus.prStatus')}
        </Typography>
      );
    case RosStatus.Draft:
    case RosStatus.Published:
    default:
      return (
        <Typography className={classes.prStatus}>
          <GitHubIcon className={classes.prIcon} />
          {t('rosStatus.prStatus')}
        </Typography>
      );
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
    <Grid
      container
      direction="column"
      spacing={0}
      style={{ alignItems: 'end' }}
    >
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
