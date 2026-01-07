import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Tooltip } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { UpdatedStatusEnumType } from '../../utils/utilityfunctions';
import styles from './UpdatedStatusBadge.module.css';
import CircularProgress from '@mui/material/CircularProgress';

type UpdatedStatusBadgeProps = {
  status?: UpdatedStatusEnumType | 'UPDATING' | 'NONE';
};

export function UpdatedStatusBadge(props: UpdatedStatusBadgeProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  if (props.status === 'UPDATED') {
    return (
      <Tooltip title={t('rosStatus.updated')}>
        <i
          className={`ri-checkbox-circle-fill ${styles.updatedIcon} ${styles.iconBase}`}
          aria-label={t('rosStatus.updated')}
        />
      </Tooltip>
    );
  }

  if (props.status === 'UPDATING') {
    return (
      <Tooltip title={t('rosStatus.updating')}>
        <CircularProgress size="32px" />
      </Tooltip>
    );
  }

  if (props.status === 'VERY_OUTDATED') {
    return (
      <Tooltip title={t('rosStatus.updatedStatus.tooltip.VERY_OUTDATED')}>
        <i
          className={`ri-error-warning-fill ${styles.veryOutdatedIcon} ${styles.iconBase}`}
          aria-label={t('rosStatus.veryOutdated')}
        />
      </Tooltip>
    );
  }

  if (props.status === 'OUTDATED') {
    return (
      <Tooltip title={t('rosStatus.updatedStatus.tooltip.OUTDATED')}>
        <i
          className={`ri-error-warning-fill ${styles.outdatedIcon} ${styles.iconBase}`}
          aria-label={t('rosStatus.outdated')}
        />
      </Tooltip>
    );
  }
  return (
    <i
      className={`ri-error-warning-fill ${styles.emptyIcon} ${styles.iconBase}`}
    />
  );
}
