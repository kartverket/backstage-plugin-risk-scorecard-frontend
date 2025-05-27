import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetTextProps {
  text: string;
}

export function ChangeSetText({ text }: ChangeSetTextProps) {
  const styles = useChangeSetStyles();
  return <p className={styles.text}>{text}</p>;
}
