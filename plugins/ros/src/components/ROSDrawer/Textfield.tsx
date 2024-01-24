import { FormControl, FormLabel, TextField } from "@material-ui/core";
import React, { ChangeEvent } from "react";
import { useInputFieldStyles } from "./DrawerStyle";

interface TextFieldProps {
  label: string;
  value: string;
  handleChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

export const Textfield = (
  {
    label,
    value,
    handleChange
  }: TextFieldProps) => {

  const { formLabel, inputBox } = useInputFieldStyles();

  return (
    <FormControl className={inputBox}>
      <FormLabel className={formLabel}>{label}</FormLabel>
      <TextField
        required
        id="filled-multiline-static"
        value={value}
        multiline
        fullWidth
        minRows={4}
        maxRows={4}
        variant="filled"
        onChange={handleChange}
      />
    </FormControl>
  );
};