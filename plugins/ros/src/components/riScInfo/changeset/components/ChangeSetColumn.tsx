import { ReactNode } from 'react';
import styles from './changeSet.module.css';

interface ChangeSetColumnProps {
  children: ReactNode | ReactNode[];
  column?: '*' | '1' | '2';
}

export function ChangeSetColumn({
  children,
  column = '*',
}: ChangeSetColumnProps) {
  let columnClass = '';
  if (column === '1') {
    columnClass = styles.firstColumn;
  } else if (column === '2') {
    columnClass = styles.secondColumn;
  }
  return <div className={columnClass}>{children}</div>;
}
