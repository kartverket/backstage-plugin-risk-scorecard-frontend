import { Theme, makeStyles } from '@material-ui/core';

export const useTableStyles = makeStyles((theme: Theme) => ({
  riskColor: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0.8),
  },
  rowBackground: {
    backgroundColor: theme.palette.type === 'dark' ? '#424242' : 'white',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#616161' : '#f5f5f5',
      cursor: 'pointer',
    },
  },
  titleBackground: {
    backgroundColor: theme.palette.type === 'dark' ? '#424242' : 'white',
  },
}));
