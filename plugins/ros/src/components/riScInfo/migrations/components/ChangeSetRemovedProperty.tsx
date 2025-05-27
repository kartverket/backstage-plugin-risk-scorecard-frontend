interface ChangeSetRemovedPropertyProps {
  propertyName: string;
  value: string;
}

export function ChangeSetRemovedProperty({
  propertyName,
  value,
}: ChangeSetRemovedPropertyProps) {
  return (
    <div
      style={{
        color: '#D04A14',
        textDecoration: 'line-through',
        marginBottom: '8px',
      }}
    >
      <div style={{ fontWeight: '700', fontSize: '18px', lineHeight: '26px' }}>
        {propertyName}
      </div>
      <div style={{ fontWeight: '500', fontSize: '14px' }}>{value}</div>
    </div>
  );
}
