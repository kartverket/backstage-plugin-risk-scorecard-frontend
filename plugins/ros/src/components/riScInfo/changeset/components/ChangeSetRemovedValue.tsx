import styles from './changeSet.module.css';

interface ChangeSetRemovedValueProps {
  oldValue: string;
}

export function ChangeSetRemovedValue({
  oldValue,
}: ChangeSetRemovedValueProps) {
  return <span className={styles.removedValue}>{oldValue}</span>;
}
