import { forwardRef } from 'react';
import MUIRadio, { RadioProps } from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import formStyles from '../../common/formStyles.module.css';
import styles from './RiskRadioButton.module.css';

type Props = RadioProps & {
  label?: string;
};

export const RiskRadioButton = forwardRef<HTMLSelectElement, Props>(
  ({ label, ...props }, ref) => (
    <FormControlLabel
      className={styles.container}
      control={
        <MUIRadio inputRef={ref} className={styles.radio} {...props} />
      }
      label={label}
      componentsProps={{ typography: { className: formStyles.formLabel } }}
    />
  ),
);
