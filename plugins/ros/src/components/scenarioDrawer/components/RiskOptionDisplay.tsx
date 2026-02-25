import { Flex } from '@backstage/ui';

export default function RiskOptionDisplay({
  isSelected,
  level,
  label,
}: {
  isSelected: boolean;
  level: number;
  label: string;
}) {
  return (
    <Flex align="center" gap="2">
      <div
        style={{
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '24px',
          height: '24px',
          minWidth: '24px',
          borderRadius: '50%',
          backgroundColor: isSelected
            ? 'var(--bui-bg-solid)'
            : 'transparent',
          border: '1px solid var(--bui-bg-solid)',
          color: isSelected ? 'var(--bui-fg-solid)' : 'var(--bui-bg-solid)',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        {level}
      </div>
      <span>{label}</span>
    </Flex>
  );
}
