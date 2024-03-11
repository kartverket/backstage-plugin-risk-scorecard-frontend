import { makeStyles, Theme } from '@material-ui/core';

export const useRiskMatrixStyles = makeStyles((theme: Theme) => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gridTemplateRows: 'repeat(7, 1fr)',
    gap: '2px',
  },
  riskMatrixGrid: {
    gridColumn: 'span 6',
    gridRow: 'span 6',
    display: 'grid',
    gridTemplateColumns: '1fr repeat(6, 1fr)',
    gridTemplateRows: 'repeat(6, 1fr)',
    gap: '0.3rem',
  },
  riskMatrixItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0),
  },
  bottomRow: {
    gridColumn: '2 / span 6',
    gridRow: '7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing(5),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  leftColumn: {
    gridColumn: 'span 1',
    gridRow: 'span 5',
    writingMode: 'sideways-lr',
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
  riskSummary: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(2),
  },
}));
