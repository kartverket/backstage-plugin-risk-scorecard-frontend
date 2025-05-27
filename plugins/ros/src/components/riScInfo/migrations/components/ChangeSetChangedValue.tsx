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
  const {
    changedProperty: changedPropertyStyle,
    oldValue: oldValueStyle,
    newValue: newValueStyle,
  } = useChangeSetStyles();
  return (
    <div>
      {propertyName && (
        <>
          <span className={changedPropertyStyle}>{propertyName}:</span>{' '}
        </>
      )}
      <span className={oldValueStyle}>{oldValue}</span>{' '}
      <span className={newValueStyle}>{newValue}</span>
      {denominator && (
        <>
          {' '}
          <span>{denominator}</span>
        </>
      )}
    </div>
  );
}
