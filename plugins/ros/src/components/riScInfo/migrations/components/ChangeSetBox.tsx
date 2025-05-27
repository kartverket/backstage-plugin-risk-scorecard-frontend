import { ReactNode } from 'react';

interface ChangeSetBoxProps {
  type: 'primary' | 'secondary'
  children: ReactNode[] | ReactNode;
}

export function ChangeSetBox({ children, type }: ChangeSetBoxProps) {
  return (
    <div
      style={{
        backgroundColor: type === 'primary' ? '#FCEBCD' : '#FFFFFF',
        color: '#333333',
        padding: '14px 18px',
        marginBottom: type === 'primary' ? '24px' : '12px',
        height: '100%',
        borderRadius: '24px',
      }}
    >
      {children}
    </div>
  );
}
