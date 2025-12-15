import { SxProps, Theme } from '@mui/material/styles';

export const label: SxProps<Theme> = {
  fontSize: '0.875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  paddingBottom: '0.4rem',
};

export const formLabel: SxProps<Theme> = {
  fontSize: '0.875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'inherit',
};

export const formHelperText: SxProps<Theme> = {
  fontSize: '0.875rem',
  fontWeight: 400,
  color: 'inherit',
  margin: 0,
};
