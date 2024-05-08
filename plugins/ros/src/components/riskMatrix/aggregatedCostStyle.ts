import { makeStyles } from '@material-ui/core';

export const useAggregatedCostStyles = makeStyles({
  outerBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  innerBox: {
    display: 'flex',
    alignItems: 'center',
  },
});
