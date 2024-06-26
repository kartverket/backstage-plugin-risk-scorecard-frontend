import { makeStyles, Theme } from '@material-ui/core';

export const useWizardStyle = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    width: '100%',
    maxWidth: theme.spacing(100),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  stepper: {
    background: 'transparent',
    padding: '2rem 0 2.5rem 0',
  },
  steps: {
    padding: '1rem 0 1rem 0',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainerRight: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  saveAndNextButtons: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  button: {
    '&.MuiButton-outlined': {
      color: theme.palette.type === 'dark' ? '#9CC9FF' : theme.palette.link,
      borderr: '1px solid rgba(25, 118, 210, 0.5)',
      '&:hover': {
        borderColor:
          theme.palette.type === 'dark' ? '#9CC9FF' : theme.palette.linkHover,
      },
    },
  },
}));
