import styles from './changeSet.module.css';
import { ReactNode } from 'react';

interface ChangeSetBoxSubTitleProps {
  propertyName: string;
  children: ReactNode[] | ReactNode;
  compact?: boolean;
}

export function ChangeSetPropertyBase({
  children,
  propertyName,
  compact = false,
}: ChangeSetBoxSubTitleProps) {
  if (compact) {
    return (
      <div>
        <span className={styles.propertyTitle}>{propertyName}: </span>
        <span>{children}</span>
      </div>
    );
  }

  return (
    <div className={styles.property}>
      <div className={styles.propertyTitle}>{propertyName}</div>
      <div>{children}</div>
    </div>
  );
}
