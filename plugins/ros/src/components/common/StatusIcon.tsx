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
    small: '16px',
    medium: '24px',
    large: '32px',
  };
  const fontSize = sizeToPx[props.size];
  let iconElement;
  switch (props.type) {
    case StatusIconTypes.Green:
      iconElement = (
        <i
          className={`ri-checkbox-circle-fill ${styles.updatedIcon} ${styles.iconBase}`}
          aria-label={props.ariaLabel}
          style={{ fontSize }}
        />
      );
      break;
    case StatusIconTypes.Yellow:
      iconElement = (
        <i
          className={`ri-error-warning-fill ${styles.outdatedIcon} ${styles.iconBase}`}
          aria-label={props.ariaLabel}
          style={{ fontSize }}
        />
      );
      break;
    case StatusIconTypes.Red:
      iconElement = (
        <i
          className={`ri-error-warning-fill ${styles.veryOutdatedIcon} ${styles.iconBase}`}
          aria-label={props.ariaLabel}
          style={{ fontSize }}
        />
      );
      break;
    case StatusIconTypes.Loading:
      iconElement = <CircularProgress size={fontSize} />;
      break;

    case StatusIconTypes.Error:
      iconElement = (
        <i
          className={`ri-error-warning-fill ${styles.emptyIcon} ${styles.iconBase}`}
          style={{ fontSize }}
        />
      );
  }
  if (props.tooltipText)
    return <Tooltip title={props.tooltipText}>{iconElement}</Tooltip>;
  return iconElement;
}
