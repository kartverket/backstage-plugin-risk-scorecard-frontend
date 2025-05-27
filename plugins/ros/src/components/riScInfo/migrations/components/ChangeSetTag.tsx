import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetTagProps {
  text: string;
  type: 'primary' | 'delete';
}

export function ChangeSetTag({ text, type }: ChangeSetTagProps) {
  const styles = useChangeSetStyles();
  return (
    <div
      className={`${styles.tag} ${type === 'primary' ? styles.tagPrimary : styles.tagDelete}`}
    >
      {text}
    </div>
  );
}
