import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
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

  if (isPending) {
    return (
      <i
        className={`ri-checkbox-circle-fill ${styles.updatedIcon}`}
        aria-label={t('rosStatus.updated')}
      />
    );
  }

  if (status === UpdatedStatusEnum.VERY_OUTDATED) {
    return (
      <Tooltip title={t('rosStatus.updatedStatus.tooltip.VERY_OUTDATED')}>
        <i
          className={`ri-error-warning-fill ${styles.veryOutdatedIcon}`}
          aria-label={t('rosStatus.veryOutdated')}
        />
      </Tooltip>
    );
  }

  if (status === UpdatedStatusEnum.OUTDATED) {
    return (
      <Tooltip title={t('rosStatus.updatedStatus.tooltip.OUTDATED')}>
        <i
          className={`ri-error-warning-fill ${styles.outdatedIcon}`}
          aria-label={t('rosStatus.outdated')}
        />
      </Tooltip>
    );
  }
  return <i className={`ri-error-warning-fill ${styles.emptyIcon}`} />;
}
