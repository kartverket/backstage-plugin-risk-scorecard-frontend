import {
  FormControl,
  FormHelperText,
  FormLabel,
  TextField,
  TextFieldProps,
} from '@material-ui/core';
import React, { forwardRef } from 'react';
import { useFontStyles, useInputFieldStyles } from '../../utils/style';

type Props = TextFieldProps & {
  sublabel?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, sublabel, error, helperText, required, ...props }, ref) => {
    const { formLabel, formControl, root } = useInputFieldStyles();
    const { labelSubtitle } = useFontStyles();

    return (
      <FormControl className={formControl}>
        {label && (
          <FormLabel className={formLabel} required={required}>
            {label}
          </FormLabel>
        )}
        {sublabel && (
          <FormHelperText className={labelSubtitle}>{sublabel}</FormHelperText>
        )}
        <TextField
          id="filled-multiline-static"
          multiline
          fullWidth
          variant="outlined"
          inputRef={ref}
          InputProps={{ className: root }}
          {...props}
        />
        {error && <FormHelperText error>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
