import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetChangedValueProps {
  propertyName?: string;
  oldValue: string;
  newValue: string;
  denominator?: string;
}

export function ChangeSetChangedValue({
  propertyName,
  oldValue,
  newValue,
  denominator,
}: ChangeSetChangedValueProps) {
  const styles = useChangeSetStyles();
  return (
    <div>
      {propertyName && (
        <>
          <span className={styles.changedProperty}>{propertyName}:</span>{' '}
        </>
      )}
      <span className={styles.oldValue}>{oldValue}</span>{' '}
      <span className={styles.newValue}>{newValue}</span>
      {denominator && (
        <>
          {' '}
          <span>{denominator}</span>
        </>
      )}
    </div>
  );
}
