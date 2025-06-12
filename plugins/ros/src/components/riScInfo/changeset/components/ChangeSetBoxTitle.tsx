import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetBoxTitleProps {
  title: string;
}

export function ChangeSetBoxTitle({ title }: ChangeSetBoxTitleProps) {
  const styles = useChangeSetStyles();
  return <div className={styles.boxTitle}>{title}</div>;
}
