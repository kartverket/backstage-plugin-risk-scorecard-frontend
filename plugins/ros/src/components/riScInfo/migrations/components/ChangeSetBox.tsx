import { ReactNode } from 'react';
import { useChangeSetStyles } from './changeSetStyles.ts';

interface ChangeSetBoxProps {
  type: 'primary' | 'secondary'
  children: ReactNode[] | ReactNode;
}

export function ChangeSetBox({ children, type }: ChangeSetBoxProps) {
  const {box, boxPrimary, boxSecondary} = useChangeSetStyles()

  return (
    <div
      className={`${box} ${type === 'primary' ? boxPrimary : boxSecondary}`}
    >
      {children}
    </div>
  );
}
