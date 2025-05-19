import { Button, ButtonProps } from '@mui/material';

type MosesButtonProps = {
  propsLeft?: ButtonProps;
  propsRight?: ButtonProps;
  propsCommon?: ButtonProps;
} & React.HTMLAttributes<HTMLDivElement>;

/** Base component for dual sided button component.
 * props provided serves as configuration for the left and right button.
 * propsCommon applies to both sides.
 * Specificity takes precedence.
 */
export function MosesButton({
  propsLeft,
  propsRight,
  className,
  propsCommon,
  ...props
}: MosesButtonProps) {
  return (
    <div
      {...props}
      style={{
        display: 'flex',
        textWrap: 'nowrap',
        gap: '2px',

        ...props.style,
      }}
    >
      <Button
        variant="contained"
        {...propsCommon}
        {...propsLeft}
        sx={{
          borderTopLeftRadius: '1000px',
          borderBottomLeftRadius: '1000px',
          ...propsLeft?.sx,
          textTransform: 'none',
        }}
      />
      <Button
        variant="contained"
        {...propsCommon}
        {...propsRight}
        sx={{
          borderTopRightRadius: '1000px',
          borderBottomRightRadius: '1000px',
          ...propsRight?.sx,
          textTransform: 'none',
        }}
      />
    </div>
  );
}
