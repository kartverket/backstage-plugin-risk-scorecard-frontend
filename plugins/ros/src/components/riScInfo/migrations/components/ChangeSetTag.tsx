import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetTagProps {
  text: string;
  type: 'primary' | 'delete';
}

export function ChangeSetTag({ text, type }: ChangeSetTagProps) {
  const { tag, tagPrimary, tagDelete } = useChangeSetStyles();
  return (
    <div className={`${tag} ${type === 'primary' ? tagPrimary : tagDelete}`}>
      {text}
    </div>
  );
}
