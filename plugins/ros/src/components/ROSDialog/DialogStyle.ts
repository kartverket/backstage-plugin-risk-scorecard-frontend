import { Theme, makeStyles } from '@material-ui/core';

export const useDialogStyles = makeStyles((theme: Theme) => ({
  paper: {
    width: '80%',
    padding: theme.spacing(2),
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  inputBox: {
    paddingTop: theme.spacing(2),
  },
  formLabel: {
    marginBottom: theme.spacing(1),
  },
}));
