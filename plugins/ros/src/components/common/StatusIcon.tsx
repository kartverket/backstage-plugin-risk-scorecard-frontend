import styles from './UpdatedStatusBadge.module.css';
import CircularProgress from '@mui/material/CircularProgress';
import { Tooltip } from '@material-ui/core';

export enum StatusIconTypes {
  Green,
  Yellow,
  Red,
  Loading,
  Error,
}
type StatusIconProps = {
  type: StatusIconTypes;
  tooltipText?: string;
  ariaLabel?: string;
  size: 'small' | 'medium' | 'large';
};
export function StatusIcon(props: StatusIconProps) {
  const sizeToPx = {
    small: '8px',
    medium: '16px', //
    xl: '32px',
  };
  let iconElement;
  switch (props.type) {
    case StatusIconTypes.Green:
      iconElement = (
        <i
          className={`ri-checkbox-circle-fill ${styles.updatedIcon} ${styles.iconBase}`}
          aria-label={props.ariaLabel}
        />
      );
      break;
    case StatusIconTypes.Yellow:
      iconElement = (
        <i
          className={`ri-error-warning-fill ${styles.outdatedIcon} ${styles.iconBase}`}
          aria-label={props.ariaLabel}
        />
      );
      break;
    case StatusIconTypes.Red:
      iconElement = (
        <i
          className={`ri-error-warning-fill ${styles.veryOutdatedIcon} ${styles.iconBase}`}
          aria-label={props.ariaLabel}
        />
      );
      break;
    case StatusIconTypes.Loading:
      iconElement = <CircularProgress size="32px" />;
      break;

    case StatusIconTypes.Error:
      iconElement = (
        <i
          className={`ri-error-warning-fill ${styles.emptyIcon} ${styles.iconBase}`}
        />
      );
  }
  if (props.tooltipText) return <Tooltip title={''}>{iconElement}</Tooltip>;
  return iconElement;
}
