import { Theme, makeStyles } from '@material-ui/core';

// TODO: kutt denne
export const useRiScDialogStyles = makeStyles((theme: Theme) => ({
  paper: {
    width: '80%',
    padding: theme.spacing(2),
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttons: {
    display: 'flex',
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
