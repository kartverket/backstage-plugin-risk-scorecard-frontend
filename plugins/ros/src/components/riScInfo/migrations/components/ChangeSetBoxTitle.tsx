interface ChangeSetBoxTitleProps {
  title: string;
}

export function ChangeSetBoxTitle({ title }: ChangeSetBoxTitleProps) {
  return (
    <div
      style={{
        fontSize: '18px',
        fontWeight: '700',
        lineHeight: '26px',
        marginBottom: '12px',
      }}
    >
      {title}
    </div>
  );
}
