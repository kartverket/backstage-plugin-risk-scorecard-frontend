import { MenuProps } from '@material-ui/core/Menu';
import { makeStyles, Theme } from '@material-ui/core';

export const menuProps: Partial<MenuProps> = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
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
  paper: {
    width: '50%',
    padding: theme.spacing(8),
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 20,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
}));

export const useInputFieldStyles = makeStyles((theme: Theme) => ({
  inputBox: {
    paddingTop: theme.spacing(2),
    width: '100%',
  },
  formLabel: {
    marginBottom: theme.spacing(1),
  },
}));
