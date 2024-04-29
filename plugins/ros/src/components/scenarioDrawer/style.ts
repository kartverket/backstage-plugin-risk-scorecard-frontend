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
    padding: theme.spacing(4),
    width: '65%',
  },
  paperView: {
    padding: theme.spacing(4),
    width: '50%',
    [theme.breakpoints.down('sm')]: {
      width: '90%',
      padding: theme.spacing(2),
    }
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
    height: '48px',
    borderRadius: '20%',
  },
  titleAndButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.type === 'dark' ? '#555555' : '#e0e0e0',
  },
  measure: {
    padding: theme.spacing(2),
    marginBottom: theme.palette.type === 'dark' ? theme.spacing(1) : '7px',
    backgroundColor: theme.palette.type === 'dark' ? '#55555519' : '#e0e0e019',
  },
  editIcon: {
    color: theme.palette.type === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.54)'
  }
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
    backgroundColor:
      theme.palette.type === 'dark' ? '#404040' : '#e0e0e0',
  },
  root: {
    '&.Mui-disabled': {
      color: theme.palette.type === 'dark' ? '#FFFFFF80' : '#757575',
    },
  },
}));
