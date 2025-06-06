import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetRemovedPropertyProps {
  propertyName: string;
  value: string;
}

export function ChangeSetRemovedProperty({
  propertyName,
  value,
}: ChangeSetRemovedPropertyProps) {
  const styles = useChangeSetStyles();
  return (
    <div className={styles.removedPropertyContainer}>
      <div className={styles.removedProperty}>{propertyName}</div>
      <div className={styles.removedValue}>{value}</div>
    </div>
  );
}
