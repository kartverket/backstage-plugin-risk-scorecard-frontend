import { ReactNode } from 'react';
import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetBoxProps {
  type: 'primary' | 'secondary';
  children: ReactNode[] | ReactNode;
}

export function ChangeSetBox({ children, type }: ChangeSetBoxProps) {
  const styles = useChangeSetStyles();

  return (
    <div
      className={`${styles.box} ${type === 'primary' ? styles.boxPrimary : styles.boxSecondary}`}
    >
      {children}
    </div>
  );
}
