import { makeStyles, Theme } from '@material-ui/core';

export const useTableStyles = makeStyles((theme: Theme) => ({
  table: {
    display: 'flex',
    borderCollapse: 'separate',
    borderSpacing: '0.3rem 0',
    width: '100%',
    overflowX: 'auto',
  },
  labelCell: {
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    whiteSpace: 'nowrap',
    width: '2rem !important',
    textTransform: 'uppercase',
  },
  cell: {
    padding: theme.spacing(1.5),
    border: '1px solid grey',
    textAlign: 'left',
    verticalAlign: 'top',
    minWidth: '135px',
  },
  voidCell: {
    padding: theme.spacing(1.5),
    border: '1px solid grey',
    color: theme.palette.type === 'dark' ? '#9E9E9E' : '#757575',
    textAlign: 'left',
    verticalAlign: 'top',
  },
  radio: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '0.5rem 0',
    gap: '0.3rem',
    textTransform: 'uppercase',
  },
}));
