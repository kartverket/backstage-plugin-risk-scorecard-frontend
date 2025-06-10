import { ChangeSetChangedValue } from './ChangeSetChangedValue.tsx';
import { ChangeSetPropertyBase } from './ChangeSetPropertyBase.tsx';

interface ChangeSetChangedPropertyProps {
  propertyName: string;
  oldValue: string;
  newValue: string;
  unit?: string;
  compact?: boolean;
  multiline?: boolean;
}

export function ChangeSetChangedProperty({
  propertyName,
  oldValue,
  newValue,
  unit = undefined,
  compact = false,
  multiline = false,
}: ChangeSetChangedPropertyProps) {
  return (
    <ChangeSetPropertyBase propertyName={propertyName} compact={compact}>
      <ChangeSetChangedValue
        oldValue={oldValue}
        newValue={newValue}
        unit={unit}
        multiline={multiline}
      />
    </ChangeSetPropertyBase>
  );
}
