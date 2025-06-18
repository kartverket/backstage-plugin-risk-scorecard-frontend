import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetBodyTextProps {
  text: string;
}

export function ChangeSetBodyText({ text }: ChangeSetBodyTextProps) {
  const styles = useChangeSetStyles();
  return <p className={styles.bodyText}>{text}</p>;
}
