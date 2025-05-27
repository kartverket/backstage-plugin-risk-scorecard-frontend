import { ReactNode } from 'react';

interface ChangeSetTagsProps {
  children: ReactNode[] | ReactNode;
}

export function ChangeSetTags({ children }: ChangeSetTagsProps) {
  return (
    <div
      style={{
        marginBottom: '4px',
        display: 'flex',
        gap: '4px',
      }}
    >
      {children}
    </div>
  );
}
