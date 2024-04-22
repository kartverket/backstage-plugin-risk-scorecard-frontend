import { makeStyles } from '@material-ui/core';

export const useStatusChipStyles = makeStyles(() => ({
  statusChip: {
    borderRadius: '7px',
    maxHeight: 'fit-content',
    height: 'fit-content',
    margin: '0px',
  },

  statusChipText: {
    whiteSpace: 'normal',
  },

  statusIcon: {
    maxHeight: '10px',
  },

  rosPublished: {
    borderColor: '#88e763',
    color: '#88e763',
  },

  rosSentForApproval: {
    borderColor: '#E7A563FF',
    color: '#E7A563FF',
  },

  rosDraft: {
    borderColor: '#FBE36A',
    color: '#FBE36A',
  },
}));

export const useStatusTextStyles = makeStyles(() => ({
  prStatus: {
    fontSize: '14px',
    wrap: 'wrap',
  },
  prIcon: {
    fontSize: '12px',
    margin: '0px',
    padding: '0px',
    marginRight: '2px',
    marginLeft: '2px',
  },
}));

export const useAlertStyles = makeStyles(() => ({
  noApprovalBanner: {
    backgroundColor: '#FCEBCD',
    color: '#303030',
  },
  'MuiAlert-message': {
    color: '#B2750B',
  },
}));
