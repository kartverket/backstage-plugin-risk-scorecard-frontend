import { makeStyles } from '@material-ui/core';

export const useTabsTiltakStyles = makeStyles(theme => ({
  arrow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(3),
  },
}));

export const tabStyles = makeStyles(theme => ({
  tabPanel: {
    padding: 0,
    paddingTop: theme.spacing(3),
  },
}));
