import { makeStyles } from '@material-ui/core';

export const useActionBoxStyles = makeStyles(theme => ({
  alignCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  justifyEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  paddingTop: {
    paddingTop: theme.spacing(2),
  },
  actionDescription: {
    marginTop: theme.spacing(-2),
  },
  chipDropdown: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
}));
