import { SimpleTrackedProperty } from '../../../../utils/types.ts';
import { ChangeSetProperty } from './ChangeSetProperty.tsx';
import { ChangeSetChangedProperty } from './ChangeSetChangedProperty.tsx';

interface IChangeSetTrackedProperty {
  title: string;
  property?: SimpleTrackedProperty<any>;
  multiline?: boolean;
  stringOnUndefinedProperty?: string;
  compact?: boolean;
  unit?: string;
  emphasised?: boolean;
  valueFormatter?: (value: any) => any,
}

export function ChangeSetTrackedProperty({
  title,
  property,
  multiline = false,
  compact = false,
  unit = undefined,
  stringOnUndefinedProperty,
  emphasised = false,
  valueFormatter = (value: string) => value
}: IChangeSetTrackedProperty) {
  if (property === undefined) return <></>;

  if (property.type === 'UNCHANGED')
    return (
      <ChangeSetProperty
        title={title}
        value={property.value ? valueFormatter(property.value) : stringOnUndefinedProperty}
        compact={compact}
        unit={unit}
        emphasised={emphasised}
      />
    );
  if (property.type === 'CHANGED')
    return (
      <ChangeSetChangedProperty
        propertyName={title}
        oldValue={
          property.oldValue ? (
            valueFormatter(property.oldValue)
          ) : (
            <i>{stringOnUndefinedProperty}</i>
          )
        }
        newValue={
          property.newValue ? (
            valueFormatter(property.newValue)
          ) : (
            <i>{stringOnUndefinedProperty}</i>
          )
        }
        compact={compact}
        unit={unit}
        multiline={multiline}
      />
    );

  return <></>;
}
