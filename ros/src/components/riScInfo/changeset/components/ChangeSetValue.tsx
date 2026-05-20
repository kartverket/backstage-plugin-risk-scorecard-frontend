import { ReactNode } from 'react';
import styles from './changeSet.module.css';

interface ChangeSetValueProps {
  value: string | ReactNode;
  unit?: string;
  emphasised: boolean;
}

export function ChangeSetValue({
  value,
  unit,
  emphasised,
}: ChangeSetValueProps) {
  return (
    <span className={emphasised ? styles.text : ''}>
      {value} {unit ? unit : ''}
    </span>
  );
}
