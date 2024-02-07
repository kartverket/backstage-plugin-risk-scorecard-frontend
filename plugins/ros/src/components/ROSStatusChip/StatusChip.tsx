import Chip from '@material-ui/core/Chip';
import React, { useEffect, useState } from 'react';
import { RosIdentifier, RosStatus } from '../utils/types';
import { useStatusChipStyles } from './statusChipStyle';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import CircleIcon from '@mui/icons-material/Circle';

interface ChipProps {
  selectedId: string;
  rosIdsWithStatus: RosIdentifier[];
}

const getChipColor = (status: RosStatus, classes: ClassNameMap): string => {
  switch (status) {
    case RosStatus.Draft:
      return classes.rosDraft;
    case RosStatus.SentForApproval:
      return classes.rosSentForApproval;
    case RosStatus.Published:
      return classes.rosPublished;
    default:
      return classes.rosDraft;
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
  const classes: ClassNameMap<string> = useStatusChipStyles();

  const [chipColorClass, setChipColorClass] = useState<string | null>(null);

  useEffect(() => {
    const chipColor = getChipColor(status, classes);
    setChipColorClass(chipColor);
  }, [status, classes]);

  return (
    <>
      <Chip
        color="primary"
        size="medium"
        variant="outlined"
        label="Sendt til godkjenning"
        icon={<CircleIcon />}
        className={[chipColorClass, classes.statusChip].join(' ')}
      />
    </>
  );
};
