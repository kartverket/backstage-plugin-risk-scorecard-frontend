import styles from './changeSet.module.css';

interface ChangeSetBoxTitleProps {
  title: string;
}

export function ChangeSetBoxTitle({ title }: ChangeSetBoxTitleProps) {
  return <div className={styles.boxTitle}>{title}</div>;
}
