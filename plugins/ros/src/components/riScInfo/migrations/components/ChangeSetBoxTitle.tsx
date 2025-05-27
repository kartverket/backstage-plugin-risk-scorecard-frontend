import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetBoxTitleProps {
  title: string;
}

export function ChangeSetBoxTitle({ title }: ChangeSetBoxTitleProps) {
  const { boxTitle } = useChangeSetStyles();
  return <div className={boxTitle}>{title}</div>;
}
