import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetTextProps {
  text: string;
}

export function ChangeSetText({ text }: ChangeSetTextProps) {
  const { text: textStyle } = useChangeSetStyles();
  return <p className={textStyle}>{text}</p>;
}
