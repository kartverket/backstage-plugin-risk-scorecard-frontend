import styles from './changeSetStyles.module.css';

interface ChangeSetTextProps {
  text: string;
}

export function ChangeSetText({ text }: ChangeSetTextProps) {
  return <p className={styles.text}>{text}</p>;
}
