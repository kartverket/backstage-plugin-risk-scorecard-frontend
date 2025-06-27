import { useChangeSetStyles } from './changeSetStyles.ts';
import { ChangeSetRemovedValue } from './ChangeSetRemovedValue.tsx';

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
      <div>
        <ChangeSetRemovedValue oldValue={value} />
      </div>
    </div>
  );
}
