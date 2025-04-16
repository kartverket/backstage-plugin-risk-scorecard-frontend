import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { forwardRef } from 'react';
import { formHelperText, formLabel } from './typography';
import { commonTextColor, formControlStyles } from '../../utils/style';

type Props = TextFieldProps & {
  sublabel?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, sublabel, error, helperText, required, ...props }, ref) => {
    return (
      <FormControl sx={formControlStyles} error={error} required={required}>
        {label && (
          <FormLabel required={required} sx={formLabel}>
            {label}
          </FormLabel>
        )}
        {sublabel && (
          <FormHelperText sx={formHelperText}>{sublabel}</FormHelperText>
        )}
        <TextField
          id="filled-multiline-static"
          error={error}
          multiline
          fullWidth
          variant="outlined"
          inputRef={ref}
          InputProps={{
            sx: theme => ({
              '&.Mui-disabled': {
                color: commonTextColor(theme, true),
              },
            }),
          }}
          {...props}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
