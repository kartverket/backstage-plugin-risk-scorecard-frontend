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

  riScPublished: {
    borderColor: '#88e763',
    color: '#88e763',
  },

  riScSentForApproval: {
    borderColor: '#E7A563FF',
    color: '#E7A563FF',
  },

  riScDraft: {
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
    margin: '0px',
    padding: '0px',
    marginBottom: '-1px',
    marginRight: '2px',
    marginLeft: '2px',
  },
}));
