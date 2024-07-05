import {
  FormControl,
  FormHelperText,
  FormLabel,
  TextField as MUITextField,
} from '@material-ui/core';
import React, { ChangeEvent, useState } from 'react';
import { useScenario } from '../../ScenarioContext';
import { useFontStyles, useInputFieldStyles } from '../../utils/style';

type ErrorProps = {
  errorKey?: string;
  errorMessage?: string;
};

type TextFieldProps = {
  label?: string;
  subtitle?: string;
  value: string | number;
  error?: string | boolean | null;
  minRows?: number;
  handleChange?: (value: string) => void;
} & (
  | ({
      validateInput: (value: string) => boolean;
      required?: boolean;
    } & ErrorProps)
  | ({
      required?: undefined;
      validateInput?: undefined;
    } & ErrorProps)
  | ({
      required: boolean;
      validateInput?: (value: string) => boolean;
    } & ErrorProps)
);

export const TextField = ({
  label,
  subtitle,
  value,
  required,
  minRows = 1,
  handleChange,
  validateInput,
  errorMessage,
  errorKey,
}: TextFieldProps) => {
  const [hasError, setHasError] = useState(false);
  const { setFormError, removeFormError, formFieldHasErrors } = useScenario();
  const { formLabel, formControl, root } = useInputFieldStyles();
  const { labelSubtitle } = useFontStyles();

  const onChange = (event: ChangeEvent<{ value: string }>) => {
    if (handleChange) {
      handleChange(event.target.value);
    }
  };

  const onBlur = (event: ChangeEvent<{ value: string }>) => {
    if (!validateInput && !required) {
      return;
    }

    const isValid = validateInput ? validateInput(event.target.value) : true;
    const requiredValid = required ? event.target.value.length > 0 : true;

    const validationResult = isValid && requiredValid;
    setHasError(!validationResult);

    if (!errorKey) {
      return;
    }

    if (validationResult) {
      removeFormError(errorKey);
    } else {
      setFormError(errorKey);
    }
  };

  const fieldError =
    hasError || (errorKey ? formFieldHasErrors(errorKey) : false);

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
        error={fieldError}
        onBlur={onBlur}
        InputProps={{ className: root }}
      />
      {fieldError && <FormHelperText error>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};
