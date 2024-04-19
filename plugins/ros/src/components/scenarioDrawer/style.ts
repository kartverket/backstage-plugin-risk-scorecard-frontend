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

export const useScenarioDrawerStyles = makeStyles((theme: Theme) => ({
  paperEdit: {
    padding: theme.spacing(8),
    width: '65%',
  },
  paperView: {
    padding: theme.spacing(8),
    width: '50%',
  },
}));

export const useScenarioDrawerContentStyles = makeStyles((theme: Theme) => ({
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginTop: theme.spacing(4),
  },
  risikoBadge: {
    width: '20px',
    height: '20px',
    borderRadius: '20%',
  },
}));

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
    backgroundColor:
      theme.palette.type === 'dark' ? '#404040' : 'rgba(0, 0, 0, 0.1)',
  },
  root: {
    '&.Mui-disabled': {
      color: theme.palette.type === 'dark' ? '#FFFFFF80' : '#757575',
    },
  },
}));
