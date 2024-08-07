import { makeStyles } from '@material-ui/core';

export const useFontStyles = makeStyles(theme => ({
  h1: {
    fontSize: theme.spacing(4),
    fontWeight: 700,
  },
  h2: {
    fontSize: theme.spacing(3.5),
    fontWeight: 500,
  },
  h3: {
    fontSize: theme.spacing(2.5),
    fontWeight: 500,
  },
  body1: {
    fontSize: theme.spacing(2),
    fontWeight: 500,
  },
  body2: {
    fontSize: theme.spacing(2),
    fontWeight: 400,
    whiteSpace: 'pre-line',
  },
  label: {
    fontSize: theme.spacing(1.75),
    fontWeight: 700,
    textTransform: 'uppercase',
    color: theme.palette.type === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
    paddingBottom: '0.4rem',
  },
  labelSubtitle: {
    fontSize: theme.spacing(1.75),
    fontWeight: 400,
    color: theme.palette.type === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
    paddingBottom: '0.4rem',
    marginTop: '-0.2rem',
  },
  label2: {
    fontSize: theme.spacing(2),
    fontWeight: 700,
    textTransform: 'uppercase',
    color: theme.palette.type === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
  },

  subtitle1: {
    fontSize: theme.spacing(2),
    fontWeight: 700,
  },
  subtitle2: {
    fontSize: theme.spacing(2),
    fontWeight: 400,
  },
  headerSubtitle: {
    fontSize: theme.spacing(2),
    fontWeight: 500,
    paddingBottom: '1rem',
    marginTop: '-0.2rem',
  },
}));
