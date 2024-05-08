import { makeStyles } from '@material-ui/core';

export const useActionBoxStyles = makeStyles(_ => ({
  alignCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  justifyEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));
