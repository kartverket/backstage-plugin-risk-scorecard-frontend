import React from 'react';
import Alert, { AlertProps } from '@mui/material/Alert';
import styles from '../alertBar.module.css';

type Severity = 'success' | 'warning' | 'error' | 'info';

type Props = {
  severity: Severity;
  children: React.ReactNode;
  className?: string; // applied to wrapper
  alertProps?: Partial<AlertProps>;
};

export function AlertBar({ severity, children, className, alertProps }: Props) {
  const severityClass = (styles as any)[severity] || '';

  return (
    <div className={className}>
      <Alert
        severity={severity as any}
        className={`${styles.alertBar} ${severityClass}`}
        {...(alertProps as any)}
      >
        {children}
      </Alert>
    </div>
  );
}

export default AlertBar;
