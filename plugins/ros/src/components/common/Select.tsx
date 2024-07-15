import {
  FormControl,
  FormHelperText,
  FormLabel,
  Select as MUISelect,
  SelectProps,
} from '@material-ui/core';
import React from 'react';
import { useFontStyles, useInputFieldStyles } from '../../utils/style';
import { Control, useController } from 'react-hook-form';

type Props = SelectProps & {
  sublabel?: string;
  helperText?: string;
  control?: Control<any, any>;
  name: string;
};

export const Select = ({
  label,
  sublabel,
  error,
  helperText,
  required,
  children,
  control,
  name,
  ...props
}: Props) => {
  const { formLabel, formControl } = useInputFieldStyles();
  const { labelSubtitle } = useFontStyles();

  const { field } = useController({
    name,
    control,
    rules: { required: true },
  });

  console.log('field', field);

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

      <MUISelect variant="outlined" {...field} inputRef={field.ref} {...props}>
        {children}
      </MUISelect>
      {error && <FormHelperText error>{helperText}</FormHelperText>}
    </FormControl>
  );
};
