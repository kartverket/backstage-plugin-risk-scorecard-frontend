import Chip from '@material-ui/core/Chip';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import React, { useState } from 'react';

interface ChipDropdownProps {
  selectedValue: string;
  handleChange: (value: string) => void;
  options: string[];
}

export const ChipDropdown = ({
  options,
  selectedValue,
  handleChange,
}: ChipDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLDivElement | null>(null);
  const handleClick = (item: string) => {
    setAnchorEl(null);
    handleChange(item);
  };

  return (
    <>
      <Chip
        style={{
          margin: 0,
          padding: 0,
          backgroundColor:
            selectedValue === 'Completed' ? '#6BC6A4' : '#D9D9D9',
          color: '#000000',
        }}
        label={selectedValue}
        onClick={e => {
          setAnchorEl(e.currentTarget);
          setMenuAnchorEl(e.currentTarget);
        }}
        icon={<KeyboardArrowDownIcon style={{ color: '#000000' }} />}
      />
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {options.map(item => (
          <MenuItem key={item} onClick={() => handleClick(item)}>
            {item}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
