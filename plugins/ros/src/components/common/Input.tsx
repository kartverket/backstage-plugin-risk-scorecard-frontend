import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { forwardRef } from 'react';
import { commonTextColor } from '../../utils/style';
import formStyles from './formStyles.module.css';

type Props = TextFieldProps & {
  sublabel?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, sublabel, error, helperText, required, ...props }, ref) => {
    return (
      <FormControl className={formStyles.formControl} error={error} required={required}>
        {label && (
          <FormLabel required={required} className={formStyles.formLabel}>
            {label}
          </FormLabel>
        )}
        {sublabel && (
          <FormHelperText className={formStyles.formHelperText}>{sublabel}</FormHelperText>
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
