import { makeStyles } from '@material-ui/core';

export const useStatusChipStyles = makeStyles(() => ({
  statusChip: {
    borderRadius: '4px',
  },

  rosPublished: {
    borderColor: '#4caf50',
    color: '#4caf50',
  },

  rosSentForApproval: {
    borderColor: '#d97f35',
    color: '#d97f35',
  },

  rosDraft: {
    borderColor: '#e5B338FF',
    color: '#E5B338FF',
  },
}));
