import { makeStyles, Theme } from '@material-ui/core';

export const useScenarioDrawerStyles = makeStyles((theme: Theme) => ({
  drawer: {
    padding: theme.spacing(4),
    width: '50%',
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
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginTop: theme.spacing(4),
  },
  risikoBadge: {
    width: '20px',
    height: '48px',
    borderRadius: '20%',
  },
  titleAndButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.type === 'dark' ? '#555555' : '#e0e0e0',
  },
  gridContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.palette.type === 'dark' ? theme.spacing(1) : '7px',
    backgroundColor: theme.palette.type === 'dark' ? '#55555519' : '#e0e0e019',
  },
  editIcon: {
    color: theme.palette.type === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.54)',
  },
}));
