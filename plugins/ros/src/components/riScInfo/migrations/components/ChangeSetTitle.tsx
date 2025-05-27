interface ChangeSetTitleProps {
  text: string;
}

export function ChangeSetTitle({ text }: ChangeSetTitleProps) {
  return (
    <div
      style={{
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: '#333333',
        fontWeight: '700',
        fontSize: '14px',
        marginBottom: '12px',
      }}
    >
      {text}
    </div>
  );
}
