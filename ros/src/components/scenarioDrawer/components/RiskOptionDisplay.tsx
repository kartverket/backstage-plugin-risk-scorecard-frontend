import { Flex } from '@backstage/ui';
import styles from './RiskOptionDisplay.module.css';

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
        className={`${styles.levelBadge} ${isSelected ? styles.levelBadgeSelected : ''}`}
      >
        {level}
      </div>
      <span>{label}</span>
    </Flex>
  );
}
