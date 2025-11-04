import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Text } from '@backstage/ui';
import { Tooltip } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../utils/translations';
import {
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions';
import styles from './UpdatedStatusBadge.module.css';

type Props = {
  status?: UpdatedStatusEnumType | null;
  isPending?: boolean;
};

export default function UpdatedStatusBadge({
  status,
  isPending = false,
}: Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  let ariaLabel: string | undefined;
  if (isPending) {
    ariaLabel = t('rosStatus.updated');
  } else if (status === UpdatedStatusEnum.VERY_OUTDATED) {
    ariaLabel = t('rosStatus.veryOutdated');
  } else if (status === UpdatedStatusEnum.OUTDATED) {
    ariaLabel = t('rosStatus.outdated');
  } else {
    ariaLabel = undefined;
  }

  if (isPending) {
    return (
      <span
        className={`${styles.badge} ${styles.pending}`}
        aria-label={ariaLabel}
      >
        <Text as="p">{t('rosStatus.updated')}</Text>
      </span>
    );
  }

  if (status === UpdatedStatusEnum.VERY_OUTDATED) {
    return (
      <Tooltip title={t('rosStatus.updatedStatus.tooltip.VERY_OUTDATED')}>
        <span
          className={`${styles.badge} ${styles.veryOutdated}`}
          aria-label={ariaLabel}
        >
          <Text as="p">{t('rosStatus.veryOutdated')}</Text>
        </span>
      </Tooltip>
    );
  }

  if (status === UpdatedStatusEnum.OUTDATED) {
    return (
      <Tooltip title={t('rosStatus.updatedStatus.tooltip.OUTDATED')}>
        <span
          className={`${styles.badge} ${styles.outdated}`}
          aria-label={ariaLabel}
        >
          <Text as="p">{t('rosStatus.outdated')}</Text>
        </span>
      </Tooltip>
    );
  }
  return null;
}
