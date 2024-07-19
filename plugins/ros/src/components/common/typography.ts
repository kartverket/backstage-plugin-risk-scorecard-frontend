import { SxProps, Theme } from '@mui/material/styles';

export const formLabel: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(1.75),
  fontWeight: 700,
  textTransform: 'uppercase',
  marginBottom: theme.spacing(1),
  color: theme.palette.mode === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
});

export const heading1: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(4),
  fontWeight: 700,
});

export const heading2: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(3.5),
  fontWeight: 500,
});

export const heading3: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(2.5),
  fontWeight: 500,
});

export const body1: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(2),
  fontWeight: 500,
});

export const body2: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(2),
  fontWeight: 400,
  whiteSpace: 'pre-line',
});

export const label: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(1.75),
  fontWeight: 700,
  textTransform: 'uppercase',
  color: theme.palette.mode === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
  paddingBottom: '0.4rem',
});

export const labelSubtitle: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(1.75),
  fontWeight: 400,
  color: theme.palette.mode === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
  paddingBottom: '0.4rem',
  marginTop: '-0.2rem',
});

export const label2: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(2),
  fontWeight: 700,
  textTransform: 'uppercase',
  color: theme.palette.mode === 'dark' ? '#F8F8F8' : 'rgba(0, 0, 0, 0.87)',
});

export const subtitle1: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(2),
  fontWeight: 700,
});

export const subtitle2: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(2),
  fontWeight: 400,
});

export const headerSubtitle: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(2),
  fontWeight: 500,
  paddingBottom: '1rem',
  marginTop: '-0.2rem',
});

export const risikoLevel: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(2.25),
  fontWeight: 700,
  paddingTop: 0,
});

export const actionSubtitle: SxProps<Theme> = theme => ({
  fontSize: theme.spacing(2.25),
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
});
