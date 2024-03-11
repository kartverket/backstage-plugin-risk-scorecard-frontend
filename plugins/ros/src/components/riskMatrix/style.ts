import { makeStyles, Theme } from '@material-ui/core';

export const useRiskMatrixStyles = makeStyles((theme: Theme) => ({
  gridWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  grid: {
    width: '100%',
    maxWidth: 600,
    display: 'grid',
    gridTemplateRows: 'repeat(5, 1fr) auto auto',
    gridTemplateColumns: '30px 30px repeat(5, 1fr)',
    paddingRight: '64px',
    gap: theme.spacing(0.5),
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: theme.spacing(2.5),
  },
  konsekvens: {
    gridRow: '1 / span 5',
    writingMode: 'vertical-lr',
    transform: 'rotate(180deg)',
  },
  sannsynlighet: {
    gridRow: 7,
    gridColumn: '3 / span 5',
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
    borderRadius: '10%',
    aspectRatio: '1 / 1',
  },
  circle: {
    backgroundColor: 'white',
    height: '60%',
    aspectRatio: '1 / 1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    minHeight: theme.spacing(2.5),
  },
  indexText: {
    fontWeight: 700,
    fontSize: theme.spacing(2.5),
  },
  circleText: {
    fontWeight: 700,
    color: 'black',
    fontSize: theme.spacing(2.5),
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
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor:
      theme.palette.type === 'dark' ? '#FFFFFF1A' : 'rgba(0, 0, 0, 0.1)',
  },
}));
