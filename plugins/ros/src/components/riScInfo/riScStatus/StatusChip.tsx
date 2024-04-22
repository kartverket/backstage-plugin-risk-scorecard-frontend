import Chip from '@material-ui/core/Chip';
import React, {
  ReactComponentElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { RiScStatus } from '../../utils/types';
import { useStatusChipStyles, useStatusTextStyles } from './statusChipStyle';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import CircleIcon from '@mui/icons-material/Circle';
import { Grid, Typography } from '@material-ui/core';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';

interface ChipProps {
  currentRiScStatus: RiScStatus;
}

const getChipColor = (status: RiScStatus, classes: ClassNameMap): string => {
  switch (status) {
    case RiScStatus.Draft:
      return classes.riScDraft;
    case RiScStatus.SentForApproval:
    case RiScStatus.Published:
      return classes.riScPublished;
    default:
      return classes.riScDraft;
  }
};

const chipText = (status: RiScStatus): string => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  switch (status) {
    case RiScStatus.Draft:
      return t('rosStatus.statusBadge.missing');
    case RiScStatus.SentForApproval:
    case RiScStatus.Published:
      return t('rosStatus.statusBadge.approved');
    default:
      return t('rosStatus.statusBadge.error');
  }
};

const getChipTextStatus = (status: RiScStatus): ReactNode => {
  const { statusChipText } = useStatusChipStyles();
  return <span className={statusChipText}>{chipText(status)}</span>;
};

const getPRStatus = (
  status: RiScStatus,
  classes: ClassNameMap,
): ReactComponentElement<any> | null => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  switch (status) {
    case RiScStatus.SentForApproval:
      return (
        <Typography className={classes.prStatus}>
          <GitHubIcon className={classes.prIcon} />
          {t('rosStatus.prStatus')}
        </Typography>
      );
    case RiScStatus.Draft:
    case RiScStatus.Published:
    default:
      return null;
  }
};
export const StatusChip = ({ currentRiScStatus }: ChipProps) => {
  const chipClasses: ClassNameMap = useStatusChipStyles();
  const textClasses: ClassNameMap = useStatusTextStyles();

  const [chipColorClass, setChipColorClass] = useState<string | null>(null);

  useEffect(() => {
    const chipColor = getChipColor(currentRiScStatus, chipClasses);
    setChipColorClass(chipColor);
  }, [currentRiScStatus, chipClasses]);

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
          label={getChipTextStatus(currentRiScStatus)}
          icon={<CircleIcon className={chipClasses.statusIcon} />}
          className={[chipColorClass, chipClasses.statusChip].join(' ')}
        />
      </Grid>
      <Grid item>{getPRStatus(currentRiScStatus, textClasses)}</Grid>
    </Grid>
  );
};
