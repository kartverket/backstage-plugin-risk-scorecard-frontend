import styles from './changeSet.module.css';

interface ChangeSetTextProps {
  text: string;
}

export function ChangeSetText({ text }: ChangeSetTextProps) {
  return <p className={styles.text}>{text}</p>;
}
