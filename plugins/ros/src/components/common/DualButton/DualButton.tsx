import {
  Box,
  Button,
  ButtonProps,
  MenuTrigger,
  Menu,
  MenuItem,
} from '@backstage/ui';
import styles from './DualButton.module.css';

type MenuItemDef = {
  key: string;
  label: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
};

export type DualButtonProps = {
  menuItems?: MenuItemDef[];
  propsLeft?: ButtonProps;
  propsRight?: ButtonProps;
  propsCommon?: ButtonProps;
} & React.HTMLAttributes<HTMLDivElement>;

/** Base component for dual sided button component.
 * props provided serves as configuration for the left and right button.
 * propsCommon applies to both sides.
 * Specificity takes precedence.
 */
export function DualButton({
  menuItems,
  propsLeft,
  propsRight,
  className,
  propsCommon,
  ...props
}: DualButtonProps) {
  const leftButton = (
    <Button
      size="small"
      {...propsCommon}
      {...propsLeft}
      className={`${styles.DualButtonLeft} ${propsCommon?.className || ''} ${propsLeft?.className || ''}`}
    />
  );

  const ConditionalMenuWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const hasMenu = menuItems && menuItems.length > 0;

    if (!hasMenu) {
      return <>{children}</>;
    }

    return (
      <MenuTrigger>
        {children}
        <Menu>
          {menuItems.map(item => (
            <MenuItem
              key={item.key}
              style={
                item.selected ? { backgroundColor: 'var(--bui-gray-3)' } : {}
              }
              onAction={() => item.onClick()}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </MenuTrigger>
    );
  };

  return (
    <Box {...props} className={`${styles.DualButton} ${className || ''}`}>
      <ConditionalMenuWrapper>{leftButton}</ConditionalMenuWrapper>
      <Button
        size="small"
        {...propsCommon}
        {...propsRight}
        className={`${styles.DualButtonRight} ${propsCommon?.className || ''} ${propsRight?.className || ''}`}
      />
    </Box>
  );
}
