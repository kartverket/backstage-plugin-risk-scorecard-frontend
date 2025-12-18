import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Flex, Text } from '@backstage/ui';
import { Tooltip } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { UpdatedStatusEnumType } from '../../utils/utilityfunctions';
import styles from './UpdatedStatusBadgeV2.module.css';

type Props = {
  status?: UpdatedStatusEnumType | 'LOADING';
};

export function UpdatedStatusBadgeV2({ status }: Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  if (status === 'UPDATED') {
    return (
      <span className={`${styles.badge} ${styles.updated}`}>
        <Text as="p" className={styles.text}>
          {t('rosStatus.updated')}
        </Text>
      </span>
    );
  }

  if (status === 'LOADING') {
    return (
      <span className={`${styles.badge} ${styles.loading}`}>
        <Flex direction="row" gap="4px">
          <Text as="p" className={styles.text}>
            Lagrer...
          </Text>
        </Flex>
      </span>
    );
  }

  if (status === 'VERY_OUTDATED') {
    return (
      <Tooltip title={t('rosStatus.updatedStatus.tooltip.VERY_OUTDATED')}>
        <span className={`${styles.badge} ${styles.veryOutdated}`}>
          <Text as="p" className={styles.text}>
            {t('rosStatus.veryOutdated')}
          </Text>
        </span>
      </Tooltip>
    );
  }

  if (status === 'OUTDATED') {
    return (
      <Tooltip title={t('rosStatus.updatedStatus.tooltip.OUTDATED')}>
        <span className={`${styles.badge} ${styles.outdated}`}>
          <Text as="p" className={styles.text}>
            {t('rosStatus.outdated')}
          </Text>
        </span>
      </Tooltip>
    );
  }
  return null;
}
