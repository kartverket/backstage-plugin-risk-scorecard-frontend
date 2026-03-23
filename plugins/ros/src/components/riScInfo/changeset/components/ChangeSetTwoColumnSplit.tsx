import { ReactNode } from 'react';
import styles from './changeSetStyles.module.css';

interface ChangeSetTwoColumnSplitProps {
  children: ReactNode | ReactNode[];
}

export function ChangeSetTwoColumnSplit({
  children,
}: ChangeSetTwoColumnSplitProps) {
  return <div className={styles.twoColumnSplit}>{children}</div>;
}
