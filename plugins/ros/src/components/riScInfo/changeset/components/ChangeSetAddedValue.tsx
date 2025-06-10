import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetAddedValueProps {
  newValue: string;
}

export function ChangeSetAddedValue({
  newValue,
}: ChangeSetAddedValueProps) {
  const styles = useChangeSetStyles();
  return <span className={styles.addedValue}>{newValue}</span>;
}
