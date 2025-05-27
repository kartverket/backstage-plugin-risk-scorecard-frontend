interface ChangeSetChangedValueProps {
  property: string;
  oldValue: string;
  newValue: string;
  denominator?: string;
}

export function ChangeSetChangedValue({
  property,
  oldValue,
  newValue,
  denominator,
}: ChangeSetChangedValueProps) {
  return (
    <div style={{ color: '#333333' }}>
      <span style={{ fontWeight: '700' }}>
        {property}:
      </span>{' '}
      <span
        style={{
          fontWeight: '700',
          color: '#D04A14',
          textDecoration: 'line-through',
        }}
      >
        {oldValue}
      </span>{' '}
      <span style={{ fontWeight: '700', color: '#156630' }}>{newValue}</span>
      {denominator && (
        <>
          {' '}
          <span>{denominator}</span>
        </>
      )}
    </div>
  );
}
