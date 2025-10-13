import { Theme, makeStyles } from '@material-ui/core';

export const useTableStyles = makeStyles((theme: Theme) => ({
  riskColor: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    width: theme.spacing(1),
    height: theme.spacing(1),
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

  tableCellDragIcon: {
    minWidth: '1px0px',
    padding: '',
    width: '2%',
    '&.MuiTableCell-root': {
      color: theme.palette.type === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
      border: 'none',
    },
  },

  tableCell: {
    minWidth: '120px',
    padding: '20px 10px 20px 16px',
    width: '15%',
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
    width: '55%',
    '&.MuiTableCell-root': {
      fontSize: theme.spacing(2),
      color: theme.palette.type === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
      border: 'none',
    },
  },
  tableCellContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    fontFamily: 'helvetica Neue',
    width: '100%',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    '@media (max-width: 1280px)': {
      height: '80px',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    gap: '16px',
    paddingLeft: '24px',
    paddingRight: '24px',
    opacity: 1,
    transform: 'rotate(0deg)',
    marginTop: '8px',
    marginBottom: '8px',
  },

  filterBox: {
    fontSize: '15px',
    fontWeight: 500,
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '8px',
    paddingLeft: '20px',
    paddingBottom: '8px',
    paddingRight: '20px',
    borderRadius: '24px',
    opacity: 1,
    transform: 'rotate(0deg)',
    width: 'auto',
  },
  filterSpan: {
    fontSize: '15px',
    width: '26px',
    height: '26px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
    transform: 'rotate(0deg)',
    color: 'white',
  },
  tableCard: {
    cursor: 'pointer',
    border: 'none',
    padding: '8px 24px',
    marginBottom: '8px',
    backgroundColor: '#F8F8F8',
    '&:hover': {
      backgroundColor: '#E0E0E0',
    },
  },
  gridItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 0',
  },
}));
