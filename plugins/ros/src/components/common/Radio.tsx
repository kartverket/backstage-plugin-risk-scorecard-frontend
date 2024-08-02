import React, { forwardRef } from 'react';
import MUIRadio, { RadioProps } from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { formLabel } from './typography';

type Props = RadioProps & {
  label?: string;
};

export const Radio = forwardRef<HTMLSelectElement, Props>(
  ({ label, ...props }, ref) => {
    return (
      <FormControlLabel
        sx={{
          width: '100%',
        }}
        control={
          <MUIRadio inputRef={ref} sx={{ marginRight: -0.5 }} {...props} />
        }
        label={label}
        componentsProps={{ typography: { sx: formLabel } }}
      />
    );
  },
);

export default Radio;
