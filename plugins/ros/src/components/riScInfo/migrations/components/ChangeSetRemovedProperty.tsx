import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetRemovedPropertyProps {
  propertyName: string;
  value: string;
}

export function ChangeSetRemovedProperty({
  propertyName,
  value,
}: ChangeSetRemovedPropertyProps) {
  const {
    removedPropertyContainer,
    removedProperty: removedPropertyStyle,
    removedValue: removedValueStyle,
  } = useChangeSetStyles();
  return (
    <div className={removedPropertyContainer} >
      <div className={removedPropertyStyle}>{propertyName}</div>
      <div className={removedValueStyle}>{value}</div>
    </div>
  );
}
