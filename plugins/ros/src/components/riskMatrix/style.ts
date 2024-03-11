import { makeStyles, Theme } from '@material-ui/core';

export const useRiskMatrixStyles = makeStyles((theme: Theme) => ({
  gridWrapper: {
    maxWidth: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateRows: 'repeat(5, 1fr) auto auto',
    gridTemplateColumns: '34px 34px repeat(5, 1fr)',
    gap: theme.spacing(0.5),
    paddingRight: '72px',
  },
  konsekvens: {
    gridRow: '1 / span 5',
    writingMode: 'vertical-lr',
    transform: 'rotate(180deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sannsynlighet: {
    gridRow: 7,
    gridColumn: '3 / span 5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  index: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  square: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '15%',
    aspectRatio: '1 / 1',
  },
  circle: {
    backgroundColor: 'white',
    minWidth: theme.spacing(4),
    width: '60%',
    aspectRatio: '1 / 1',
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
