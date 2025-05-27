import { ReactNode } from 'react';
import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetTagsProps {
  children: ReactNode[] | ReactNode;
}

export function ChangeSetTags({ children }: ChangeSetTagsProps) {
  const styles = useChangeSetStyles();
  return <div className={styles.tags}>{children}</div>;
}
