import Box from "@material-ui/core/Box";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Select from "@material-ui/core/Select";
import React, { ChangeEvent } from "react";
import { useInputStyles } from "./ROSDrawerContent";
import { MenuProps } from "@material-ui/core/Menu";

export const Dropdown = ({ label, options, selected, handleChange }: {
  label: string
  options: number[]
  selected: number
  handleChange: (event: ChangeEvent<{ value: unknown }>) => void
}) => {

  const { formLabel, inputBox } = useInputStyles();

  return (
    <FormControl
      className={inputBox}
    >
      <FormLabel
        className={formLabel}
      >{label}</FormLabel>
      <Select
        value={selected}
        onChange={handleChange}
        input={<OutlinedInput />}
        MenuProps={MenuProps}
      >
        {options.map((name) => (
          <MenuItem key={name} value={name}>
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>);
};

export const MultiDropdown = ({ label, options, selected, handleChange }: {
  label: string
  options: string[]
  selected: string[]
  handleChange: (event: ChangeEvent<{ value: unknown }>) => void
}) => {

  const { formLabel, inputBox } = useInputStyles();

  return (
    <FormControl
      className={inputBox}
    >
      <FormLabel
        className={formLabel}
      >
        {label}
      </FormLabel>
      <Select
        multiple
        value={selected}
        onChange={handleChange}
        input={<OutlinedInput />}
        MenuProps={MenuProps}
        renderValue={(selected: any) => (
          <Box style={{ display: "flex", flexWrap: "wrap", gridGap: 0.5 }}>
            {selected.map((value: string) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
      >
        {options.map((name) => (
          <MenuItem key={name} value={name}>
            <ListItemIcon>
              <Checkbox checked={selected.indexOf(name) > -1} />
            </ListItemIcon>
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>);
};


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps: Partial<MenuProps> = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  },
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "center"
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "center"
  },
  variant: "menu"
};
