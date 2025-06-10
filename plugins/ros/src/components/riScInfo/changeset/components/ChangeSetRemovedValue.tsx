import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetRemovedValueProps {
  oldValue: string;
}

export function ChangeSetRemovedValue({
  oldValue,
}: ChangeSetRemovedValueProps) {
  const styles = useChangeSetStyles();
  return <span className={styles.removedValue}>{oldValue}</span>;
}
