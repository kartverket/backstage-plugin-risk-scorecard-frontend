import React from 'react';
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  useController,
} from 'react-hook-form';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MUISelect, { SelectProps } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import { formLabel, labelSubtitle } from './typography';

type Props<T extends FieldValues> = SelectProps & {
  sublabel?: string;
  helperText?: string;
  control?: Control<T, any>;
  name: Path<T>;
  labelTranslationKey?: string;
  options: { value: string | number; renderedValue: string | number }[];
};

export const Select = <T extends FieldValues>({
  label,
  sublabel,
  error,
  helperText,
  required,
  control,
  name,
  multiple,
  labelTranslationKey,
  options,
  ...props
}: Props<T>) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { field } = useController({
    name,
    control,
    rules: { required },
  });

  // values er strengt tatt unknown, men da må vi bruke mye ts-ignore for å komme i mål
  const renderValue = (values: any) =>
    multiple ? (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          marginBottom: 0,
          paddingBottom: 0,
        }}
      >
        {values.map((value: string) => (
          <Chip
            key={value}
            label={
              /* @ts-ignore Because ts can't typecheck strings against our keys */
              labelTranslationKey ? t(`${labelTranslationKey}.${value}`) : value
            }
          />
        ))}
      </Box>
    ) : (
      options.find(option => option.value === values)?.renderedValue
    );

  const handleChecked = (
    fieldValue: PathValue<T, (string | undefined) & Path<T>>,
    optionValue: Props<T>['options'][0]['value'],
  ) => {
    if (Array.isArray(fieldValue)) return fieldValue.includes(optionValue);
    return fieldValue === optionValue;
  };

  return (
    <FormControl sx={{ width: '100%' }}>
      {label && (
        <FormLabel sx={formLabel} required={required}>
          {label}
        </FormLabel>
      )}
      {sublabel && (
        <FormHelperText sx={labelSubtitle}>{sublabel}</FormHelperText>
      )}

      <MUISelect
        MenuProps={{
          disablePortal: true,
        }}
        variant="outlined"
        renderValue={renderValue}
        multiple={multiple}
        SelectDisplayProps={
          multiple
            ? {
                style: {
                  paddingBottom: 8,
                  paddingTop: 16,
                  minHeight: 40,
                },
              }
            : {}
        }
        inputRef={field.ref}
        {...field}
        {...props}
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {multiple && (
              <Checkbox checked={handleChecked(field.value, option.value)} />
            )}
            <ListItemText primary={option.renderedValue} />
          </MenuItem>
        ))}
      </MUISelect>
      {error && <FormHelperText error>{helperText}</FormHelperText>}
    </FormControl>
  );
};
