import { ReactNode } from 'react';
import { ChangeSetPropertyBase } from './ChangeSetPropertyBase.tsx';
import { ChangeSetValue } from './ChangeSetValue.tsx';

interface ChangeSetPropertyProps {
  title: string;
  value: string | ReactNode;
  unit?: string;
  compact?: boolean;
  emphasised?: boolean;
}

export function ChangeSetProperty({
  title,
  value,
  unit = undefined,
  compact = false,
  emphasised = false,
}: ChangeSetPropertyProps) {
  return (
    <ChangeSetPropertyBase propertyName={title} compact={compact}>
      <ChangeSetValue value={value} unit={unit} emphasised={emphasised} />
    </ChangeSetPropertyBase>
  );
}
