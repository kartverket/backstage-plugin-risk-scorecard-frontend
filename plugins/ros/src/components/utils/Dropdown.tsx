import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import React, { ChangeEvent } from 'react';
import { FormHelperText } from '@material-ui/core';
import { menuProps, useInputFieldStyles } from './style';

interface DropdownProps<T> {
  options: string[];
  selectedValues: T;
  handleChange: (value: T) => void;
  error?: string | null;
  required?: boolean;
  label?: string;
  variant?: 'standard' | 'outlined' | 'filled';
}

export const Dropdown = <T,>({
  label,
  options,
  selectedValues,
  handleChange,
  error,
  required,
  variant = 'outlined',
}: DropdownProps<T>) => {
  const { formLabel, formControl } = useInputFieldStyles();

  const multiple = Array.isArray(selectedValues);

  const onChange = (event: ChangeEvent<{ value: unknown }>) =>
    handleChange(event.target.value as T);

  const renderValue = (selected: any) =>
    multiple ? (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          marginBottom: 0,
          paddingBottom: 0,
        }}
      >
        {selected.map((value: string) => (
          <Chip key={value} label={value} />
        ))}
      </Box>
    ) : (
      selected
    );

  return (
    <FormControl className={formControl}>
      {label && (
        <FormLabel className={formLabel} required={required}>
          {label}
        </FormLabel>
      )}
      <Select
        multiple={multiple}
        value={selectedValues}
        onChange={onChange}
        variant={variant}
        MenuProps={menuProps}
        renderValue={renderValue}
        error={!!error}
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
      >
        {options.map(name => (
          <MenuItem key={name} value={name}>
            {multiple && (
              <ListItemIcon>
                <Checkbox checked={selectedValues.indexOf(name) > -1} />
              </ListItemIcon>
            )}
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  );
};
