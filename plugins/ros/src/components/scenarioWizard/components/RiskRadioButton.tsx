import { forwardRef } from 'react';
import MUIRadio, { RadioProps } from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { formLabel } from '../../common/typography';

type Props = RadioProps & {
  label?: string;
};

export const RiskRadioButton = forwardRef<HTMLSelectElement, Props>(
  ({ label, ...props }, ref) => (
    <FormControlLabel
      sx={{
        width: '100%',
        whiteSpace: 'nowrap',
      }}
      control={
        <MUIRadio inputRef={ref} sx={{ marginRight: -0.5 }} {...props} />
      }
      label={label}
      componentsProps={{ typography: { sx: formLabel } }}
    />
  ),
);
