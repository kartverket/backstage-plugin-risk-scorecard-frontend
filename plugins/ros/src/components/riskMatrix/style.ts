import { makeStyles, Theme } from '@material-ui/core';

export const useRiskMatrixStyles = makeStyles((theme: Theme) => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridTemplateRows: 'repeat(7, 1fr)',
    gap: '2px',
  },
  riskMatrix: {
    gridColumn: 'span 11',
    gridRow: 'span 6',
    display: 'grid',
    gridTemplateColumns: '1fr repeat(5, 2fr)',
    gridTemplateRows: 'repeat(6, 1fr)',
    gap: '0.3rem',
  },
  riskMatrixItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
  topRow: {
    gridColumn: 'span 12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
  rightColumn: {
    gridColumn: 'span 1',
    gridRow: 'span 5',
    padding: theme.spacing(2),
    writingMode: 'vertical-rl',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
  },
  tooltip: {
    backgroundColor: 'white',
    padding: theme.spacing(2),
    maxWidth: 500,
  },
  tooltipArrow: {
    color: 'white',
  },
  tooltipText: {
    padding: 0,
    color: 'black',
  },
}));
