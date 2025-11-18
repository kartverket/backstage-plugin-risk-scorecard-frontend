import { Theme, makeStyles } from '@material-ui/core';

export const useTabsStyle = makeStyles((theme: Theme) => ({
  tab: {
    backgroundColor: 'transparent',
    color: theme.palette.type === 'dark' ? 'white' : 'black',
    '&:hover': {
      backgroundColor: 'transparent',
      color: theme.palette.type === 'dark' ? 'white' : 'black',
    },
  },
}));
