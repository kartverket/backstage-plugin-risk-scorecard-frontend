import { MenuProps } from '@material-ui/core/Menu';
import { makeStyles, Theme } from '@material-ui/core';

export const menuProps: Partial<MenuProps> = {
  PaperProps: {
    style: {
      maxHeight: 255,
    },
  },
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'center',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'center',
  },
  variant: 'menu',
};

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
    fontWeight: 700,
  },
  body2: {
    fontSize: theme.spacing(2),
    fontWeight: 400,
  },
  label: {
    fontSize: theme.spacing(1.75),
    fontWeight: 500,
    textTransform: 'uppercase',
    color: theme.palette.type === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
    paddingBottom: '0.4rem',
  },
  labelSubtitle: {
    fontSize: theme.spacing(1.5),
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
  button: {
    textTransform: 'none',
  },
  risikoLevel: {
    fontSize: theme.spacing(2.25),
    fontWeight: 700,
    paddingTop: 0,
  },
  tiltakSubtitle: {
    fontSize: theme.spacing(2.25),
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

export const useInputFieldStyles = makeStyles((theme: Theme) => ({
  formControl: {
    width: '100%',
  },
  formLabel: {
    fontSize: theme.spacing(1.75),
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(1),
    color: theme.palette.type === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
  },
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.type === 'dark' ? '#404040' : '#e0e0e0',
  },
  root: {
    '&.Mui-disabled': {
      color: theme.palette.type === 'dark' ? '#FFFFFF80' : '#757575',
    },
  },
}));

export const useSpinnerStyles = makeStyles({
  container: {
    display: 'flex',
    minWidth: '100wh',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  spinner: {
    display: 'flex',
    marginTop: '200px',
  },
});
