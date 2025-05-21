import { CircularProgressProps } from '@mui/material/CircularProgress';
import { LinearProgress } from '@material-ui/core';
import { RiScStatusEnum, RiScStatusEnumType } from './utils.ts';

function Progress(props: CircularProgressProps & { step: RiScStatusEnumType }) {
  const progress = {
    [RiScStatusEnum.CREATED]: 0,
    [RiScStatusEnum.DRAFT]: 33.33,
    [RiScStatusEnum.DELETION_DRAFT]: 33.33,
    [RiScStatusEnum.WAITING]: 66.67,
    [RiScStatusEnum.DELETION_WAITING]: 66.67,
    [RiScStatusEnum.PUBLISHED]: 100,
  }[props.step];

  return <LinearProgress variant="determinate" value={progress} />;
}

export default Progress;
