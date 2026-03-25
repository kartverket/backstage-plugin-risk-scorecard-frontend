import styles from './changeSet.module.css';

interface ChangeSetAddedValueProps {
  newValue: string;
}

export function ChangeSetAddedValue({ newValue }: ChangeSetAddedValueProps) {
  return <span className={styles.addedValue}>{newValue}</span>;
}
