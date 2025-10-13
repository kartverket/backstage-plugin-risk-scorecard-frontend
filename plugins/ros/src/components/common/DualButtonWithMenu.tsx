import React, { useCallback, useState } from 'react';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ButtonProps } from '@mui/material';
import { DualButton } from './DualButton';

type MenuItemDef = {
  key: string;
  label: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
};

type DualButtonWithMenuProps = {
  propsLeft?: ButtonProps;
  propsRight?: ButtonProps;
  propsCommon?: ButtonProps;
  menuItems?: MenuItemDef[];
  menuProps?: Partial<MenuProps>;
  openMenuOnLeftClick?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function DualButtonWithMenu({
  propsLeft,
  propsRight,
  propsCommon,
  menuItems,
  menuProps,
  openMenuOnLeftClick,
  ...props
}: DualButtonWithMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleLeftClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      propsLeft?.onClick?.(event as any);
      const shouldOpen =
        openMenuOnLeftClick !== undefined
          ? openMenuOnLeftClick
          : Boolean(menuItems && menuItems.length > 0);
      if (shouldOpen) setAnchorEl(event.currentTarget);
    },
    [propsLeft, openMenuOnLeftClick, menuItems],
  );

  const handleRightClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      propsRight?.onClick?.(event as any);
    },
    [propsRight],
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const wrappedLeft = {
    ...(propsLeft || {}),
    onClick: handleLeftClick,
  } as ButtonProps;
  const wrappedRight = {
    ...(propsRight || {}),
    onClick: handleRightClick,
  } as ButtonProps;

  return (
    <div {...props}>
      <DualButton
        propsLeft={wrappedLeft}
        propsRight={wrappedRight}
        propsCommon={propsCommon}
      />

      {menuItems && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          {...menuProps}
        >
          {menuItems.map(item => (
            <MenuItem
              key={item.key}
              selected={item.selected}
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                try {
                  item.onClick();
                } finally {
                  handleMenuClose();
                }
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  );
}

export default DualButtonWithMenu;
