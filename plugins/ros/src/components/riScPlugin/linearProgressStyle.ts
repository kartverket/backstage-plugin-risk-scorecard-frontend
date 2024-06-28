import { makeStyles } from '@material-ui/core';

export const useLinearProgressStyle = makeStyles(theme => ({
  linearProgress: {
    position: 'sticky',
    top: 0,
    margin: theme.spacing(2),
  },
}));
