import { ChangeSetAddedValue } from './ChangeSetAddedValue.tsx';
import { ChangeSetPropertyBase } from './ChangeSetPropertyBase.tsx';

interface ChangeSetAddedPropertyProps {
  propertyName: string;
  newValue: string;
  compact?: boolean;
}

export function ChangeSetAddedProperty({
  propertyName,
  newValue,
  compact = false,
}: ChangeSetAddedPropertyProps) {
  return (
    <ChangeSetPropertyBase propertyName={propertyName} compact={compact}>
      <ChangeSetAddedValue newValue={newValue} />
    </ChangeSetPropertyBase>
  );
}
