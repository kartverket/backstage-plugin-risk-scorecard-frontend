import { ReactNode } from 'react';
import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetTagsProps {
  children: ReactNode[] | ReactNode;
}

export function ChangeSetTags({ children }: ChangeSetTagsProps) {
  const { tags } = useChangeSetStyles();
  return <div className={tags}>{children}</div>;
}
