import { makeStyles, Theme } from '@material-ui/core';

export const useRiskMatrixStyles = makeStyles((theme: Theme) => ({
  gridWrapper: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(4),
  },
  grid: {
    width: '100%',
    maxWidth: 400,
    display: 'grid',
    gridTemplateRows: 'repeat(5, 1fr) auto auto',
    gridTemplateColumns: '30px 30px repeat(5, 1fr)',
    gap: theme.spacing(0.5),
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
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
  square: {
    borderRadius: '10%',
    aspectRatio: '1 / 1',
  },
  circle: {
    height: '60%',
    aspectRatio: '1 / 1',
    borderRadius: '50%',
    cursor: 'pointer',
    minHeight: theme.spacing(2.5),
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#FFDD9D' : '#FCEBCD',
    },
  },
  circleText: {
    color: 'black',
  },
  tooltip: {
    backgroundColor:
      theme.palette.type === 'dark' ? 'var(--bui-bg)' : 'var(--bui-white)',
    padding: theme.spacing(2),
    maxWidth: 500,
  },
  tooltipArrow: {
    color: theme.palette.type === 'dark' ? 'var(--bui-bg)' : 'var(--bui-white)',
  },
  tooltipText: {
    padding: 0,
    color:
      theme.palette.type === 'dark' ? 'var(--bui-white)' : 'var(--bui-black)',
  },
}));
