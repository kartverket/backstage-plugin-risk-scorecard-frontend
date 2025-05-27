import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetTitleProps {
  text: string;
}

export function ChangeSetTitle({ text }: ChangeSetTitleProps) {
  const { title } = useChangeSetStyles();
  return <div className={title}>{text}</div>;
}
