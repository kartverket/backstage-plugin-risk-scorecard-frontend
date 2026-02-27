import { Flex } from '@backstage/ui';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './Spinner.module.css';

export function Spinner({ size }: { size?: string | number }) {
  return (
    <Flex align="start" justify="center" className={styles.container}>
      <CircularProgress size={size} className={styles.progress} />
    </Flex>
  );
}
