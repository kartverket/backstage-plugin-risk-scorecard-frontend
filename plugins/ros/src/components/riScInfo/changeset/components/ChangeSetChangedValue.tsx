import { useChangeSetStyles } from './changeSetStyles.ts';
import { ReactNode } from 'react';

interface ChangeSetChangedValueProps {
  oldValue: string | ReactNode;
  newValue: string | ReactNode;
  unit?: string;
  multiline?: boolean;
}

export function ChangeSetChangedValue({
  oldValue,
  newValue,
  unit = undefined,
  multiline = false,
}: ChangeSetChangedValueProps) {
  const styles = useChangeSetStyles();
  return (
    <>
      <span className={styles.oldValue}>{oldValue}</span>
      {multiline ? <br /> : ' '}
      <span className={styles.newValue}>{newValue}</span>
      {multiline ? <br /> : ' '}
      <span className={styles.text}>{unit ? unit : ''}</span>
    </>
  );
}
