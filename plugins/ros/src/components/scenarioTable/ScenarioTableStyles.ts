import { Theme, makeStyles } from '@material-ui/core';

export const useTableStyles = makeStyles((theme: Theme) => ({
  riskColor: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    width: theme.spacing(1),
  },
  rowBackground: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    border: 'none',
    padding: 0,
    '&.MuiTableRow-root': {
      backgroundColor: theme.palette.type === 'dark' ? '#424242' : 'white',
      border: 'none',
    },
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#616161' : '#f5f5f5',
      cursor: 'pointer',
    },
  },
  titleBox: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom:
      theme.palette.type === 'dark'
        ? '1px solid #616161'
        : '1px solid #0000001f',
  },
  rowBorder: {
    display: 'flex',
    alignItems: 'center',
    '&.MuiTableRow-root': {
      borderBottom:
        theme.palette.type === 'dark'
          ? '1px solid #616161'
          : '1px solid #0000001f',
    },
  },
  tableCell: {
    display: 'flex',
    minWidth: '120px',
    padding: '20px 10px 20px 16px',
    gap: '0.4rem',
    '&.MuiTableCell-root': {
      fontSize: theme.spacing(2),
      color: theme.palette.type === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
      border: 'none',
    },
  },
  tableCellTitle: {
    display: 'flex',
    minWidth: '120px',
    padding: '20px 10px 20px 16px',
    gap: '0.4rem',
    flexGrow: 1,
    '&.MuiTableCell-root': {
      fontSize: theme.spacing(2),
      color: theme.palette.type === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
      border: 'none',
    },
  },
}));
