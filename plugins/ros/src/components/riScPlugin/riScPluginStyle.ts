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

export const useLoadingStyles = makeStyles({
  container: {
    display: 'flex',
    minWidth: '100wh',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  spinner: {
    display: 'flex',
    marginTop: '200px',
  },
});
