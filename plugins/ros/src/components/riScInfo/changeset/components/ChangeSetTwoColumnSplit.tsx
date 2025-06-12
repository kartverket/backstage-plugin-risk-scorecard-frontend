import { ReactNode } from 'react';
import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetTwoColumnSplitProps {
  children: ReactNode | ReactNode[];
}

export function ChangeSetTwoColumnSplit({
  children,
}: ChangeSetTwoColumnSplitProps) {
  const styles = useChangeSetStyles();
  return <div className={styles.twoColumnSplit}>{children}</div>;
}
