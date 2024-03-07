import {
  FormControl,
  FormLabel,
  TextField as MUITextField,
} from '@material-ui/core';
import React, { ChangeEvent } from 'react';
import { useInputFieldStyles } from './style';

interface TextFieldProps {
  label?: string;
  value: string | number;
  handleChange?: (value: string) => void;
  minRows?: number;
  disabled?: boolean;
}

export const TextField = ({
  label,
  value,
  minRows = 1,
  handleChange,
}: TextFieldProps) => {
  const { formLabel, formControl } = useInputFieldStyles();

  const onChange = (event: ChangeEvent<{ value: string }>) =>
    handleChange && handleChange(event.target.value);

  return (
    <FormControl className={formControl}>
      <FormLabel className={formLabel}>{label}</FormLabel>
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
      />
    </FormControl>
  );
};
