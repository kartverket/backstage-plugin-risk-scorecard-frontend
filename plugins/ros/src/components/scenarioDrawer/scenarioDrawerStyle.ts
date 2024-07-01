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
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  risikoBadge: {
    width: '20px',
    height: '48px',
    borderRadius: '4px',
  },
  titleAndButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    width: '100%',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.type === 'dark' ? '#555555' : '#e0e0e0',
  },
  gridContainer: {
    marginBottom: theme.palette.type === 'dark' ? theme.spacing(1) : '7px',
    backgroundColor: theme.palette.type === 'dark' ? '#55555519' : '#e0e0e019',
  },
}));
