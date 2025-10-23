import { SxProps, Theme } from '@mui/material/styles';

export const section: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
  padding: 2,
  position: 'relative',
};

export const riscSection: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '16px',
  width: '100%',
  padding: 2,
  position: 'relative',
  boxShadow: 'none',
};

export const headerSection: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  width: '100%',
};

export const selectSection: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
  rowGap: '16px',
};

export const getAlertStyle = (severity: 'success' | 'warning' | 'error') => {
  const backgroundMap = {
    success: '#E9F8EB',
    warning: '#FFF7ED',
    error: '#FCF1E8',
  };

  const borderMap = {
    success: '1px solid #66B077',
    warning: '1px solid #CF914A',
    error: '1px solid #A32F00',
  };

  return {
    width: '45%',
    zIndex: 20,
    borderRadius: '4px',
    backgroundColor: backgroundMap[severity],
    border: borderMap[severity],
  };
};
