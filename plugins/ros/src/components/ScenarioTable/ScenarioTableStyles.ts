import { Theme, emphasize, makeStyles } from '@material-ui/core';

export const MatrixColors = [
  ['#6CC6A4', '#6CC6A4', '#6CC6A4', '#FBE36A', '#FBE36A'],
  ['#6CC6A4', '#6CC6A4', '#FBE36A', '#FBE36A', '#FF8B38'],
  ['#6CC6A4', '#FBE36A', '#FBE36A', '#FF8B38', '#FF8B38'],
  ['#FBE36A', '#FBE36A', '#FF8B38', '#FF8B38', '#F23131'],
  ['#FBE36A', '#FF8B38', '#FF8B38', '#F23131', '#F23131'],
];

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
