import { makeStyles, Theme } from '@material-ui/core';

export const useTabsTiltakStyles = makeStyles((theme: Theme) => ({
  arrow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
    marginTop: theme.spacing(5),
    color: '#1DB954',
  },
}));
