import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetTagProps {
  text: string;
  type: 'primary' | 'delete' | 'added';
}

export function ChangeSetTag({ text, type }: ChangeSetTagProps) {
  const styles = useChangeSetStyles();
  const typeStyle = {
    primary: styles.tagPrimary,
    delete: styles.tagDelete,
    added: styles.tagAdded,
  };
  return <div className={`${styles.tag} ${typeStyle[type]}`}>{text}</div>;
}
