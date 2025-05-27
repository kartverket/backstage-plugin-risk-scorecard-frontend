interface ChangeSetTagProps {
  text: string;
}

export function ChangeSetTag({ text }: ChangeSetTagProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFDD9D',
        borderRadius: '24px',
        width: 'fit-content',
        padding: '1px 8px',
        border: '1px solid #333',
        marginBottom: '4px',
      }}
    >
      {text}
    </div>
  );
}
