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
          backgroundColor: '#D9D9D9',
          color: '#000000',
        }}
        label={selectedValue}
        onClick={e => setAnchorEl(e.currentTarget)}
        icon={<KeyboardArrowDownIcon style={{ color: '#000000' }} />}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
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
