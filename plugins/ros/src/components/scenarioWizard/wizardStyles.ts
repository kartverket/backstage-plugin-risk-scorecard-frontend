import { SxProps, Theme } from '@mui/material/styles';

export const riskTable: SxProps<Theme> = {
  overflow: 'auto',
};

export const riskRow: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '4px',
};

export const riskLabelCell: SxProps<Theme> = {
  writingMode: 'vertical-rl',
  transform: 'rotate(180deg)',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  paddingRight: 0,
  paddingLeft: 1,
  width: '1.5rem',
};

export const riskCell: SxProps<Theme> = theme => ({
  padding: theme.spacing(1.5),
  border: '1px solid grey',
  textAlign: 'left',
  verticalAlign: 'top',
  minWidth: '135px',
  whiteSpace: 'pre-line',
});

export const riskVoidCell: SxProps<Theme> = theme => ({
  padding: theme.spacing(1.5),
  border: '1px solid grey',
  color: theme.palette.mode === 'dark' ? '#9E9E9E' : '#757575',
  textAlign: 'left',
  verticalAlign: 'top',
});

export const riskRadio: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '0.5rem 0',
  gap: '0.3rem',
  textTransform: 'uppercase',
};
