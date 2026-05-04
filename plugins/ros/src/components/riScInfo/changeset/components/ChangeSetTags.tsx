import { ReactNode } from 'react';
import styles from './changeSet.module.css';

interface ChangeSetTagsProps {
  children: ReactNode[] | ReactNode;
}

export function ChangeSetTags({ children }: ChangeSetTagsProps) {
  return <div className={styles.tags}>{children}</div>;
}
