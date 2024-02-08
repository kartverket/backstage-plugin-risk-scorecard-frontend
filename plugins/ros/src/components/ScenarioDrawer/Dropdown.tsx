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
import { menuProps, useInputFieldStyles } from './ScenarioDrawerStyle';

interface DropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  handleChange: (event: ChangeEvent<{ value: unknown }>) => void;
  variant?: 'standard' | 'outlined' | 'filled';
  multiple?: boolean;
}

export const Dropdown = ({
  label,
  options,
  selectedValues,
  handleChange,
  variant = 'outlined',
  multiple = false,
}: DropdownProps) => {
  const { formLabel, inputBox } = useInputFieldStyles();

  const renderValue = (selected: any) => {
    if (multiple) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gridGap: 0.5 }}>
          {selected.map((value: string) => (
            <Chip key={value} label={value} />
          ))}
        </Box>
      );
    }
    return selected;
  };

  return (
    <FormControl className={inputBox}>
      <FormLabel className={formLabel}>{label}</FormLabel>
      <Select
        multiple={multiple}
        value={selectedValues}
        onChange={handleChange}
        variant={variant}
        MenuProps={menuProps}
        renderValue={renderValue}
      >
        {options.map(name => (
          <MenuItem key={name} value={name}>
            {multiple ? (
              <ListItemIcon>
                <Checkbox checked={selectedValues.indexOf(name) > -1} />
              </ListItemIcon>
            ) : null}
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
