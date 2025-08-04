import { ReactNode } from 'react';
import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetColumnProps {
  children: ReactNode | ReactNode[];
  column?: '*' | '1' | '2';
}

export function ChangeSetColumn({
  children,
  column = '*',
}: ChangeSetColumnProps) {
  const styles = useChangeSetStyles();
  let columnClass = '';
  if (column === '1') {
    columnClass = styles.firstColumn;
  } else if (column === '2') {
    columnClass = styles.secondColumn;
  }
  return <div className={columnClass}>{children}</div>;
}
