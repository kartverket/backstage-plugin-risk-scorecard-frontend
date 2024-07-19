import Paper, { PaperProps } from '@mui/material/Paper';
import { SxProps, Theme } from '@mui/material/styles';
import React from 'react';

const section: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  width: '100%',
  padding: '1rem',
};

const FormSection = ({ children, ...props }: PaperProps) => (
  <Paper sx={section} {...props}>
    {children}
  </Paper>
);

export default FormSection;
