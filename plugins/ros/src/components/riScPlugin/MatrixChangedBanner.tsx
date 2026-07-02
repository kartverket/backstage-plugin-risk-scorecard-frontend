import { Flex, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import styles from './MatrixChangedBanner.module.css';

export function MatrixChangedBanner() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Flex className={styles.banner} direction="column" align="start" gap="1">
      <Flex align="center" gap="2">
        <i className={`ri-alert-line ${styles.icon}`} aria-hidden />
        <Text as="h4" variant="body-large" weight="bold">
          {t('matrixChangedBanner.title')}
        </Text>
      </Flex>
      <Text as="p" variant="body-medium">
        {t('matrixChangedBanner.description')}
      </Text>
    </Flex>
  );
}
