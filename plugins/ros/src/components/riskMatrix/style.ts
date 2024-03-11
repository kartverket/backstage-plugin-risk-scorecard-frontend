import { makeStyles, Theme } from '@material-ui/core';

export const useRiskMatrixStyles = makeStyles((theme: Theme) => ({
  grid: {
    display: 'grid',
    gridTemplateRows: 'repeat(5, 4rem) auto auto',
    gridTemplateColumns: '2rem 2rem repeat(5, 4rem)',
    gap: '0.3rem',
    paddingRight: '4rem',
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
