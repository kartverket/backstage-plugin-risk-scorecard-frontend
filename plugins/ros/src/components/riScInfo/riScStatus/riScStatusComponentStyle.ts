import { makeStyles } from '@material-ui/core';

export const useButtonStyles = makeStyles(() => ({
  approveButton: {
    borderRadius: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));
