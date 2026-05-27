import { ReactNode } from 'react';
import styles from './changeSet.module.css';

interface ChangeSetBoxProps {
  type: 'primary' | 'secondary';
  children: ReactNode[] | ReactNode;
}

export function ChangeSetBox({ children, type }: ChangeSetBoxProps) {
  return (
    <div
      className={`${styles.box} ${type === 'primary' ? styles.boxPrimary : styles.boxSecondary}`}
    >
      {children}
    </div>
  );
}
