import styles from './changeSetStyles.module.css';

interface ChangeSetTitleProps {
  text: string;
}

export function ChangeSetTitle({ text }: ChangeSetTitleProps) {
  return <div className={styles.title}>{text}</div>;
}
