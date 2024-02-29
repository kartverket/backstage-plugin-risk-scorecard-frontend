import { makeStyles } from '@material-ui/core';

export const useButtonStyles = makeStyles(() => ({
  godkjennButton: {
    borderRadius: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  settingsButton: {
    borderRadius: '2px',
    minWidth: '80%',
    padding: '5px 10px 5px 10px',
  },
}));

export const useSpinnerStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  spinner: {
    marginTop: '200px',
  },
});
