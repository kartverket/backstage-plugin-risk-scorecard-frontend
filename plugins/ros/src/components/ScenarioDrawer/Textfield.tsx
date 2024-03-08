import {
  FormControl,
  FormHelperText,
  FormLabel,
  TextField as MUITextField,
} from '@material-ui/core';
import React, { ChangeEvent } from 'react';
import { useInputFieldStyles } from './style';

interface TextFieldProps {
  label?: string;
  value: string | number;
  error?: string | null;
  required?: boolean;
  minRows?: number;
  handleChange?: (value: string) => void;
}

export const TextField = ({
  label,
  value,
  error,
  required,
  minRows = 1,
  handleChange,
}: TextFieldProps) => {
  const { formLabel, formControl } = useInputFieldStyles();

  const onChange = (event: ChangeEvent<{ value: string }>) =>
    handleChange && handleChange(event.target.value);

  return (
    <FormControl className={formControl}>
      <FormLabel className={formLabel} required={required}>
        {label}
      </FormLabel>
      <MUITextField
        disabled={!handleChange}
        required
        id="filled-multiline-static"
        value={value}
        multiline
        fullWidth
        minRows={minRows}
        variant="outlined"
        onChange={onChange}
        error={!!error}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  );
};
