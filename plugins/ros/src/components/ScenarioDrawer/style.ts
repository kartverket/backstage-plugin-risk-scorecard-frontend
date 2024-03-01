import { MenuProps } from '@material-ui/core/Menu';
import { makeStyles, Theme } from '@material-ui/core';

export const menuProps: Partial<MenuProps> = {
  PaperProps: {
    style: {
      maxHeight: 230,
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
  },
  risikoBadge: {
    width: '20px',
    height: '20px',
    borderRadius: '20%',
  },
}));

export const useFontStyles = makeStyles(theme => ({
  h1: {
    fontSize: theme.spacing(2.25),
    fontWeight: 700,
    color: '#D9D9D9',
  },
  h2: {
    fontSize: theme.spacing(3),
    fontWeight: 400,
  },
  body1: {
    fontSize: theme.spacing(2),
    fontWeight: 700,
  },
  body2: {
    fontSize: theme.spacing(2),
    fontWeight: 500,
  },
  label: {
    fontSize: theme.spacing(1.5),
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#D9D9D9',
  },
  subtitle1: {
    fontSize: theme.spacing(2),
    fontWeight: 700,
  },
  button: {
    textTransform: 'none',
  },
  risikoLevel: {
    fontSize: theme.spacing(2.25),
    fontWeight: 700,
    paddingTop: 0,
  },
}));

export const useInputFieldStyles = makeStyles((theme: Theme) => ({
  formControl: {
    width: '100%',
  },
  formLabel: {
    fontSize: theme.spacing(1.5),
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#D9D9D9',
    marginBottom: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor:
      theme.palette.type === 'dark' ? '#333333' : 'rgba(0, 0, 0, 0.1)',
  },
}));
