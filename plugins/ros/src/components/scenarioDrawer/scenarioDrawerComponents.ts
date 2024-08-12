import { SxProps, Theme } from '@mui/material/styles';

export const section: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
  padding: 2,
  position: 'relative'
};


export const riscSection: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '16px',
  width: '100%',
  padding: 2,
  position: 'relative',
  boxShadow: 'none'
};

export const headerSection: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  width: '100%',
}

export const selectSection: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
};

