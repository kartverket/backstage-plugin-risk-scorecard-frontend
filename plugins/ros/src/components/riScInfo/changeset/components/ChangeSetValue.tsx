import { ReactNode } from 'react';
import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetValueProps {
  value: string | ReactNode;
  unit?: string;
  emphasised: boolean;
}

export function ChangeSetValue({ value, unit, emphasised }: ChangeSetValueProps) {
  const styles = useChangeSetStyles();
  return (
    <span className={emphasised ? styles.text : ""}>
      {value} {unit ? unit : ''}
    </span>
  );
}
