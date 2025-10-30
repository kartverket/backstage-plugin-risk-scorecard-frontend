import React, { useCallback } from 'react';
import { ButtonProps } from '@backstage/ui';
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
  openMenuOnLeftClick?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function DualButtonWithMenu({
  propsLeft,
  propsRight,
  propsCommon,
  menuItems,
  openMenuOnLeftClick,
  ...props
}: DualButtonWithMenuProps) {
  const handleLeftClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      propsLeft?.onClick?.(event as any);
      const shouldOpen =
        openMenuOnLeftClick !== undefined
          ? openMenuOnLeftClick
          : Boolean(menuItems && menuItems.length > 0);
      if (!shouldOpen) return;
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

  const wrappedLeft = {
    ...(propsLeft || {}),
    onClick: handleLeftClick,
  } as ButtonProps;
  const wrappedRight = {
    ...(propsRight || {}),
    onClick: handleRightClick,
  } as ButtonProps;

  return (
    <DualButton
      menuItems={menuItems}
      propsLeft={wrappedLeft}
      propsRight={wrappedRight}
      propsCommon={propsCommon}
      {...props}
    />
  );
}
