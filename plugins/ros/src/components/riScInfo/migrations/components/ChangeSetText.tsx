interface ChangeSetTextProps {
  text: string;
}

export function ChangeSetText({ text }: ChangeSetTextProps) {
  return <p style={{ fontWeight: '500', color: "#333333" }}>{text}</p>;
}
