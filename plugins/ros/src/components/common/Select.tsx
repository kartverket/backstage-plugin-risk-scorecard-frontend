import React from 'react';
import { Control, useController } from 'react-hook-form';
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

type Props = SelectProps & {
  sublabel?: string;
  helperText?: string;
  control?: Control<any, any>;
  name: string;
  labelTranslationKey?: string;
  options: { value: string; renderedValue: string }[];
};

export const Select = ({
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
}: Props) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { field } = useController({
    name,
    control,
    rules: { required: true },
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
              /* @ts-ignore Because ts can't typecheck strings agains our keys */
              labelTranslationKey ? t(`${labelTranslationKey}.${value}`) : value
            }
          />
        ))}
      </Box>
    ) : (
      values
    );

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
          disableEnforceFocus: true,
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
            <Checkbox checked={field.value.includes(option.value)} />
            <ListItemText primary={option.renderedValue} />
          </MenuItem>
        ))}
      </MUISelect>
      {error && <FormHelperText error>{helperText}</FormHelperText>}
    </FormControl>
  );
};
