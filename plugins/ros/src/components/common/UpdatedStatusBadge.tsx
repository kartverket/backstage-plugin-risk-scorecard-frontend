import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Flex, Text } from '@backstage/ui';
import { Tooltip } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { UpdatedStatusEnumType } from '../../utils/utilityfunctions';
import styles from './UpdatedStatusBadge.module.css';

type UpdatedStatusBadgeProps = {
  status?: UpdatedStatusEnumType | 'UPDATING' | 'NONE';
};

export function UpdatedStatusBadge(props: UpdatedStatusBadgeProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  if (props.status === 'UPDATED') {
    return (
      <span
        className={`${styles.badge} ${styles.updated}`}
        aria-label={t('rosStatus.updated')}
      >
        <Text as="p" className={styles.text}>
          {t('rosStatus.updated')}
        </Text>
      </span>
    );
  }

  if (props.status === 'UPDATING') {
    return (
      <span
        className={`${styles.badge} ${styles.updating}`}
        aria-label={t('rosStatus.updating')}
      >
        <Flex direction="row" gap="4px">
          <Text as="p" className={styles.text}>
            {t('rosStatus.updating')}
          </Text>
        </Flex>
      </span>
    );
  }

  if (props.status === 'VERY_OUTDATED') {
    return (
      <Tooltip title={t('rosStatus.updatedStatus.tooltip.VERY_OUTDATED')}>
        <span
          className={`${styles.badge} ${styles.veryOutdated}`}
          aria-label={t('rosStatus.veryOutdated')}
        >
          <Text as="p" className={styles.text}>
            {t('rosStatus.veryOutdated')}
          </Text>
        </span>
      </Tooltip>
    );
  }

  if (props.status === 'OUTDATED') {
    return (
      <Tooltip title={t('rosStatus.updatedStatus.tooltip.OUTDATED')}>
        <span
          className={`${styles.badge} ${styles.outdated}`}
          aria-label={t('rosStatus.outdated')}
        >
          <Text as="p" className={styles.text}>
            {t('rosStatus.outdated')}
          </Text>
        </span>
      </Tooltip>
    );
  }
  return null;
}
