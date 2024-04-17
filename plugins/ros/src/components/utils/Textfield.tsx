import {
  FormControl,
  FormHelperText,
  FormLabel,
  TextField as MUITextField,
} from '@material-ui/core';
import React, { ChangeEvent } from 'react';
import { useFontStyles, useInputFieldStyles } from '../scenarioDrawer/style';

interface TextFieldProps {
  label?: string;
  subtitle?: string;
  value: string | number;
  error?: string | null;
  required?: boolean;
  minRows?: number;
  handleChange?: (value: string) => void;
}

export const TextField = ({
  label,
  subtitle,
  value,
  error,
  required,
  minRows = 1,
  handleChange,
}: TextFieldProps) => {
  const { formLabel, formControl, root } = useInputFieldStyles();
  const { labelSubtitle } = useFontStyles();

  const onChange = (event: ChangeEvent<{ value: string }>) =>
    handleChange && handleChange(event.target.value);

  return (
    <FormControl className={formControl}>
      {label && (
        <FormLabel className={formLabel} required={required}>
          {label}
        </FormLabel>
      )}
      {subtitle && (
        <FormHelperText className={labelSubtitle}>{subtitle}</FormHelperText>
      )}
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
        InputProps={{ className: root }}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  );
};
