import {
  FormControl,
  FormLabel,
  TextField as MUITextField,
} from '@material-ui/core';
import React, { ChangeEvent } from 'react';
import { useInputFieldStyles } from './ScenarioDrawerStyle';

interface TextFieldProps {
  label: string;
  value: string;
  minRows: number;
  handleChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

export const TextField = ({
  label,
  value,
  minRows,
  handleChange,
}: TextFieldProps) => {
  const { formLabel, inputBox } = useInputFieldStyles();

  return (
    <FormControl className={inputBox}>
      <FormLabel className={formLabel}>{label}</FormLabel>
      <MUITextField
        required
        id="filled-multiline-static"
        value={value}
        multiline
        fullWidth
        minRows={minRows}
        variant="outlined"
        onChange={handleChange}
      />
    </FormControl>
  );
};
