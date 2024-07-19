import { makeStyles, Theme } from '@material-ui/core';

export const useScenarioDrawerStyles = makeStyles((theme: Theme) => ({
  drawer: {
    padding: theme.spacing(4),
    width: '50%',
    gap: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      width: '90%',
      padding: theme.spacing(2),
    },
    backgroundColor: theme.palette.type === 'dark' ? '#333333' : '#f8f8f8',
  },
  risikoBadge: {
    width: '20px',
    height: '48px',
    borderRadius: '4px',
  },
  section: {
    width: '100%',
    padding: theme.spacing(2),
  },
  gridContainer: {
    marginBottom: theme.spacing(1),
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    marginLeft: 'auto',
  },
}));
