import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetTitleProps {
  text: string;
}

export function ChangeSetTitle({ text }: ChangeSetTitleProps) {
  const styles = useChangeSetStyles();
  return <div className={styles.title}>{text}</div>;
}
