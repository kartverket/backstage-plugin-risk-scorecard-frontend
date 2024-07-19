import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import React, { forwardRef } from 'react';
import { formLabel, labelSubtitle } from './typography';

type Props = TextFieldProps & {
  sublabel?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, sublabel, error, helperText, required, ...props }, ref) => {
    return (
      <FormControl sx={{ width: '100%' }}>
        {label && (
          <FormLabel sx={formLabel} required={required}>
            {label}
          </FormLabel>
        )}
        {sublabel && (
          <FormHelperText sx={labelSubtitle}>{sublabel}</FormHelperText>
        )}
        <TextField
          id="filled-multiline-static"
          multiline
          fullWidth
          variant="outlined"
          inputRef={ref}
          InputProps={{
            sx: theme => ({
              '&.Mui-disabled': {
                color: theme.palette.mode === 'dark' ? '#FFFFFF80' : '#757575',
              },
            }),
          }}
          {...props}
        />
        {error && <FormHelperText error>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
