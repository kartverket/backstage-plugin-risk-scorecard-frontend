import { Box, Button, ButtonProps } from '@backstage/ui';
import styles from './DualButton.module.css';

type DualButtonProps = {
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
  propsLeft,
  propsRight,
  className,
  propsCommon,
  ...props
}: DualButtonProps) {
  return (
    <Box {...props} className={`${styles.DualButton} ${className || ''}`}>
      <Button
        size="small"
        {...propsCommon}
        {...propsLeft}
        className={`${styles.DualButtonLeft} ${propsCommon?.className || ''} ${propsLeft?.className || ''}`}
      />
      <Button
        size="small"
        {...propsCommon}
        {...propsRight}
        className={`${styles.DualButtonRight} ${propsCommon?.className || ''} ${propsRight?.className || ''}`}
      />
    </Box>
  );
}
