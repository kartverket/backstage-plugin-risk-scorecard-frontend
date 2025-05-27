interface ChangeSetTagProps {
  text: string;
  type: 'primary' | 'delete'
}

export function ChangeSetTag({ text, type }: ChangeSetTagProps) {
  return (
    <div
      style={{
        backgroundColor: type === 'primary' ? '#FFDD9D' : '#FF6E60',
        borderRadius: '24px',
        width: 'fit-content',
        padding: '1px 8px',
        border: '1px solid',
        borderColor: type === 'primary' ? '#333333' : '#C43631',
        color: "#333333"
      }}
    >
      {text}
    </div>
  );
}
